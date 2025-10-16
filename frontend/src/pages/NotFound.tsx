import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, Sprout } from 'lucide-react';

const NotFound: React.FC = () => {
  const quickLinks = [
    { name: 'Browse Crops', href: '/crops', icon: Search },
    { name: 'Find Farmers', href: '/farmers', icon: Sprout },
    { name: 'About Us', href: '/about', icon: Home },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="mx-auto w-24 h-24 bg-farm-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl font-bold text-farm-green-600">404</span>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-farm-green-50 to-farm-green-100 rounded-full opacity-20"></div>
              </div>
              <div className="relative flex justify-center">
                <Sprout className="h-16 w-16 text-farm-green-400" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-gray-500 mb-8">
            It might have been moved, deleted, or you entered the wrong URL.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center mb-12">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-farm-green-600 hover:bg-farm-green-700 transition-colors"
            >
              <Home className="h-5 w-5 mr-2" />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go Back
            </button>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Or try one of these popular pages:
            </h2>
            <div className="space-y-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="block p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-farm-green-300 hover:bg-farm-green-50 transition-colors group"
                  >
                    <div className="flex items-center">
                      <Icon className="h-5 w-5 text-gray-400 group-hover:text-farm-green-600 mr-3" />
                      <span className="text-gray-700 group-hover:text-farm-green-700 font-medium">
                        {link.name}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Still can't find what you're looking for?{' '}
              <Link 
                to="/about" 
                className="text-farm-green-600 hover:text-farm-green-500 font-medium"
              >
                Contact us
              </Link>{' '}
              and we'll help you out.
            </p>
          </div>
        </div>
      </div>

      {/* Footer with some navigation */}
      <div className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center space-x-6 text-sm text-gray-600">
            <Link to="/" className="hover:text-farm-green-600">Home</Link>
            <Link to="/crops" className="hover:text-farm-green-600">Crops</Link>
            <Link to="/farmers" className="hover:text-farm-green-600">Farmers</Link>
            <Link to="/about" className="hover:text-farm-green-600">About</Link>
            <Link to="/login" className="hover:text-farm-green-600">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
