# 🌾 Local Farmer Marketplace with Crop Forecast AI

A comprehensive platform connecting local farmers and buyers with AI-powered crop demand and price predictions, real-time weather integration, and secure payment processing.

## ✨ Key Features

### 👨‍🌾 For Farmers
- **Crop Management**: List and manage crop inventory with detailed information
- **AI Price Predictions**: Get ML-powered price forecasts based on weather and market data
- **Weather Integration**: Real-time weather data affecting crop prices
- **Order Management**: Track and manage incoming orders
- **Revenue Analytics**: Comprehensive dashboard with earnings insights

### 🛒 For Buyers
- **Smart Search**: Find crops by location, category, organic status, and price range
- **Direct Connection**: Connect directly with local farmers
- **Secure Payments**: Stripe-powered payment processing
- **Order Tracking**: Real-time order status updates
- **Multiple Delivery Options**: Pickup, local delivery, or shipping

### 🤖 AI & Technology
- **Price Prediction**: Machine learning models using Random Forest algorithms
- **Weather Impact Analysis**: Real-time weather data integration via OpenWeatherMap
- **Market Trend Analysis**: Sophisticated analysis of supply and demand patterns
- **Geospatial Search**: Location-based crop discovery

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + React Router
- **Backend**: Node.js + Express + MongoDB + JWT Authentication
- **AI Service**: FastAPI + scikit-learn + pandas + numpy
- **Weather API**: OpenWeatherMap integration
- **Payments**: Stripe payment processing
- **Deployment**: Docker + Docker Compose + Nginx

### Project Structure

```
farmer-marketplace/
├── 📁 backend/              # Node.js REST API
│   ├── 📁 models/           # MongoDB schemas (User, Crop, Order)
│   ├── 📁 routes/           # API endpoints
│   ├── 📁 middleware/       # Authentication & validation
│   ├── 📁 utils/           # Weather & payment services
│   └── server.js           # Express server setup
├── 📁 frontend/             # React application
│   ├── 📁 src/
│   │   ├── 📁 components/   # Reusable UI components
│   │   ├── 📁 pages/        # Route components
│   │   └── App.tsx         # Main application
│   └── tailwind.config.js  # Tailwind CSS config
├── 📁 ai-service/           # FastAPI microservice
│   ├── main.py             # AI prediction endpoints
│   └── requirements.txt    # Python dependencies
├── 📁 scripts/             # Setup and utility scripts
├── docker-compose.yml      # Multi-service orchestration
└── README.md              # This file
```

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd farmer-marketplace
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

2. **Start all services**:
   ```bash
   docker-compose up -d
   ```

3. **Access the application**:
   - **Frontend**: http://localhost:3000
   - **API Documentation**: http://localhost:5000/health
   - **AI Service**: http://localhost:8000/docs
   - **MongoDB**: mongodb://localhost:27017

### Option 2: Manual Setup

1. **Backend Setup**:
   ```bash
   cd backend
   cp .env.example .env  # Configure your environment
   npm install
   npm run dev
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **AI Service Setup**:
   ```bash
   cd ai-service
   python3 -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

4. **Database Setup**:
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in backend/.env

## ⚙️ Configuration

### Required Environment Variables

**Backend (.env)**:
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/farmer-marketplace
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
OPENWEATHER_API_KEY=your-openweather-api-key
STRIPE_SECRET_KEY=sk_test_your-stripe-key
AI_SERVICE_URL=http://localhost:8000
```

**AI Service (.env)**:
```bash
PORT=8000
ENVIRONMENT=development
OPENWEATHER_API_KEY=your-openweather-api-key
BACKEND_API_URL=http://localhost:5000
```

### API Keys Setup

1. **OpenWeatherMap**: Get free API key at [openweathermap.org](https://openweathermap.org/api)
2. **Stripe**: Get test keys at [stripe.com](https://dashboard.stripe.com/apikeys)

## 📚 API Documentation

### Backend API Endpoints

- **Authentication**: `POST /api/auth/login`, `POST /api/auth/register`
- **Crops**: `GET /api/crops`, `POST /api/crops`, `GET /api/crops/:id`
- **Farmers**: `GET /api/farmers`, `GET /api/farmers/dashboard`
- **Orders**: `GET /api/orders`, `POST /api/orders`
- **Predictions**: `GET /api/predictions/:cropId`

### AI Service Endpoints

- **Price Prediction**: `POST /predict/price`
- **Market Analysis**: `GET /crops/{crop_name}/market-analysis`
- **Health Check**: `GET /health`
- **Interactive Docs**: `GET /docs`

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# AI service tests
cd ai-service && python -m pytest
```

## 🚀 Deployment

### Production Deployment

1. **Update environment variables** for production
2. **Build and deploy**:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### Key Production Considerations

- Use strong JWT secrets and database passwords
- Configure CORS for your production domain
- Set up SSL certificates
- Use production Stripe keys
- Configure MongoDB with authentication
- Set up monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@farmmarketplace.com

---

**Built with ❤️ for sustainable agriculture and local food systems** 🌱
