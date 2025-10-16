import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout, Menu, X, User, LogOut, Heart, ShoppingCart, ChefHat, Award, List } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();

  const navigation: { name: string; href: string; icon?: React.ComponentType<any> }[] = [
    { name: 'Home', href: '/' },
    { name: 'Browse Crops', href: '/crops' },
    { name: 'Find Farmers', href: '/farmers' },
    { name: 'Recipes', href: '/recipes', icon: ChefHat },
    { name: 'Compare', href: '/compare', icon: Award },
    { name: 'Lists', href: '/shopping-lists', icon: List },
    { name: 'About', href: '/about' }
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setShowUserMenu(false);
  };
  
  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return (
    <header className="bg-white shadow-lg relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <Sprout className="h-8 w-8 text-farm-green-600" />
            <span className="text-2xl font-bold text-gray-900">
              FarmMarket
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`font-medium transition-colors flex items-center gap-1 ${
                    isActive(item.href)
                      ? 'text-farm-green-600'
                      : 'text-gray-700 hover:text-farm-green-600'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.name}
                </Link>
              );
            })}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {/* Wishlist Icon */}
                  <Link to="/wishlist" className="p-2 text-gray-700 hover:text-farm-green-600" title="Wishlist">
                    <Heart className="h-5 w-5" />
                  </Link>
                  
                  {/* Cart Icon with Count */}
                  <Link to="/cart" className="relative p-2 text-gray-700 hover:text-farm-green-600" title="Cart">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-farm-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                  </Link>
                  
                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-farm-green-600 p-2 rounded-md transition-colors"
                    >
                      <User className="h-5 w-5" />
                      <span className="text-sm font-medium">{user?.name}</span>
                    </button>
                    
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                        <Link
                          to={user?.type === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard'}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={closeMenu}
                        >
                        Dashboard
                        </Link>
                        <Link
                          to="/wishlist"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={closeMenu}
                        >
                          My Wishlist
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="h-4 w-4 inline mr-2" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`font-medium transition-colors ${
                      isActive('/login')
                        ? 'text-farm-green-600'
                        : 'text-gray-700 hover:text-farm-green-600'
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-farm-green-600 text-white px-4 py-2 rounded-lg hover:bg-farm-green-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden" 
              onClick={closeMenu}
            />
            
            {/* Mobile menu */}
            <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50 md:hidden">
              <nav className="px-4 py-6 space-y-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`block px-3 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                        isActive(item.href)
                          ? 'bg-farm-green-50 text-farm-green-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-farm-green-600'
                      }`}
                      onClick={closeMenu}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {item.name}
                    </Link>
                  );
                })}
                
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/cart"
                        className="flex items-center justify-between px-3 py-2 rounded-md font-medium text-gray-700 hover:bg-gray-50 hover:text-farm-green-600"
                        onClick={closeMenu}
                      >
                        <span>Cart</span>
                        {itemCount > 0 && (
                          <span className="bg-farm-green-600 text-white text-xs rounded-full px-2 py-1">
                            {itemCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        to={user?.type === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard'}
                        className="block px-3 py-2 rounded-md font-medium text-gray-700 hover:bg-gray-50 hover:text-farm-green-600"
                        onClick={closeMenu}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-3 py-2 rounded-md font-medium text-gray-700 hover:bg-gray-50 hover:text-farm-green-600"
                      >
                        <LogOut className="h-4 w-4 inline mr-2" />
                        Logout ({user?.name})
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className={`block px-3 py-2 rounded-md font-medium transition-colors ${
                          isActive('/login')
                            ? 'bg-farm-green-50 text-farm-green-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-farm-green-600'
                        }`}
                        onClick={closeMenu}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="block bg-farm-green-600 text-white px-3 py-2 rounded-md font-medium hover:bg-farm-green-700 transition-colors text-center"
                        onClick={closeMenu}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
