from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from ..model.predict import predict_crop

router = APIRouter()

class SoilData(BaseModel):
    nitrogen: float
    phosphorous: float
    potassium: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

class CropPrediction(BaseModel):
    recommended_crops: List[str]
    confidence_scores: List[float]
    soil_health_score: float
    additional_recommendations: Optional[str] = None

@router.post("/predict", response_model=CropPrediction)
async def predict(soil_data: SoilData):
    try:
        result = predict_crop(
            nitrogen=soil_data.nitrogen,
            phosphorous=soil_data.phosphorous,
            potassium=soil_data.potassium,
            temperature=soil_data.temperature,
            humidity=soil_data.humidity,
            ph=soil_data.ph,
            rainfall=soil_data.rainfall
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 