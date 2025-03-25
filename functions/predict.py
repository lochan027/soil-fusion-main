from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
import numpy as np
from joblib import load
import traceback

# Load model and scaler
current_dir = os.path.dirname(os.path.abspath(__file__))
model = load(os.path.join(current_dir, '../model/model.pkl'))
scaler = load(os.path.join(current_dir, '../model/scaler.pkl'))

def calculate_soil_health_score(nitrogen, phosphorous, potassium, ph):
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
    return float(n_score * 0.25 + p_score * 0.25 + k_score * 0.25 + ph_score * 0.25)

def get_recommendations(soil_health_score, ph):
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

def handler(event, context):
    """Netlify Function handler"""
    # Only allow POST requests
    if event['httpMethod'] != 'POST':
        return {
            'statusCode': 405,
            'body': json.dumps({'error': 'Method not allowed'})
        }

    try:
        # Parse request body
        body = json.loads(event['body'])
        
        # Extract parameters
        nitrogen = float(body.get('nitrogen', 0))
        phosphorous = float(body.get('phosphorous', 0))
        potassium = float(body.get('potassium', 0))
        temperature = float(body.get('temperature', 0))
        humidity = float(body.get('humidity', 0))
        ph = float(body.get('ph', 0))
        rainfall = float(body.get('rainfall', 200))  # Default value

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
        confidence_scores = [float(probabilities[i]) for i in top_indices]
        
        # Calculate soil health score
        soil_health_score = calculate_soil_health_score(
            nitrogen, phosphorous, potassium, ph
        )
        
        # Get additional recommendations
        additional_recommendations = get_recommendations(soil_health_score, ph)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'recommended_crops': recommended_crops,
                'confidence_scores': confidence_scores,
                'soil_health_score': soil_health_score,
                'additional_recommendations': additional_recommendations
            })
        }
        
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        print(traceback.format_exc())
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Failed to make prediction',
                'details': str(e)
            })
        } 