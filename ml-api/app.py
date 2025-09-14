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
        model_path = '../ml_model/ml_model/'
        try:
            # Try multiple approaches to load the model
            print("Attempting to load TensorFlow model...")
            
            # Approach 1: Load with comprehensive custom objects
            try:
                custom_objects = {
                    'mse': tf.keras.losses.MeanSquaredError(),
                    'mean_squared_error': tf.keras.losses.MeanSquaredError(),
                    'mae': tf.keras.metrics.MeanAbsoluteError(),
                    'mean_absolute_error': tf.keras.metrics.MeanAbsoluteError(),
                }
                
                self.model = keras.models.load_model(
                    f'{model_path}spending_model.h5', 
                    custom_objects=custom_objects
                )
                print("Model loaded with custom objects approach!")
                
            except Exception as e1:
                print(f"Custom objects approach failed: {e1}")
                
                # Approach 2: Load without compilation and recompile
                try:
                    self.model = keras.models.load_model(
                        f'{model_path}spending_model.h5', 
                        compile=False
                    )
                    # Recompile the model with standard functions
                    self.model.compile(
                        optimizer='adam',
                        loss=tf.keras.losses.MeanSquaredError(),
                        metrics=[tf.keras.metrics.MeanAbsoluteError()]
                    )
                    print("Model loaded without compilation and recompiled!")
                    
                except Exception as e2:
                    print(f"No-compile approach failed: {e2}")
                    raise e2
            
            # Load additional model components
            self.scaler = joblib.load(f'{model_path}scaler.pkl')
            self.category_encoder = joblib.load(f'{model_path}category_encoder.pkl')
            print("Model and components loaded successfully!")
            
        except Exception as e:
            print(f"Error loading model: {e}")
            print("Using fallback rule-based system")
            self.model = None
    
    def predict_coins(self, expense_data):
        if self.model is None:
            return self.fallback_prediction(expense_data)
        
        try:
            # Prepare features
            features = self.prepare_features(expense_data)
            features_scaled = self.scaler.transform([features])
            
            # Make prediction
            prediction = self.model.predict(features_scaled, verbose=0)
            coins = max(1, min(50, int(prediction[0][0])))
            
            # Calculate confidence based on model uncertainty
            confidence = self.calculate_confidence(features_scaled)
            
            # Analyze factors
            factors = self.analyze_factors(expense_data, coins)
            
            return {
                "coins": coins,
                "confidence": confidence,
                "factors": factors,
                "breakdown": {
                    "base_prediction": float(prediction[0][0]),
                    "clamped_coins": coins,
                    "method": "tensorflow"
                }
            }
        except Exception as e:
            print(f"Prediction error: {e}")
            return self.fallback_prediction(expense_data)
    
    def fallback_prediction(self, expense_data):
        """Rule-based fallback when ML model fails"""
        try:
            amount = float(expense_data.get('amount', 0))
            category = expense_data.get('category', 'other')
            
            # Category-based base coins
            category_coins = {
                'food': 8, 'healthcare': 10, 'education': 12, 'savings': 15,
                'transportation': 7, 'utilities': 8, 'other': 5,
                'entertainment': 4, 'shopping': 3, 'travel': 5
            }
            
            base_coins = category_coins.get(category, 5)
            
            # Amount-based modifier
            if amount <= 20:
                amount_modifier = 1.2
            elif amount <= 50:
                amount_modifier = 1.0
            elif amount <= 100:
                amount_modifier = 0.8
            else:
                amount_modifier = 0.6
            
            # Budget ratio modifier
            budget_ratio = expense_data.get('budget_ratio', 0.5)
            if budget_ratio < 0.5:
                budget_modifier = 1.2
            elif budget_ratio < 0.8:
                budget_modifier = 1.0
            else:
                budget_modifier = 0.7
            
            final_coins = int(base_coins * amount_modifier * budget_modifier)
            final_coins = max(1, min(50, final_coins))
            
            return {
                "coins": final_coins,
                "confidence": "medium",
                "factors": {
                    "category_healthy": category in ['food', 'healthcare', 'education', 'savings'],
                    "amount_reasonable": amount <= 100,
                    "within_budget": budget_ratio < 0.8
                },
                "breakdown": {
                    "base_coins": base_coins,
                    "amount_modifier": amount_modifier,
                    "budget_modifier": budget_modifier,
                    "method": "fallback"
                }
            }
        except Exception as e:
            return {"coins": 5, "confidence": "low", "factors": {"error": True}}
    
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