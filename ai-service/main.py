from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import requests
import os
from dotenv import load_dotenv
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="Farm Marketplace AI Service",
    description="AI-powered crop price and demand predictions",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class WeatherData(BaseModel):
    temperature: float
    humidity: float
    precipitation: float
    wind_speed: float

class CropData(BaseModel):
    name: str
    category: str
    current_price: float
    location: Dict[str, Any]
    harvest_date: Optional[str] = None

class PredictionRequest(BaseModel):
    crop_data: CropData
    weather_data: Optional[WeatherData] = None
    prediction_days: int = 30

class PricePrediction(BaseModel):
    date: str
    predicted_price: float
    confidence: float
    demand_level: str

class PredictionResponse(BaseModel):
    crop_name: str
    current_price: float
    predictions: List[PricePrediction]
    weather_impact: str
    market_trend: str

# Mock historical data generator
def generate_mock_historical_data(crop_name: str, days: int = 365) -> pd.DataFrame:
    """Generate mock historical price and weather data for ML training"""
    end_date = datetime.now()
    dates = [end_date - timedelta(days=i) for i in range(days, 0, -1)]
    
    # Base price varies by crop type
    crop_base_prices = {
        "tomatoes": 3.50,
        "lettuce": 2.20,
        "carrots": 1.80,
        "corn": 4.50,
        "wheat": 6.00,
        "apples": 2.90,
        "potatoes": 1.50
    }
    
    base_price = crop_base_prices.get(crop_name.lower(), 3.00)
    
    # Generate synthetic data with trends and seasonality
    np.random.seed(42)  # For reproducibility
    
    data = []
    for i, date in enumerate(dates):
        # Seasonal factor (higher prices in winter)
        seasonal_factor = 1 + 0.2 * np.sin(2 * np.pi * i / 365 - np.pi/2)
        
        # Random weather factors
        temperature = 20 + 15 * np.sin(2 * np.pi * i / 365) + np.random.normal(0, 3)
        humidity = 60 + 20 * np.random.random()
        precipitation = max(0, np.random.normal(2, 1))
        wind_speed = 5 + 3 * np.random.random()
        
        # Weather impact on price
        weather_impact = 1.0
        if temperature < 5 or temperature > 35:  # Extreme temperatures
            weather_impact *= 1.1
        if precipitation > 5:  # Heavy rain
            weather_impact *= 1.05
        
        # Market trend (slight upward trend over time)
        trend_factor = 1 + 0.001 * i
        
        # Calculate price with noise
        price = base_price * seasonal_factor * weather_impact * trend_factor
        price += np.random.normal(0, 0.1 * price)  # Add noise
        price = max(0.1, price)  # Ensure positive price
        
        data.append({
            'date': date,
            'price': round(price, 2),
            'temperature': round(temperature, 1),
            'humidity': round(humidity, 1),
            'precipitation': round(precipitation, 2),
            'wind_speed': round(wind_speed, 1)
        })
    
    return pd.DataFrame(data)

def train_price_prediction_model(df: pd.DataFrame):
    """Train a simple price prediction model"""
    # Features: weather data and time-based features
    features = ['temperature', 'humidity', 'precipitation', 'wind_speed']
    df['day_of_year'] = df['date'].dt.dayofyear
    df['days_since_start'] = (df['date'] - df['date'].min()).dt.days
    
    features.extend(['day_of_year', 'days_since_start'])
    
    X = df[features]
    y = df['price']
    
    # Use RandomForest for better predictions
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    return model, features

def get_weather_data(location: Dict[str, Any]) -> WeatherData:
    """Fetch real weather data or return mock data"""
    # In production, integrate with OpenWeatherMap API
    # For now, return mock data
    return WeatherData(
        temperature=22.5,
        humidity=65.0,
        precipitation=0.5,
        wind_speed=7.2
    )

def determine_demand_level(price: float, base_price: float) -> str:
    """Determine demand level based on price relative to base price"""
    ratio = price / base_price
    if ratio > 1.15:
        return "high"
    elif ratio < 0.85:
        return "low"
    else:
        return "medium"

