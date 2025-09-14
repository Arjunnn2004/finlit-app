import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ml_model')))
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
from tensorflow import keras
import joblib
import json
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Load the trained model
class MLModelService:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.category_encoder = None
        self.load_model()
    
    def load_model(self):
        # Get absolute path to the model directory (now inside ml-api)
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, 'ml_model', 'ml_model')
        
        print(f"Looking for model at: {model_path}")
        print(f"Model files exist: {os.path.exists(os.path.join(model_path, 'spending_model.h5'))}")
        
        try:
            # Try multiple approaches to load the model
            print("Attempting to load TensorFlow model...")
            
            # Check what files we have
            h5_path = os.path.join(model_path, 'spending_model.h5')
            print(f"H5 file exists: {os.path.exists(h5_path)}")
            
            # Approach 1: Load H5 with compatibility settings
            try:
                # Try with safe mode disabled and custom objects
                with tf.keras.utils.custom_object_scope({
                    'mse': tf.keras.losses.MeanSquaredError(),
                    'mean_squared_error': tf.keras.losses.MeanSquaredError(),
                    'mae': tf.keras.metrics.MeanAbsoluteError(),
                    'mean_absolute_error': tf.keras.metrics.MeanAbsoluteError(),
                }):
                    self.model = tf.keras.models.load_model(
                        h5_path,
                        compile=False,
                        safe_mode=False  # Disable safe mode for compatibility
                    )
                
                # Recompile with current TensorFlow version
                self.model.compile(
                    optimizer='adam',
                    loss='mse',
                    metrics=['mae']
                )
                print("Model loaded with H5 compatibility mode!")
                
            except Exception as e1:
                print(f"H5 compatibility approach failed: {e1}")
                
                # Approach 2: Recreate model architecture and load weights
                try:
                    print("Attempting to recreate model architecture...")
                    self.model = self._create_model_architecture()
                    self.model.load_weights(h5_path)
                    print("Model recreated and weights loaded!")
                    
                except Exception as e2:
                    print(f"Weight loading approach failed: {e2}")
                    raise e2
            
            # Load additional model components
            self.scaler = joblib.load(os.path.join(model_path, 'scaler.pkl'))
            self.category_encoder = joblib.load(os.path.join(model_path, 'category_encoder.pkl'))
            print("Model and components loaded successfully!")
            
        except Exception as e:
            print(f"Error loading model: {e}")
            print("Using fallback rule-based system")
            self.model = None
    
    def _create_model_architecture(self):
        """Recreate the model architecture for weight loading"""
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation='relu', input_shape=(8,)),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.Dense(1, activation='linear')
        ])
        
        model.compile(
            optimizer='adam',
            loss='mse',
            metrics=['mae']
        )
        
        return model
    
    def predict_coins(self, expense_data):
        if self.model is None:
            return self.fallback_prediction(expense_data)
        
        try:
            # Prepare features
            features = self.prepare_features(expense_data)
            features_scaled = self.scaler.transform([features])
            
            # Make prediction using YOUR trained neural network
            prediction = self.model.predict(features_scaled, verbose=0)
            ann_coins = max(1, min(50, int(prediction[0][0])))
            
            # Apply only minimal adjustments to preserve ANN intelligence
            final_coins = self.apply_minimal_adjustments(expense_data, ann_coins)
            
            # Calculate confidence based on model uncertainty
            confidence = self.calculate_confidence(features_scaled)
            
            # Analyze factors
            factors = self.analyze_factors(expense_data, final_coins)
            
            return {
                "coins": final_coins,
                "confidence": confidence,
                "factors": factors,
                "breakdown": {
                    "ann_prediction": float(prediction[0][0]),
                    "ann_coins": ann_coins,
                    "final_coins": final_coins,
                    "method": "neural_network_primary"
                }
            }
        except Exception as e:
            print(f"Prediction error: {e}")
            return self.fallback_prediction(expense_data)
    
    def apply_minimal_adjustments(self, expense_data, ann_coins):
        """Apply minimal adjustments to preserve ANN intelligence"""
        budget_ratio = expense_data.get('budget_ratio', 0.5)
        
        # Only apply adjustment for extreme overspending (let ANN handle most cases)
        if budget_ratio > 1.5:  # Only for very severe overspending
            # Slight penalty but trust the ANN mostly
            adjustment = 0.8
        elif budget_ratio > 1.2:  # Moderate overspending
            adjustment = 0.9
        else:
            # Trust the ANN completely for normal spending
            adjustment = 1.0
        
        # Apply minimal adjustment
        adjusted_coins = int(ann_coins * adjustment)
        
        # Ensure we stay in reasonable bounds
        return max(1, min(50, adjusted_coins))
    
    def apply_smart_adjustments(self, expense_data, base_coins):
        """Removed - keeping for compatibility but not used"""
        return base_coins
    
    def fallback_prediction(self, expense_data):
        """Simple fallback only when ANN fails - should rarely be used"""
        try:
            amount = float(expense_data.get('amount', 0))
            category = expense_data.get('category', 'other')
            budget_ratio = expense_data.get('budget_ratio', 0.5)
            
            # Simple category-based base coins (since ANN is not available)
            category_base_coins = {
                'healthcare': 12, 'education': 11, 'savings': 10,
                'food': 8, 'utilities': 7, 'transportation': 6,
                'other': 5, 'shopping': 4, 'travel': 3, 'entertainment': 2
            }
            
            base_coins = category_base_coins.get(category, 5)
            
            # Simple budget-based adjustment
            if budget_ratio > 1.0:
                budget_modifier = 0.5  # Overspending penalty
            else:
                budget_modifier = 1.0  # Normal spending
            
            final_coins = int(base_coins * budget_modifier)
            final_coins = max(1, min(50, final_coins))
            
            return {
                "coins": final_coins,
                "confidence": "low",
                "factors": {
                    "ann_unavailable": True,
                    "using_fallback": True,
                    "overspending": budget_ratio > 1.0
                },
                "breakdown": {
                    "base_coins": base_coins,
                    "budget_modifier": budget_modifier,
                    "method": "simple_fallback"
                }
            }
        except Exception as e:
            return {"coins": 1, "confidence": "very_low", "factors": {"error": True}}
    
    def prepare_features(self, expense_data):
        timestamp = datetime.fromisoformat(expense_data['timestamp'].replace('Z', '+00:00'))
        
        amount = expense_data['amount']
        category_encoded = self.category_encoder.transform([expense_data['category']])[0]
        hour = timestamp.hour
        day_of_week = timestamp.weekday()
        month = timestamp.month
        spending_velocity = expense_data.get('spending_velocity', 1.0)
        category_frequency = expense_data.get('category_frequency', 0.5)
        budget_ratio = expense_data.get('budget_ratio', 0.5)
        
        return [amount, category_encoded, hour, day_of_week, month,
                spending_velocity, category_frequency, budget_ratio]
    
    def calculate_confidence(self, features):
        # Simple confidence calculation based on feature values
        # In practice, you might use ensemble methods or dropout for uncertainty
        return "medium"
    
    def analyze_factors(self, expense_data, coins):
        healthy_categories = ['food', 'healthcare', 'education', 'savings', 'utilities']
        
        return {
            "category_health": expense_data['category'] in healthy_categories,
            "amount_reasonable": expense_data['amount'] < 100,
            "time_appropriate": 6 <= datetime.fromisoformat(expense_data['timestamp'].replace('Z', '+00:00')).hour <= 22,
            "within_budget": expense_data.get('budget_ratio', 0.5) < 0.8
        }

