import numpy as np
import joblib
from typing import Dict, List, Tuple
import os

# Get the directory of the current file
current_dir = os.path.dirname(os.path.abspath(__file__))

# Load the model and scaler
try:
    model = joblib.load(os.path.join(current_dir, 'model.pkl'))
    scaler = joblib.load(os.path.join(current_dir, 'scaler.pkl'))
except FileNotFoundError:
    print("Model files not found. Please train the model first.")
    model = None
    scaler = None

def calculate_soil_health_score(
    nitrogen: float,
    phosphorous: float,
    potassium: float,
    ph: float
) -> float:
    """Calculate soil health score based on nutrient levels and pH"""
    # Define ideal ranges
    ideal_ranges = {
        'N': (20, 140),
        'P': (10, 50),
        'K': (20, 200),
        'pH': (6.0, 7.5)
    }
    
    # Calculate individual scores
    n_score = 100 - min(100, abs(nitrogen - np.mean(ideal_ranges['N'])) / (ideal_ranges['N'][1] - ideal_ranges['N'][0]) * 100)
    p_score = 100 - min(100, abs(phosphorous - np.mean(ideal_ranges['P'])) / (ideal_ranges['P'][1] - ideal_ranges['P'][0]) * 100)
    k_score = 100 - min(100, abs(potassium - np.mean(ideal_ranges['K'])) / (ideal_ranges['K'][1] - ideal_ranges['K'][0]) * 100)
    ph_score = 100 - min(100, abs(ph - np.mean(ideal_ranges['pH'])) / (ideal_ranges['pH'][1] - ideal_ranges['pH'][0]) * 100)
    
    # Calculate weighted average
    return (n_score * 0.25 + p_score * 0.25 + k_score * 0.25 + ph_score * 0.25)

def get_recommendations(soil_health_score: float, ph: float) -> str:
    """Generate additional recommendations based on soil health score and pH"""
    recommendations = []
    
    if soil_health_score < 60:
        recommendations.append("Soil health needs improvement.")
        if ph < 6.0:
            recommendations.append("Consider adding lime to increase soil pH.")
        elif ph > 7.5:
            recommendations.append("Consider adding sulfur to decrease soil pH.")
    
    if soil_health_score < 40:
        recommendations.append("Urgent soil treatment recommended.")
    elif soil_health_score < 70:
        recommendations.append("Regular soil monitoring advised.")
    
    return " ".join(recommendations) if recommendations else "Soil conditions are generally good."

def predict_crop(
    nitrogen: float,
    phosphorous: float,
    potassium: float,
    temperature: float,
    humidity: float,
    ph: float,
    rainfall: float
) -> Dict:
    """
    Predict suitable crops based on soil and weather parameters
    """
    if model is None or scaler is None:
        return {
            "recommended_crops": ["Model not trained"],
            "confidence_scores": [0.0],
            "soil_health_score": 0.0,
            "additional_recommendations": "Error: Model not trained. Please train the model first."
        }

    try:
        # Prepare input data
        input_data = np.array([[
            nitrogen, phosphorous, potassium,
            temperature, humidity, ph, rainfall
        ]])
        
        # Scale the input
        input_scaled = scaler.transform(input_data)
        
        # Get prediction probabilities
        probabilities = model.predict_proba(input_scaled)[0]
        
        # Get top 3 predictions
        top_indices = np.argsort(probabilities)[-3:][::-1]
        recommended_crops = [model.classes_[i] for i in top_indices]
        confidence_scores = [probabilities[i] for i in top_indices]
        
        # Calculate soil health score
        soil_health_score = calculate_soil_health_score(
            nitrogen, phosphorous, potassium, ph
        )
        
        # Get additional recommendations
        additional_recommendations = get_recommendations(soil_health_score, ph)
        
        return {
            "recommended_crops": recommended_crops,
            "confidence_scores": [float(score) for score in confidence_scores],
            "soil_health_score": float(soil_health_score),
            "additional_recommendations": additional_recommendations
        }
        
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return {
            "recommended_crops": ["Error in prediction"],
            "confidence_scores": [0.0],
            "soil_health_score": 0.0,
            "additional_recommendations": f"Error: {str(e)}"
        } 