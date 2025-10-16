import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Notifications from './components/Notifications';
import Home from './pages/Home';
import CropsList from './pages/CropsList';
import CropDetail from './pages/CropDetail';
import FarmersList from './pages/FarmersList';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Wishlist from './pages/Wishlist';
import Recipes from './pages/Recipes';
import Compare from './pages/Compare';
import ShoppingLists from './pages/ShoppingLists';
import Chat from './pages/Chat';
import OrderTracking from './pages/OrderTracking';
import Cart from './pages/Cart';
import NotFound from './pages/NotFound';
import './App.css';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/crops" element={<CropsList />} />
              <Route path="/crops/:id" element={<CropDetail />} />
              <Route path="/farmers" element={<FarmersList />} />
              <Route path="/dashboard/farmer" element={<FarmerDashboard />} />
              <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/shopping-lists" element={<ShoppingLists />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/chat/:chatId" element={<Chat />} />
              <Route path="/orders" element={<OrderTracking />} />
              <Route path="/orders/:orderId" element={<OrderTracking />} />
          <Route 
            path="/farmer/dashboard" 
            element={
              <ProtectedRoute requiredUserType="farmer">
                <FarmerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/buyer/dashboard" 
            element={
              <ProtectedRoute requiredUserType="buyer">
                <BuyerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      
      {/* Global Notifications */}
      {user && <Notifications userId={user.id} />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
