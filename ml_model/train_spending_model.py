import tensorflow as tf
from tensorflow import keras
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
import joblib
import json
import datetime

class SpendingBehaviorModel:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.category_encoder = LabelEncoder()

    def load_data_from_csv(self, csv_path):
        """
        Load expense data from a CSV file and return as a list of dicts
        CSV must have: amount, category, timestamp, spending_velocity,
                       category_frequency, budget_ratio, budget_adherence
        """
        df = pd.read_csv(csv_path, parse_dates=["timestamp"])
        # Ensure correct dtypes
        df["category"] = df["category"].astype(str)

        data = []
        for _, row in df.iterrows():
            expense = {
                "amount": float(row["amount"]),
                "category": row["category"],
                "timestamp": row["timestamp"].to_pydatetime()
                    if isinstance(row["timestamp"], pd.Timestamp)
                    else datetime.datetime.fromisoformat(row["timestamp"]),
                "spending_velocity": float(row["spending_velocity"]),
                "category_frequency": float(row["category_frequency"]),
                "budget_ratio": float(row["budget_ratio"]),
                "budget_adherence": float(row["budget_adherence"])
            }
            data.append(expense)
        return data

    def prepare_features(self, data):
        features = []
        for expense in data:
            amount = expense["amount"]
            category_encoded = self.category_encoder.transform([expense["category"]])[0]
            ts = expense["timestamp"]
            hour = ts.hour
            day_of_week = ts.weekday()
            month = ts.month
            spending_velocity = expense.get("spending_velocity", 0)
            category_frequency = expense.get("category_frequency", 0)
            budget_ratio = expense.get("budget_ratio", 0.5)
            features.append([
                amount, category_encoded, hour, day_of_week, month,
                spending_velocity, category_frequency, budget_ratio
            ])
        return np.array(features)

    def prepare_labels(self, data):
        labels = []
        for expense in data:
            base_coins = 10
            healthy_categories = ['food', 'healthcare', 'education', 'savings', 'utilities']
            category_multiplier = 1.2 if expense["category"] in healthy_categories else 0.8
            amount_factor = 1.0 if expense["amount"] < 100 else 0.7
            hour = expense["timestamp"].hour
            time_factor = 1.0 if 6 <= hour <= 22 else 0.5
            budget_factor = expense.get("budget_adherence", 0.8)
            coin_reward = base_coins * category_multiplier * amount_factor * time_factor * budget_factor
            labels.append(coin_reward)
        return np.array(labels)

    def create_model(self, input_shape):# ANN
        model = keras.Sequential([
            keras.layers.Dense(64, activation='relu', input_shape=(input_shape,)),
            keras.layers.Dropout(0.3),
            keras.layers.Dense(32, activation='relu'),
            keras.layers.Dropout(0.2),
            keras.layers.Dense(16, activation='relu'),
            keras.layers.Dense(1, activation='linear')
        ])
        model.compile(optimizer='adam', loss='mse', metrics=['mae'])
        return model

    def train(self, training_data):
        X = self.prepare_features(training_data)
        y = self.prepare_labels(training_data)
        X_scaled = self.scaler.fit_transform(X)
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )
        self.model = self.create_model(X_train.shape[1])
        early_stopping = keras.callbacks.EarlyStopping(
            monitor='val_loss', patience=10, restore_best_weights=True
        )
        history = self.model.fit(
            X_train, y_train,
            epochs=100,
            batch_size=32,
            validation_data=(X_test, y_test),
            callbacks=[early_stopping],
            verbose=1
        )
        test_loss, test_mae = self.model.evaluate(X_test, y_test, verbose=0)
        print(f"Test Loss: {test_loss:.4f}, Test MAE: {test_mae:.4f}")
        return history

    def predict_coins(self, expense_data):
        if self.model is None:
            return 5
        features = self.prepare_features([expense_data])
        features_scaled = self.scaler.transform(features)
        prediction = self.model.predict(features_scaled, verbose=0)
        return max(1, min(50, int(prediction[0][0])))

    def save_model(self, path='ml_model/'):
        self.model.save(f'{path}spending_model.h5')
        joblib.dump(self.scaler, f'{path}scaler.pkl')
        joblib.dump(self.category_encoder, f'{path}category_encoder.pkl')
        metadata = {
            'version': '1.0',
            'features': ['amount','category','hour','day_of_week','month',
                         'spending_velocity','category_frequency','budget_ratio'],
            'categories': list(self.category_encoder.classes_)
        }
        with open(f'{path}model_metadata.json', 'w') as f:
            json.dump(metadata, f)

    def load_model(self, path='ml_model/'):
        self.model = keras.models.load_model(f'{path}spending_model.h5')
        self.scaler = joblib.load(f'{path}scaler.pkl')
        self.category_encoder = joblib.load(f'{path}category_encoder.pkl')


if __name__ == "__main__":
    csv_path = "finlit_expenses_dataset.csv" 
    model = SpendingBehaviorModel()

    # Load data from CSV
    training_data = model.load_data_from_csv(csv_path)

    # Fit category encoder with all categories present in the CSV
    categories = [exp["category"] for exp in training_data]
    model.category_encoder.fit(categories)

    # Train and save
    model.train(training_data)
    model.save_model()
    print("Model trained using CSV data and saved.")
