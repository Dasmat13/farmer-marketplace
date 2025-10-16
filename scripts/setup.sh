#!/bin/bash

echo "🌾 Setting up Local Farmer Marketplace..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment files from examples
echo "📝 Setting up environment files..."

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from example"
fi

if [ ! -f ai-service/.env ]; then
    cp ai-service/.env.example ai-service/.env
    echo "✅ Created ai-service/.env from example"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Setup Python virtual environment for AI service
echo "🐍 Setting up Python environment for AI service..."
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "   docker-compose up -d"
echo ""
echo "🌐 Access points:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   AI Service: http://localhost:8000"
echo "   MongoDB: mongodb://localhost:27017"
echo ""
echo "📖 Don't forget to:"
echo "   1. Update API keys in .env files"
echo "   2. Configure MongoDB connection"
echo "   3. Set up payment gateway credentials"