def analyze_market_trend(predictions: List[float]) -> str:
    """Analyze overall market trend from predictions"""
    if len(predictions) < 2:
        return "stable"
    
    start_price = np.mean(predictions[:3])
    end_price = np.mean(predictions[-3:])
    
    change_ratio = (end_price - start_price) / start_price
    
    if change_ratio > 0.05:
        return "increasing"
    elif change_ratio < -0.05:
        return "decreasing"
    else:
        return "stable"

@app.get("/")
async def root():
    return {
        "message": "🤖 Farm Marketplace AI Service",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/predict/price", response_model=PredictionResponse)
async def predict_crop_price(request: PredictionRequest):
    """Generate price predictions for a crop"""
    try:
        crop_data = request.crop_data
        prediction_days = min(request.prediction_days, 90)  # Limit to 90 days
        
        # Generate historical data for the crop
        logger.info(f"Generating predictions for {crop_data.name}")
        historical_data = generate_mock_historical_data(crop_data.name, days=365)
        
        # Train prediction model
        model, features = train_price_prediction_model(historical_data)
        
        # Get weather data
        if request.weather_data:
            weather = request.weather_data
        else:
            weather = get_weather_data(crop_data.location)
        
        # Generate predictions
        predictions = []
        current_date = datetime.now()
        
        for days_ahead in range(1, prediction_days + 1):
            prediction_date = current_date + timedelta(days=days_ahead)
            
            # Prepare features for prediction
            # In a real scenario, you'd need weather forecasts
            feature_values = [
                weather.temperature + np.random.normal(0, 1),  # Slight variation
                weather.humidity + np.random.normal(0, 2),
                weather.precipitation + np.random.normal(0, 0.2),
                weather.wind_speed + np.random.normal(0, 0.5),
                prediction_date.timetuple().tm_yday,  # day_of_year
                (prediction_date - historical_data['date'].min()).days  # days_since_start
            ]
            
            # Make prediction
            predicted_price = model.predict([feature_values])[0]
            predicted_price = max(0.1, predicted_price)  # Ensure positive
            
            # Calculate confidence (simplified)
            confidence = max(0.6, 0.95 - (days_ahead * 0.01))
            
            # Determine demand level
            demand = determine_demand_level(predicted_price, crop_data.current_price)
            
            predictions.append(PricePrediction(
                date=prediction_date.strftime("%Y-%m-%d"),
                predicted_price=round(predicted_price, 2),
                confidence=round(confidence, 2),
                demand_level=demand
            ))
        
        # Analyze weather impact
        avg_predicted_price = np.mean([p.predicted_price for p in predictions])
        if avg_predicted_price > crop_data.current_price * 1.1:
            weather_impact = "Favorable weather conditions may increase prices"
        elif avg_predicted_price < crop_data.current_price * 0.9:
            weather_impact = "Weather conditions may put downward pressure on prices"
        else:
            weather_impact = "Weather conditions show neutral impact on pricing"
        
        # Market trend analysis
        price_values = [p.predicted_price for p in predictions]
        market_trend = analyze_market_trend(price_values)
        
        return PredictionResponse(
            crop_name=crop_data.name,
            current_price=crop_data.current_price,
            predictions=predictions,
            weather_impact=weather_impact,
            market_trend=market_trend
        )
        
    except Exception as e:
        logger.error(f"Error generating predictions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/crops/{crop_name}/market-analysis")
async def get_market_analysis(crop_name: str):
    """Get market analysis for a specific crop"""
    try:
        # Generate mock market analysis
        historical_data = generate_mock_historical_data(crop_name, days=90)
        
        current_price = historical_data['price'].iloc[-1]
        avg_price_30d = historical_data['price'].tail(30).mean()
        price_volatility = historical_data['price'].tail(30).std()
        
        return {
            "crop_name": crop_name,
            "current_price": round(current_price, 2),
            "avg_price_30d": round(avg_price_30d, 2),
            "price_volatility": round(price_volatility, 2),
            "market_sentiment": "positive" if current_price > avg_price_30d else "negative",
            "supply_level": "medium",
            "demand_forecast": "stable"
        }
        
    except Exception as e:
        logger.error(f"Error in market analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
