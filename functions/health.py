import json
from datetime import datetime

def handler(event, context):
    """Health check endpoint"""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'status': 'healthy',
            'version': '1.0.0',
            'timestamp': datetime.now().isoformat()
        })
    } 