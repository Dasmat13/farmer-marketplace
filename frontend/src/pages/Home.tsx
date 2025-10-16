import React from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, Users, Truck } from 'lucide-react';
import AIPrediction from '../components/AIPrediction';
import SeasonalRecommendations from '../components/SeasonalRecommendations';
import RecipeRecommendations from '../components/RecipeRecommendations';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-farm-green-600 to-farm-green-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              🌾 Local Farm Marketplace
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-farm-green-100">
              Connecting farmers and buyers with AI-powered crop predictions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/crops"
                className="bg-white text-farm-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Browse Crops
              </Link>
              <Link
                to="/register"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-farm-green-600 transition-colors"
              >
                Join as Farmer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose FarmMarket?
            </h2>
            <p className="text-lg text-gray-600">
              Revolutionizing agriculture with smart technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-farm-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-farm-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Discovery</h3>
              <p className="text-gray-600">
                Find local crops and farmers with advanced search and filtering
              </p>
            </div>

            <div className="text-center">
              <div className="bg-farm-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-farm-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Predictions</h3>
              <p className="text-gray-600">
                Get weather-based demand and price predictions for better planning
              </p>
            </div>

            <div className="text-center">
              <div className="bg-farm-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-farm-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Direct Connection</h3>
              <p className="text-gray-600">
                Connect directly with local farmers, no middlemen
              </p>
            </div>

            <div className="text-center">
              <div className="bg-farm-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-farm-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Delivery</h3>
              <p className="text-gray-600">
                Multiple delivery options including pickup and local delivery
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-farm-green-600 mb-2">500+</div>
              <div className="text-lg text-gray-600">Active Farmers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-farm-green-600 mb-2">10k+</div>
              <div className="text-lg text-gray-600">Crops Listed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-farm-green-600 mb-2">50k+</div>
              <div className="text-lg text-gray-600">Orders Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Seasonal Recommendations Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🌱 Fresh Seasonal Picks
            </h2>
            <p className="text-lg text-gray-600">
              AI-curated seasonal crops at their peak quality and value
            </p>
          </div>
          
          <SeasonalRecommendations maxItems={4} />
        </div>
      </section>

      {/* Recipe Recommendations Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RecipeRecommendations 
            title="🍳 Recipe Inspirations" 
            maxResults={3}
          />
        </div>
      </section>

      {/* AI Demo Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🤖 AI-Powered Predictions Demo
            </h2>
            <p className="text-lg text-gray-600">
              See our live AI predictions for corn prices with weather impact analysis
            </p>
          </div>
          
          <AIPrediction 
            cropName="corn" 
            currentPrice={4.50} 
            location={{ city: "Des Moines", state: "Iowa" }}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-farm-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl mb-8 text-farm-green-100">
            Join thousands of farmers and buyers in our marketplace
          </p>
          <Link
            to="/register"
            className="bg-white text-farm-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Sign Up Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
