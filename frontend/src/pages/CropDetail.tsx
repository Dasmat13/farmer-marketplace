import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Package, Star, ShoppingCart, Check, Phone, Mail, Award } from 'lucide-react';
import AIPrediction from '../components/AIPrediction';
import ContactFarmer from '../components/ContactFarmer';
import ContactFarmerChat from '../components/ContactFarmerChat';
import CropRecommendations from '../components/CropRecommendations';
import PricePrediction from '../components/PricePrediction';
import WishlistButton from '../components/WishlistButton';
import Reviews from '../components/Reviews';
import { useCart } from '../contexts/CartContext';
import { recommendationService } from '../services/recommendationService';

interface CropDetailData {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  description: string;
  harvestDate: string;
  location: {
    city: string;
    state: string;
  };
  farmer: {
    id: string;
    name: string;
    rating: number;
    phone: string;
    email: string;
    totalCrops: number;
    yearsExperience: number;
  };
  images: string[];
  nutritionFacts: {
    calories: number;
    protein: number;
    carbs: number;
    fiber: number;
  };
  certifications: string[];
}

const CropDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [crop, setCrop] = useState<CropDetailData | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  const [userId] = useState('user_123'); // Mock user ID for recommendations
  
  const { addItem, isInCart, getCartItem } = useCart();
  
  useEffect(() => {
    // Track this view for recommendations
    if (id) recommendationService.trackView(id, 'user_123');

    // Simulate fetching crop data based on ID
    const mockCropData: { [key: string]: CropDetailData } = {
      'tomatoes': {
        id: 'tomatoes',
        name: 'Organic Tomatoes',
        category: 'Vegetables',
        price: 3.50,
        unit: 'lb',
        quantity: 500,
        description: 'Fresh, vine-ripened organic tomatoes grown using sustainable farming practices. These tomatoes are perfect for salads, cooking, or eating fresh. Harvested at peak ripeness for maximum flavor and nutrition.',
        harvestDate: '2024-10-10',
        location: { city: 'Fresno', state: 'California' },
        farmer: {
          id: '2',
          name: 'Maria Garcia',
          rating: 4.9,
          phone: '(555) 987-6543',
          email: 'maria.garcia@email.com',
          totalCrops: 25,
          yearsExperience: 15
        },
        images: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300'],
        nutritionFacts: { calories: 18, protein: 0.9, carbs: 3.9, fiber: 1.2 },
        certifications: ['USDA Organic', 'Non-GMO', 'Locally Grown']
      },
      'corn': {
        id: 'corn',
        name: 'Sweet Corn',
        category: 'Grains',
        price: 4.50,
        unit: 'dozen',
        quantity: 200,
        description: 'Premium sweet corn with tender kernels and natural sweetness. Perfect for grilling, boiling, or using in your favorite recipes. Picked fresh daily during harvest season.',
        harvestDate: '2024-10-05',
        location: { city: 'Des Moines', state: 'Iowa' },
        farmer: {
          id: '1',
          name: 'John Smith',
          rating: 4.8,
          phone: '(555) 123-4567',
          email: 'john.smith@email.com',
          totalCrops: 12,
          yearsExperience: 30
        },
        images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        nutritionFacts: { calories: 96, protein: 3.4, carbs: 21, fiber: 2.4 },
        certifications: ['Farm Fresh', 'Pesticide-Free']
      },
      'lettuce': {
        id: 'lettuce',
        name: 'Fresh Lettuce',
        category: 'Leafy Greens',
        price: 2.25,
        unit: 'head',
        quantity: 150,
        description: 'Crisp, fresh lettuce perfect for salads and sandwiches. Grown using sustainable farming practices with minimal environmental impact.',
        harvestDate: '2024-10-12',
        location: { city: 'Fresno', state: 'California' },
        farmer: {
          id: '2',
          name: 'Maria Garcia',
          rating: 4.9,
          phone: '(555) 987-6543',
          email: 'maria.garcia@email.com',
          totalCrops: 25,
          yearsExperience: 15
        },
        images: ['/api/placeholder/400/300'],
        nutritionFacts: { calories: 5, protein: 0.5, carbs: 1, fiber: 0.5 },
        certifications: ['USDA Organic', 'Locally Grown']
      },
      'apples': {
        id: 'apples',
        name: 'Honeycrisp Apples',
        category: 'Fruits',
        price: 5.75,
        unit: 'lb',
        quantity: 800,
        description: 'Premium Honeycrisp apples with exceptional crunch and sweet-tart flavor. Hand-picked at peak ripeness for the best taste and texture.',
        harvestDate: '2024-09-28',
        location: { city: 'Hood River', state: 'Oregon' },
        farmer: {
          id: '3',
          name: 'Sarah Chen',
          rating: 4.7,
          phone: '(555) 246-8135',
          email: 'sarah.chen@email.com',
          totalCrops: 8,
          yearsExperience: 12
        },
        images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        nutritionFacts: { calories: 52, protein: 0.3, carbs: 14, fiber: 2.4 },
        certifications: ['IPM Certified', 'Farm Fresh']
      },
      'potatoes': {
        id: 'potatoes',
        name: 'Russet Potatoes',
        category: 'Root Vegetables',
        price: 1.85,
        unit: 'lb',
        quantity: 1200,
        description: 'High-quality Russet potatoes perfect for baking, frying, or mashing. Grown in nutrient-rich soil for exceptional flavor and texture.',
        harvestDate: '2024-09-15',
        location: { city: 'Boise', state: 'Idaho' },
        farmer: {
          id: '4',
          name: 'Mike Thompson',
          rating: 4.6,
          phone: '(555) 369-2580',
          email: 'mike.thompson@email.com',
          totalCrops: 15,
          yearsExperience: 22
        },
        images: ['/api/placeholder/400/300'],
        nutritionFacts: { calories: 77, protein: 2, carbs: 17, fiber: 2.2 },
        certifications: ['Sustainable Farming', 'Non-GMO']
      },
      'carrots': {
        id: 'carrots',
        name: 'Organic Carrots',
        category: 'Root Vegetables',
        price: 2.75,
        unit: 'bunch',
        quantity: 180,
        description: 'Sweet, crunchy organic carrots packed with beta-carotene. Perfect for snacking, cooking, or juicing.',
        harvestDate: '2024-10-01',
        location: { city: 'Boise', state: 'Idaho' },
        farmer: {
          id: '4',
          name: 'Mike Thompson',
          rating: 4.6,
          phone: '(555) 369-2580',
          email: 'mike.thompson@email.com',
          totalCrops: 15,
          yearsExperience: 22
        },
        images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        nutritionFacts: { calories: 25, protein: 0.5, carbs: 6, fiber: 1.7 },
        certifications: ['USDA Organic', 'Non-GMO']
      },
      'spinach': {
        id: 'spinach',
        name: 'Baby Spinach',
        category: 'Leafy Greens',
        price: 3.25,
        unit: 'bag',
        quantity: 220,
        description: 'Tender baby spinach leaves perfect for salads, smoothies, or cooking. Rich in iron and vitamins.',
        harvestDate: '2024-10-14',
        location: { city: 'Salinas', state: 'California' },
        farmer: {
          id: '5',
          name: 'Carlos Martinez',
          rating: 4.8,
          phone: '(555) 741-9630',
          email: 'carlos.martinez@email.com',
          totalCrops: 18,
          yearsExperience: 20
        },
        images: ['/api/placeholder/400/300'],
        nutritionFacts: { calories: 7, protein: 0.9, carbs: 1.1, fiber: 0.7 },
        certifications: ['USDA Organic', 'Locally Grown']
      },
      'strawberries': {
        id: 'strawberries',
        name: 'Fresh Strawberries',
        category: 'Fruits',
        price: 6.50,
        unit: 'pint',
        quantity: 95,
        description: 'Sweet, juicy strawberries bursting with flavor. Perfect for desserts, snacking, or adding to breakfast.',
        harvestDate: '2024-10-08',
        location: { city: 'Tampa', state: 'Florida' },
        farmer: {
          id: '6',
          name: 'Amanda Davis',
          rating: 4.9,
          phone: '(555) 852-7410',
          email: 'amanda.davis@email.com',
          totalCrops: 10,
          yearsExperience: 8
        },
        images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        nutritionFacts: { calories: 32, protein: 0.7, carbs: 7.7, fiber: 2 },
        certifications: ['Pesticide-Free', 'Farm Fresh']
      }
    };
    
    if (id && mockCropData[id]) {
      setCrop(mockCropData[id]);
    }
  }, [id]);
  
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-200 text-yellow-400" />);
    }

    return stars;
  };
  
  const handleAddToCart = async () => {
    if (!crop) return;
    
    setIsAddingToCart(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      addItem({
        cropId: crop.id,
        cropName: crop.name,
        farmerName: crop.farmer.name,
        farmerId: crop.farmer.id,
        price: crop.price,
        quantity,
        unit: crop.unit,
        availability: 'available'
      });
      
      setShowAddedToCart(true);
      setTimeout(() => setShowAddedToCart(false), 3000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  if (!crop) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Crop Not Found</h1>
          <p className="text-gray-600 mb-6">The crop you're looking for doesn't exist or has been removed.</p>
          <Link to="/crops" className="bg-farm-green-600 text-white px-6 py-2 rounded-md hover:bg-farm-green-700">
            Back to Crops
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center mb-6">
        <Link to="/crops" className="flex items-center text-farm-green-600 hover:text-farm-green-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Crops
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="mb-4">
            <img 
              src={crop.images[selectedImage]} 
              alt={crop.name}
              className="w-full h-96 object-cover rounded-lg shadow-md"
            />
          </div>
          <div className="flex space-x-2 overflow-x-auto">
            {crop.images.map((image, index) => (
              <img 
                key={index}
                src={image} 
                alt={`${crop.name} ${index + 1}`}
                className={`w-20 h-20 object-cover rounded cursor-pointer ${selectedImage === index ? 'ring-2 ring-farm-green-600' : ''}`}
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </div>
        </div>

        {/* Crop Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{crop.name}</h1>
          <div className="flex items-center justify-between mb-4">
            <p className="text-lg text-farm-green-600">{crop.category}</p>
            <WishlistButton
              type="crop"
              itemId={crop.id}
              itemData={{
                name: crop.name,
                price: crop.price,
                unit: crop.unit,
                farmerName: crop.farmer.name,
                farmerId: crop.farmer.id,
                location: crop.location,
                availability: 'available'
              }}
              showText
              className="p-2"
            />
          </div>
          
          <div className="flex items-center mb-4">
            <MapPin className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600">{crop.location.city}, {crop.location.state}</span>
          </div>
          
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600">Harvested: {new Date(crop.harvestDate).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center mb-6">
            <Package className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600">Available: {crop.quantity} {crop.unit}s</span>
          </div>
          
          <p className="text-gray-700 mb-6">{crop.description}</p>
          
          {/* Certifications */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {crop.certifications.map((cert, index) => (
                <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {cert}
                </span>
              ))}
            </div>
          </div>
          
          {/* Price and Purchase */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-gray-900">${crop.price}</span>
              <span className="text-gray-600">per {crop.unit}</span>
            </div>
            
            <div className="flex items-center space-x-4 mb-4">
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                >
                  -
                </button>
                <span className="px-4 py-1 bg-white border rounded">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(crop.quantity, quantity + 1))}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="text-lg font-semibold mb-4">
              Total: ${(crop.price * quantity).toFixed(2)}
            </div>
            
            {showAddedToCart ? (
              <div className="w-full bg-green-600 text-white py-3 px-6 rounded-md font-semibold flex items-center justify-center">
                <Check className="h-5 w-5 mr-2" />
                Added to Cart!
              </div>
            ) : (
              <div className="space-y-3">
                <button 
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || crop.quantity === 0}
                  className="w-full bg-farm-green-600 text-white py-3 px-6 rounded-md hover:bg-farm-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
                >
                  {isAddingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {isInCart(crop.id) ? `Update Cart (${getCartItem(crop.id)?.quantity || 0} in cart)` : 'Add to Cart'}
                    </>
                  )}
                </button>
                <Link
                  to={`/compare?crops=${crop.id}`}
                  className="w-full border border-farm-green-600 text-farm-green-600 py-3 px-6 rounded-md hover:bg-farm-green-50 transition-colors font-semibold flex items-center justify-center"
                >
                  <Award className="h-5 w-5 mr-2" />
                  Compare This Crop
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Farmer Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Farmer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{crop.farmer.name}</h3>
              <WishlistButton
                type="farmer"
                itemId={crop.farmer.id}
                itemData={{
                  name: crop.farmer.name,
                  location: crop.location
                }}
                showText={false}
                className="p-1"
              />
            </div>
            <div className="flex items-center mb-2">
              <div className="flex mr-2">
                {renderStars(crop.farmer.rating)}
              </div>
              <span className="text-sm text-gray-600">({crop.farmer.rating})</span>
            </div>
            <p className="text-gray-600 mb-4">{crop.farmer.yearsExperience} years of farming experience</p>
            <p className="text-gray-600 mb-4">{crop.farmer.totalCrops} different crops available</p>
          </div>
          <div>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-600">{crop.farmer.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-600">{crop.farmer.email}</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <ContactFarmerChat
                farmerId={crop.farmer.id}
                farmerName={crop.farmer.name}
                cropId={crop.id}
                cropName={crop.name}
              />
              <button 
                onClick={() => setShowContactModal(true)}
                className="w-full border border-farm-green-600 text-farm-green-600 py-2 px-4 rounded-md hover:bg-farm-green-50 transition-colors"
              >
                Contact via Email/Phone
              </button>
              <Link to={`/farmers`} className="block w-full text-center border border-gray-300 text-gray-600 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors">
                View All Farmer's Crops
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Nutrition Facts */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Nutrition Facts</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-2xl font-bold text-farm-green-600">{crop.nutritionFacts.calories}</div>
            <div className="text-sm text-gray-600">Calories</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-2xl font-bold text-farm-green-600">{crop.nutritionFacts.protein}g</div>
            <div className="text-sm text-gray-600">Protein</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-2xl font-bold text-farm-green-600">{crop.nutritionFacts.carbs}g</div>
            <div className="text-sm text-gray-600">Carbs</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-2xl font-bold text-farm-green-600">{crop.nutritionFacts.fiber}g</div>
            <div className="text-sm text-gray-600">Fiber</div>
          </div>
        </div>
      </div>

      {/* AI Predictions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Market Analysis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIPrediction 
            cropName={crop.name.toLowerCase()}
            currentPrice={crop.price}
            location={crop.location}
          />
          <PricePrediction
            cropId={crop.id}
            cropName={crop.name}
            currentPrice={crop.price}
            userId={userId}
          />
        </div>
      </div>

      {/* AI Crop Recommendations */}
      <div className="mb-8">
        <CropRecommendations
          currentCropId={crop.id}
          userId={userId}
        />
      </div>

      {/* Reviews Section */}
      <div className="mb-8">
        <Reviews
          targetId={crop.id}
          targetType="crop"
          targetName={crop.name}
        />
      </div>

      {/* Contact Farmer Modal */}
      {crop && (
        <ContactFarmer
          farmer={{
            id: crop.farmer.id,
            name: crop.farmer.name,
            email: crop.farmer.email,
            phone: crop.farmer.phone,
            specialties: [crop.category] // Use crop category as specialty for context
          }}
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          cropName={crop.name}
        />
      )}
    </div>
  );
};

export default CropDetail;
