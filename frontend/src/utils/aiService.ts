import axios from 'axios';
import { AI_SERVICE_URL } from './config';

export interface CropData {
  name: string;
  category: string;
  current_price: number;
  location: {
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
  };
  harvest_date?: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  wind_speed: number;
}

export interface PricePrediction {
  date: string;
  predicted_price: number;
  confidence: number;
  demand_level: string;
}

export interface PredictionResponse {
  crop_name: string;
  current_price: number;
  predictions: PricePrediction[];
  weather_impact: string;
  market_trend: string;
}

export interface MarketAnalysis {
  crop_name: string;
  current_price: number;
  avg_price_30d: number;
  price_volatility: number;
  market_sentiment: string;
  supply_level: string;
  demand_forecast: string;
}

const aiApi = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 30000,
});

export const getPricePrediction = async (
  cropData: CropData,
  weatherData?: WeatherData,
  predictionDays: number = 30
): Promise<PredictionResponse> => {
  try {
    const response = await aiApi.post('/predict/price', {
      crop_data: cropData,
      weather_data: weatherData,
      prediction_days: predictionDays
    });
    return response.data;
  } catch (error) {
    console.error('Error getting price prediction:', error);
    throw new Error('Failed to get price prediction');
  }
};

export const getMarketAnalysis = async (cropName: string): Promise<MarketAnalysis> => {
  try {
    const response = await aiApi.get(`/crops/${cropName}/market-analysis`);
    return response.data;
  } catch (error) {
    console.error('Error getting market analysis:', error);
    throw new Error('Failed to get market analysis');
  }
};

export const checkAIServiceHealth = async (): Promise<boolean> => {
  try {
    const response = await aiApi.get('/health');
    return response.data.status === 'healthy';
  } catch (error) {
    console.error('AI service health check failed:', error);
    return false;
  }
};
