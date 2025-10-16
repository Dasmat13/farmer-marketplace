# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

- `npm start` - Start development server on port 3000
- `npm run build` - Build production bundle
- `npm test` - Run Jest test suite in watch mode
- `npm test -- --coverage` - Run tests with coverage report
- `npm test -- ComponentName` - Run tests for specific component

## Architecture Overview

This is a React TypeScript frontend for a farmer marketplace application with AI-powered crop price predictions. Key architectural components:

### Core Application Structure

- **React Router**: Main navigation via `App.tsx` with routes for home, crops, dashboards, and auth
- **Layout Components**: `Header.tsx` and `Footer.tsx` provide consistent site structure
- **Page Components**: Home, CropsList, CropDetail, FarmerDashboard, BuyerDashboard, Login, Register

### AI Integration Layer

The application integrates with an external AI service for crop price predictions:

- **aiService.ts**: Core service layer that communicates with AI backend at port 8000
- **AIPrediction.tsx**: React component that displays AI predictions and market analysis
- **Service Health Monitoring**: Built-in health checks for AI service availability

Key AI service endpoints:
- `/predict/price` - Get price predictions with weather impact analysis
- `/crops/{name}/market-analysis` - Get market sentiment and volatility data
- `/health` - Service health status

### Styling Architecture

- **Tailwind CSS**: Utility-first CSS framework for styling
- **Custom Farm Theme**: Extended color palette in `tailwind.config.js` with `farm-green` variants
- **Responsive Design**: Mobile-first approach with responsive grid layouts

### Data Flow

1. User interactions trigger API calls through `aiService.ts`
2. CropData interfaces define expected data structures for AI predictions
3. Components display loading states, error handling, and fallbacks for AI service unavailability
4. Real-time health monitoring ensures graceful degradation when AI service is down

## Environment Configuration

- `REACT_APP_AI_SERVICE_URL` - URL for the AI service backend (defaults to http://localhost:8000)

## Key Dependencies

- React 19.2.0 with TypeScript
- React Router for navigation
- Axios for HTTP requests
- Lucide React for icons
- Tailwind CSS for styling
- Jest/React Testing Library for testing

## AI Service Integration Notes

The app expects an AI service running on port 8000 that provides crop price predictions based on weather data and market analysis. The frontend gracefully handles service unavailability by showing appropriate user messages and retry options.
