import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { wishlistService } from '../services/wishlistService';
import { useAuth } from '../contexts/AuthContext';

interface WishlistButtonProps {
  type: 'crop' | 'farmer';
  itemId: string;
  itemData: {
    name: string;
    price?: number;
    unit?: string;
    farmerName?: string;
    farmerId?: string;
    location: { city: string; state: string };
    image?: string;
    availability?: 'available' | 'low_stock' | 'pre_order' | 'out_of_stock';
  };
  className?: string;
  showText?: boolean;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  type,
  itemId,
  itemData,
  className = '',
  showText = false
}) => {
  const { user } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const inWishlist = wishlistService.isInWishlist(user.id, itemId, type);
      setIsInWishlist(inWishlist);
    }
  }, [user, itemId, type]);

  const handleToggle = async () => {
    if (!user) {
      // Could show login modal here
      alert('Please sign in to add items to your wishlist');
      return;
    }

    setIsLoading(true);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const success = wishlistService.removeFromWishlist(user.id, itemId, type);
        if (success) {
          setIsInWishlist(false);
        }
      } else {
        // Add to wishlist
        let success = false;
        
        if (type === 'crop') {
          success = wishlistService.addCropToWishlist(user.id, {
            id: itemId,
            name: itemData.name,
            price: itemData.price || 0,
            unit: itemData.unit || 'item',
            farmerName: itemData.farmerName || 'Unknown Farmer',
            farmerId: itemData.farmerId || 'unknown',
            location: itemData.location,
            image: itemData.image,
            availability: itemData.availability
          });
        } else {
          success = wishlistService.addFarmerToFavorites(user.id, {
            id: itemId,
            name: itemData.name,
            location: itemData.location,
            image: itemData.image
          });
        }
        
        if (success) {
          setIsInWishlist(true);
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const baseClasses = `flex items-center gap-1 transition-colors ${
    isInWishlist 
      ? 'text-red-600 hover:text-red-700' 
      : 'text-gray-400 hover:text-red-600'
  } ${isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`;

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`${baseClasses} ${className}`}
      title={
        isInWishlist 
          ? `Remove ${itemData.name} from ${type === 'crop' ? 'wishlist' : 'favorites'}`
          : `Add ${itemData.name} to ${type === 'crop' ? 'wishlist' : 'favorites'}`
      }
    >
      <Heart 
        className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} 
      />
      {showText && (
        <span className="text-sm font-medium">
          {isInWishlist 
            ? (type === 'crop' ? 'In Wishlist' : 'Following') 
            : (type === 'crop' ? 'Add to Wishlist' : 'Follow Farmer')
          }
        </span>
      )}
    </button>
  );
};

export default WishlistButton;
