import json
import requests
from datetime import datetime, timedelta
import os

# Cache for weather data
weather_cache = {}
CACHE_DURATION = timedelta(minutes=30)  # Cache weather data for 30 minutes

def get_cached_data(cache_key):
    """Get cached weather data if it exists and is not expired"""
    if cache_key in weather_cache:
        data, timestamp = weather_cache[cache_key]
        if datetime.now() - timestamp < CACHE_DURATION:
            return data
    return None

def cache_data(cache_key, data):
    """Cache weather data with current timestamp"""
    weather_cache[cache_key] = (data, datetime.now())

def fetch_weather_data(lat, lon):
    """Fetch weather data from weather.gov API"""
    headers = {
        'User-Agent': '(soil-fusion, contact@soilfusion.com)',
        'Accept': 'application/geo+json'
    }
    
    try:
        # First, get the grid points for the location
        points_url = f'https://api.weather.gov/points/{lat},{lon}'
        points_response = requests.get(points_url, headers=headers)
        points_data = points_response.json()
        
        if 'properties' not in points_data:
            raise Exception('Invalid response from weather.gov points API')
        
        # Get the forecast URL from the points response
        forecast_url = points_data['properties']['forecast']
        hourly_forecast_url = points_data['properties']['forecastHourly']
        
        # Get both regular and hourly forecasts
        forecast_response = requests.get(forecast_url, headers=headers)
        hourly_forecast_response = requests.get(hourly_forecast_url, headers=headers)
        
        forecast_data = forecast_response.json()
        hourly_forecast_data = hourly_forecast_response.json()
        
        # Extract relevant weather data
        current_conditions = hourly_forecast_data['properties']['periods'][0]
        daily_forecast = forecast_data['properties']['periods'][:7]  # Next 7 days
        
        return {
            'current': {
                'temperature': current_conditions['temperature'],
                'temperatureUnit': current_conditions['temperatureUnit'],
                'humidity': current_conditions.get('relativeHumidity', {}).get('value'),
                'windSpeed': current_conditions['windSpeed'],
                'windDirection': current_conditions['windDirection'],
                'shortForecast': current_conditions['shortForecast'],
                'detailedForecast': current_conditions.get('detailedForecast', ''),
                'timestamp': current_conditions['startTime']
            },
            'daily': [{
                'name': period['name'],
                'temperature': period['temperature'],
                'temperatureUnit': period['temperatureUnit'],
                'shortForecast': period['shortForecast'],
                'detailedForecast': period['detailedForecast'],
                'startTime': period['startTime'],
                'endTime': period['endTime']
            } for period in daily_forecast],
            'updated': datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Error fetching weather data: {str(e)}")
        raise

def handler(event, context):
    """Netlify Function handler for weather data"""
    # Handle OPTIONS request for CORS
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 204,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            }
        }
    
    # Only allow GET requests
    if event['httpMethod'] != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }

    try:
        # Get coordinates from query parameters
        params = event.get('queryStringParameters', {}) or {}
        lat = params.get('lat')
        lon = params.get('lon')
        
        if not lat or not lon:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Latitude and longitude are required'})
            }
        
        # Check cache first
        cache_key = f"{lat},{lon}"
        cached_data = get_cached_data(cache_key)
        
        if cached_data:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(cached_data)
            }
        
        # Fetch fresh weather data
        weather_data = fetch_weather_data(lat, lon)
        
        # Cache the data
        cache_data(cache_key, weather_data)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(weather_data)
        }
        
    except Exception as e:
        print(f"Weather API error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Failed to fetch weather data',
                'details': str(e)
            })
        } 