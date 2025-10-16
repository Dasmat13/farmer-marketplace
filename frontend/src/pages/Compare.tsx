import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Award, TrendingUp } from 'lucide-react';
import CropComparison from '../components/CropComparison';

const Compare: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  // Get crop IDs from URL parameters
  const cropIds = searchParams.get('crops')?.split(',') || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Award className="h-8 w-8 text-farm-green-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Compare Crops</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Make informed decisions by comparing crops side by side. Analyze nutrition facts, 
          prices, sustainability metrics, and quality ratings to find the perfect produce for your needs.
        </p>
      </div>

      {/* Benefits Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 text-farm-green-600 mr-2" />
          Why Compare Crops?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold text-lg">$</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Best Value</h3>
            <p className="text-sm text-gray-600">
              Find crops that offer the best price-to-quality ratio for your budget
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold text-lg">💚</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Nutrition</h3>
            <p className="text-sm text-gray-600">
              Compare nutritional values to choose the healthiest options
            </p>
          </div>
          <div className="text-center">
            <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-emerald-600 font-bold text-lg">🌱</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Sustainability</h3>
            <p className="text-sm text-gray-600">
              Support environmentally friendly farming practices
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Component */}
      <CropComparison initialCropIds={cropIds} maxCrops={4} />

      {/* Tips Section */}
      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Comparison Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold mb-2">💡 Smart Shopping</h4>
            <ul className="space-y-1">
              <li>• Compare similar crops (e.g., different tomato varieties)</li>
              <li>• Look for seasonal availability to get the best prices</li>
              <li>• Consider sustainability scores for eco-friendly choices</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">🎯 Best Practices</h4>
            <ul className="space-y-1">
              <li>• Check freshness scores and harvest dates</li>
              <li>• Review farmer ratings and certifications</li>
              <li>• Factor in shipping distance for local support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compare;
