# Soil Fusion Backend

This is the backend service for the Soil Fusion project, providing crop recommendations based on soil parameters.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Train the model:
- Place your crop dataset in CSV format in the `app/model` directory
- Update the dataset path in `app/model/train.py`
- Run the training script:
```bash
python -m app.model.train
```

4. Start the server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### POST /api/v1/predict

Predicts suitable crops based on soil parameters.

Request body:
```json
{
    "nitrogen": 90,
    "phosphorous": 42,
    "potassium": 43,
    "temperature": 20.87,
    "humidity": 82.0,
    "ph": 6.5,
    "rainfall": 202.935
}
```

Response:
```json
{
    "recommended_crops": ["rice", "wheat", "maize"],
    "confidence_scores": [0.8, 0.15, 0.05],
    "soil_health_score": 85.5,
    "additional_recommendations": "Soil conditions are generally good."
}
```

## Dataset Format

The training dataset should be a CSV file with the following columns:
- N (Nitrogen)
- P (Phosphorous)
- K (Potassium)
- temperature
- humidity
- ph
- rainfall
- label (crop name)

## Model

The system uses a Random Forest Classifier for crop prediction, with the following features:
- Standardized input features
- Probability-based predictions
- Soil health scoring
- Additional recommendations based on soil parameters 