import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  cropId: string;
  cropName: string;
  farmerName: string;
  farmerId: string;
  price: number;
  quantity: number;
  unit: string;
  image?: string;
  availability: 'available' | 'low_stock' | 'pre_order';
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (cropId: string) => boolean;
  getCartItem: (cropId: string) => CartItem | undefined;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('farm_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Failed to parse saved cart:', error);
        localStorage.removeItem('farm_cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('farm_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: Omit<CartItem, 'id'>) => {
    const existingItem = items.find(item => item.cropId === newItem.cropId);
    
    if (existingItem) {
      // Update quantity if item already exists
      setItems(items.map(item =>
        item.cropId === newItem.cropId
          ? { ...item, quantity: item.quantity + newItem.quantity }
          : item
      ));
    } else {
      // Add new item
      const cartItem: CartItem = {
        ...newItem,
        id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      setItems([...items, cartItem]);
    }
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (cropId: string) => {
    return items.some(item => item.cropId === cropId);
  };

  const getCartItem = (cropId: string) => {
    return items.find(item => item.cropId === cropId);
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  const value: CartContextType = {
    items,
    itemCount,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getCartItem
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