# Initialize ML service
ml_service = MLModelService()

@app.route('/predict-coins', methods=['POST'])
def predict_coins():
    try:
        expense_data = request.json
        result = ml_service.predict_coins(expense_data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy", 
        "model_loaded": ml_service.model is not None,
        "tensorflow_available": True,
        "endpoints": ["/predict-coins", "/health", "/test", "/categories"]
    })

@app.route('/test', methods=['GET'])
def test_prediction():
    """Test endpoint with sample data"""
    sample_data = {
        "amount": 25.50,
        "category": "food",
        "timestamp": datetime.now().isoformat(),
        "spending_velocity": 2.0,
        "category_frequency": 0.3,
        "budget_ratio": 0.4
    }
    
    result = ml_service.predict_coins(sample_data)
    return jsonify({
        "sample_input": sample_data,
        "prediction": result
    })

@app.route('/categories', methods=['GET'])
def get_categories():
    """Return available categories"""
    categories = [
        "food", "healthcare", "education", "savings", 
        "transportation", "utilities", "entertainment", 
        "shopping", "travel", "other"
    ]
    return jsonify({"categories": categories})

@app.route('/retrain', methods=['POST'])
def retrain_model():
    # Endpoint for retraining with new data
    # This would fetch data from Firebase and retrain the model
    return jsonify({"message": "Retraining not implemented yet"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)