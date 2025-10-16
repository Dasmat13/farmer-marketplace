import React, { useState, useMemo } from 'react';
import { MapPin, Phone, Mail, Star, Search, Filter } from 'lucide-react';
import ContactFarmer from '../components/ContactFarmer';

interface Farmer {
  id: number;
  name: string;
  location: {
    city: string;
    state: string;
  };
  specialties: string[];
  rating: number;
  phone: string;
  email: string;
  imageUrl: string;
  description: string;
}

const FarmersList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  const handleContactFarmer = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setShowContactModal(true);
  };

  const handleCloseContactModal = () => {
    setSelectedFarmer(null);
    setShowContactModal(false);
  };

  const allFarmers: Farmer[] = [
    {
      id: 1,
      name: "John Smith",
      location: { city: "Des Moines", state: "Iowa" },
      specialties: ["Corn", "Soybeans", "Wheat"],
      rating: 4.8,
      phone: "(555) 123-4567",
      email: "john.smith@email.com",
      imageUrl: "/api/placeholder/150/150",
      description: "Family-owned farm with 30+ years of experience in sustainable farming practices."
    },
    {
      id: 2,
      name: "Maria Garcia",
      location: { city: "Fresno", state: "California" },
      specialties: ["Tomatoes", "Lettuce", "Peppers"],
      rating: 4.9,
      phone: "(555) 987-6543",
      email: "maria.garcia@email.com",
      imageUrl: "/api/placeholder/150/150",
      description: "Organic vegetable specialist focusing on fresh, locally-grown produce."
    },
    {
      id: 3,
      name: "David Johnson",
      location: { city: "Topeka", state: "Kansas" },
      specialties: ["Wheat", "Barley", "Oats"],
      rating: 4.7,
      phone: "(555) 456-7890",
      email: "david.johnson@email.com",
      imageUrl: "/api/placeholder/150/150",
      description: "Third-generation grain farmer committed to quality and sustainable practices."
    },
    {
      id: 4,
      name: "Sarah Chen",
      location: { city: "Portland", state: "Oregon" },
      specialties: ["Apples", "Pears", "Berries"],
      rating: 4.9,
      phone: "(555) 234-5678",
      email: "sarah.chen@email.com",
      imageUrl: "/api/placeholder/150/150",
      description: "Orchard owner specializing in organic fruits and sustainable agriculture."
    },
    {
      id: 5,
      name: "Mike Thompson",
      location: { city: "Boise", state: "Idaho" },
      specialties: ["Potatoes", "Onions", "Carrots"],
      rating: 4.6,
      phone: "(555) 345-6789",
      email: "mike.thompson@email.com",
      imageUrl: "/api/placeholder/150/150",
      description: "Root vegetable specialist with expertise in storage and distribution."
    },
    {
      id: 6,
      name: "Lisa Brown",
      location: { city: "Austin", state: "Texas" },
      specialties: ["Cotton", "Corn", "Sorghum"],
      rating: 4.5,
      phone: "(555) 678-9012",
      email: "lisa.brown@email.com",
      imageUrl: "/api/placeholder/150/150",
      description: "Large-scale crop producer with modern irrigation and harvesting technology."
    },
    {
      id: 7,
      name: "Robert Wilson",
      location: { city: "Burlington", state: "Vermont" },
      specialties: ["Maple Syrup", "Dairy", "Hay"],
      rating: 4.8,
      phone: "(555) 789-0123",
      email: "robert.wilson@email.com",
      imageUrl: "/api/placeholder/150/150",
      description: "Traditional Vermont farm producing pure maple syrup and dairy products."
    },
    {
      id: 8,
      name: "Jennifer Lee",
      location: { city: "Yakima", state: "Washington" },
      specialties: ["Hops", "Wine Grapes", "Cherries"],
      rating: 4.7,
      phone: "(555) 890-1234",
      email: "jennifer.lee@email.com",
      imageUrl: "/api/placeholder/150/150",
      description: "Specialty crop farmer focusing on hops for craft breweries and wine grapes."
    },
    {
      id: 9,
      name: "Carlos Martinez",
      location: { city: "Salinas", state: "California" },
      specialties: ["Strawberries", "Artichokes", "Spinach"],
      rating: 4.6,
      phone: "(555) 901-2345",
      email: "carlos.martinez@email.com",
      imageUrl: "/api/placeholder/150/150",
      description: "Specializes in high-value crops with year-round growing seasons."
    },
    {
      id: 10,
      name: "Amanda Davis",
      location: { city: "Gainesville", state: "Florida" },
      specialties: ["Oranges", "Strawberries", "Sweet Corn"],
      rating: 4.4,
      phone: "(555) 012-3456",
      email: "amanda.davis@email.com",
      imageUrl: "/api/placeholder/150/150",
      description: "Citrus and berry farm with sustainable growing practices and direct sales."
    }
  ];

  const states = ['all', ...Array.from(new Set(allFarmers.map(farmer => farmer.location.state)))];
  const specialties = ['all', ...Array.from(new Set(allFarmers.flatMap(farmer => farmer.specialties)))];

  const filteredFarmers = useMemo(() => {
    let filtered = allFarmers.filter(farmer => {
      const matchesSearch = farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           farmer.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           farmer.location.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           farmer.specialties.some(specialty => 
                             specialty.toLowerCase().includes(searchQuery.toLowerCase())
                           ) ||
                           farmer.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesState = selectedState === 'all' || farmer.location.state === selectedState;
      const matchesSpecialty = selectedSpecialty === 'all' || 
                               farmer.specialties.includes(selectedSpecialty);
      const matchesRating = farmer.rating >= minRating;
      
      return matchesSearch && matchesState && matchesSpecialty && matchesRating;
    });

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating_high':
          return b.rating - a.rating;
        case 'rating_low':
          return a.rating - b.rating;
        case 'location':
          return a.location.state.localeCompare(b.location.state);
        case 'specialties':
          return a.specialties.length - b.specialties.length;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [searchQuery, selectedState, selectedSpecialty, minRating, sortBy]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Local Farmers</h1>
        <p className="text-lg text-gray-600">
          Connect directly with trusted farmers in your area
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-8 p-6">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search farmers, locations, or specialties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-farm-green-500"
            />
          </div>
        </div>

        {/* Filter Toggle Button */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          <div className="text-sm text-gray-600">
            {filteredFarmers.length} farmer{filteredFarmers.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-farm-green-500"
              >
                {states.map(state => (
                  <option key={state} value={state}>
                    {state === 'all' ? 'All States' : state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-farm-green-500"
              >
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>
                    {specialty === 'all' ? 'All Specialties' : specialty}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-farm-green-500"
              >
                <option value={0}>Any Rating</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
                <option value={4.8}>4.8+ Stars</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-farm-green-500"
              >
                <option value="name">Name (A-Z)</option>
                <option value="rating_high">Highest Rating</option>
                <option value="rating_low">Lowest Rating</option>
                <option value="location">Location</option>
                <option value="specialties"># of Specialties</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {filteredFarmers.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No farmers found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search terms or filters</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedState('all');
              setSelectedSpecialty('all');
              setMinRating(0);
            }}
            className="text-farm-green-600 hover:text-farm-green-800 font-medium"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarmers.map((farmer) => (
            <div key={farmer.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-farm-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold text-farm-green-600">
                      {farmer.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{farmer.name}</h3>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{farmer.location.city}, {farmer.location.state}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center mb-3">
                  <div className="flex mr-2">
                    {renderStars(farmer.rating)}
                  </div>
                  <span className="text-sm text-gray-600">({farmer.rating})</span>
                </div>

                <p className="text-gray-600 text-sm mb-4">{farmer.description}</p>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Specialties:</h4>
                  <div className="flex flex-wrap gap-2">
                    {farmer.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="inline-block bg-farm-green-100 text-farm-green-800 text-xs px-2 py-1 rounded"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      <span>{farmer.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      <span className="truncate max-w-32">{farmer.email}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleContactFarmer(farmer)}
                  className="w-full mt-4 bg-farm-green-600 text-white py-2 px-4 rounded-md hover:bg-farm-green-700 transition-colors duration-300"
                >
                  Contact Farmer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact Farmer Modal */}
      {selectedFarmer && (
        <ContactFarmer
          farmer={{
            id: selectedFarmer.id.toString(),
            name: selectedFarmer.name,
            email: selectedFarmer.email,
            phone: selectedFarmer.phone,
            specialties: selectedFarmer.specialties
          }}
          isOpen={showContactModal}
          onClose={handleCloseContactModal}
        />
      )}
    </div>
  );
};

export default FarmersList;
