import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Sprout className="h-6 w-6 text-farm-green-400" />
              <span className="text-xl font-bold">FarmMarket</span>
            </div>
            <p className="text-gray-400">
              Connecting local farmers with buyers through AI-powered predictions.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/crops" className="text-gray-400 hover:text-white">
                  Browse Crops
                </Link>
              </li>
              <li>
                <Link to="/farmers" className="text-gray-400 hover:text-white">
                  Find Farmers
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-400">
              Email: info@farmmarket.com<br />
              Phone: (555) 123-4567
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400">
          <p>&copy; 2024 FarmMarket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
