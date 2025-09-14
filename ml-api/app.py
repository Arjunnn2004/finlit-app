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
            
            # Make prediction
            prediction = self.model.predict(features_scaled, verbose=0)
            base_coins = max(1, min(50, int(prediction[0][0])))
            
            # Apply intelligent adjustments based on spending patterns
            final_coins = self.apply_smart_adjustments(expense_data, base_coins)
            
            # Calculate confidence based on model uncertainty
            confidence = self.calculate_confidence(features_scaled)
            
            # Analyze factors
            factors = self.analyze_factors(expense_data, final_coins)
            
            return {
                "coins": final_coins,
                "confidence": confidence,
                "factors": factors,
                "breakdown": {
                    "base_prediction": float(prediction[0][0]),
                    "base_coins": base_coins,
                    "final_coins": final_coins,
                    "method": "tensorflow"
                }
            }
        except Exception as e:
            print(f"Prediction error: {e}")
            return self.fallback_prediction(expense_data)
    
    def apply_smart_adjustments(self, expense_data, base_coins):
        """Apply intelligent adjustments based on spending behavior"""
        amount = float(expense_data.get('amount', 0))
        category = expense_data.get('category', 'other')
        budget_ratio = expense_data.get('budget_ratio', 0.5)
        
        # Define category priorities (higher = more essential)
        category_priorities = {
            'healthcare': 1.0,     # Essential
            'education': 0.95,     # Very important
            'savings': 0.9,        # Very important
            'food': 0.85,          # Important but can overspend
            'utilities': 0.8,      # Important
            'transportation': 0.7,  # Moderately important
            'other': 0.6,          # Neutral
            'shopping': 0.4,       # Less important
            'travel': 0.3,         # Luxury
            'entertainment': 0.2   # Luxury
        }
        
        category_priority = category_priorities.get(category, 0.5)
        
        # Heavy penalty for overspending (budget_ratio > 0.8)
        if budget_ratio > 1.2:  # Severe overspending
            overspend_penalty = 0.2
        elif budget_ratio > 1.0:  # Overspending
            overspend_penalty = 0.4
        elif budget_ratio > 0.8:  # Near budget limit
            overspend_penalty = 0.7
        else:  # Within budget
            overspend_penalty = 1.0
        
        # Amount-based penalty (larger amounts should be more scrutinized)
        if amount > 200:
            amount_penalty = 0.5
        elif amount > 100:
            amount_penalty = 0.7
        elif amount > 50:
            amount_penalty = 0.9
        else:
            amount_penalty = 1.0
        
        # Combine all factors
        adjustment_factor = category_priority * overspend_penalty * amount_penalty
        
        # Apply adjustment
        adjusted_coins = int(base_coins * adjustment_factor)
        
        # Ensure minimum coins for any expense (even bad ones get 1 coin)
        return max(1, min(50, adjusted_coins))
    
    def fallback_prediction(self, expense_data):
        """Improved rule-based fallback when ML model fails"""
        try:
            amount = float(expense_data.get('amount', 0))
            category = expense_data.get('category', 'other')
            budget_ratio = expense_data.get('budget_ratio', 0.5)
            
            # Base coins by category (reflecting importance/necessity)
            category_base_coins = {
                'healthcare': 15,      # Essential - high reward
                'education': 14,       # Very important
                'savings': 13,         # Very important
                'food': 10,           # Important but can be overspent
                'utilities': 12,       # Important necessities
                'transportation': 8,   # Moderately important
                'other': 6,           # Neutral
                'shopping': 4,        # Less important
                'travel': 3,          # Luxury
                'entertainment': 2    # Luxury - lowest reward
            }
            
            base_coins = category_base_coins.get(category, 6)
            
            # Smart budget-based penalties
            if budget_ratio > 1.2:
                # Severe overspending - heavy penalty
                budget_penalty = 0.15
                penalty_msg = "severe_overspending"
            elif budget_ratio > 1.0:
                # Overspending - significant penalty
                budget_penalty = 0.3
                penalty_msg = "overspending"
            elif budget_ratio > 0.8:
                # Near limit - moderate penalty
                budget_penalty = 0.6
                penalty_msg = "near_budget_limit"
            elif budget_ratio > 0.6:
                # Good spending - slight bonus
                budget_penalty = 1.1
                penalty_msg = "good_spending"
            else:
                # Excellent spending - bonus
                budget_penalty = 1.2
                penalty_msg = "excellent_spending"
            
            # Amount-based modifier (larger amounts need more scrutiny)
            if amount > 200:
                amount_modifier = 0.4  # Large expense penalty
            elif amount > 100:
                amount_modifier = 0.6
            elif amount > 50:
                amount_modifier = 0.8
            elif amount > 20:
                amount_modifier = 1.0
            else:
                amount_modifier = 1.1  # Small expense bonus
            
            # Category-specific overspending penalties
            if budget_ratio > 0.8:
                if category in ['entertainment', 'travel', 'shopping']:
                    # Extra penalty for luxury overspending
                    luxury_penalty = 0.5
                elif category in ['food']:
                    # Moderate penalty for food overspending
                    luxury_penalty = 0.7
                else:
                    # Less penalty for essential overspending
                    luxury_penalty = 0.9
            else:
                luxury_penalty = 1.0
            
            # Calculate final coins
            final_coins = int(base_coins * budget_penalty * amount_modifier * luxury_penalty)
            final_coins = max(1, min(50, final_coins))
            
            return {
                "coins": final_coins,
                "confidence": "medium",
                "factors": {
                    "category_essential": category in ['healthcare', 'education', 'savings', 'utilities'],
                    "amount_reasonable": amount <= 100,
                    "within_budget": budget_ratio < 0.8,
                    "spending_behavior": penalty_msg
                },
                "breakdown": {
                    "base_coins": base_coins,
                    "budget_penalty": budget_penalty,
                    "amount_modifier": amount_modifier,
                    "luxury_penalty": luxury_penalty,
                    "final_coins": final_coins,
                    "method": "improved_fallback"
                }
            }
        except Exception as e:
            return {"coins": 1, "confidence": "low", "factors": {"error": True}}
    
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