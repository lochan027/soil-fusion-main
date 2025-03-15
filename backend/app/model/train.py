import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib

def train_model(data_path):
    """
    Train the crop recommendation model using Random Forest Classifier
    """
    try:
        # Load and prepare data
        df = pd.read_csv(data_path)
        
        # Features and target
        X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
        y = df['crop']  # Assuming 'label' is the crop name column
        
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale the features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train the model
        model = RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            n_jobs=-1
        )
        model.fit(X_train_scaled, y_train)
        
        # Save the model and scaler
        joblib.dump(model, 'model.pkl')
        joblib.dump(scaler, 'scaler.pkl')
        
        # Calculate accuracy
        accuracy = model.score(X_test_scaled, y_test)
        print(f"Model accuracy: {accuracy:.2f}")
        
        return True
    except Exception as e:
        print(f"Error training model: {str(e)}")
        return False

if __name__ == "__main__":
    # Replace with your dataset path
    data_path = "/Users/logsyc/Desktop/soil-fusion-main/backend/app/dataset/Crop_recommendation.csv"
    train_model(data_path) 