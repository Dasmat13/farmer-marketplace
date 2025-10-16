const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  async getCurrentWeather(lat, lon) {
    try {
      if (!this.apiKey) {
        throw new Error('OpenWeather API key not configured');
      }

      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return {
        temperature: response.data.main.temp,
        humidity: response.data.main.humidity,
        precipitation: response.data.rain ? response.data.rain['1h'] || 0 : 0,
        windSpeed: response.data.wind.speed,
        description: response.data.weather[0].description,
        conditions: response.data.weather[0].main
      };
    } catch (error) {
      console.error('Weather API error:', error.message);
      
      // Return mock data if API fails
      return this.getMockWeatherData();
    }
  }

  async getWeatherForecast(lat, lon, days = 5) {
    try {
      if (!this.apiKey) {
        throw new Error('OpenWeather API key not configured');
      }

      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      // Process 5-day forecast data
      const forecast = response.data.list.slice(0, days * 8).map(item => ({
        date: new Date(item.dt * 1000),
        temperature: item.main.temp,
        humidity: item.main.humidity,
        precipitation: item.rain ? item.rain['3h'] || 0 : 0,
        windSpeed: item.wind.speed,
        description: item.weather[0].description
      }));

      return forecast;
    } catch (error) {
      console.error('Weather forecast error:', error.message);
      
      // Return mock forecast data if API fails
      return this.getMockForecastData(days);
    }
  }

  getMockWeatherData() {
    return {
      temperature: 22.5,
      humidity: 65,
      precipitation: 0.5,
      windSpeed: 7.2,
      description: 'partly cloudy',
      conditions: 'Clouds'
    };
  }

  getMockForecastData(days = 5) {
    const forecast = [];
    const baseDate = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date,
        temperature: 20 + Math.random() * 10,
        humidity: 60 + Math.random() * 20,
        precipitation: Math.random() * 2,
        windSpeed: 5 + Math.random() * 5,
        description: 'partly cloudy'
      });
    }
    
    return forecast;
  }

  async getWeatherImpactScore(lat, lon) {
    try {
      const weather = await this.getCurrentWeather(lat, lon);
      let impact = 1.0; // Neutral impact

      // Temperature impact
      if (weather.temperature < 5 || weather.temperature > 35) {
        impact += 0.15; // Extreme temperatures increase prices
      }

      // Precipitation impact
      if (weather.precipitation > 5) {
        impact += 0.1; // Heavy rain can affect supply
      } else if (weather.precipitation < 0.1) {
        impact += 0.05; // Drought conditions
      }

      // Wind impact
      if (weather.windSpeed > 15) {
        impact += 0.05; // High winds can affect harvesting
      }

      return Math.min(impact, 1.5); // Cap at 50% increase
    } catch (error) {
      console.error('Weather impact calculation error:', error.message);
      return 1.0; // Return neutral impact on error
    }
  }
}

module.exports = new WeatherService();
