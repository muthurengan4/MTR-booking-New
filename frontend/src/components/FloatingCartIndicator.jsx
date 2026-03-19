import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from './AppIcon';
import { useCart } from '../contexts/CartContext';

const FloatingCartIndicator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, getCartCount, getCartTotal } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);

  const cartCount = getCartCount();
  const cartTotal = getCartTotal();

  // Don't show on cart page
  if (location.pathname === '/shopping-cart' || cartCount === 0) {
    return null;
  }

  // Categorize items
  const accommodations = cartItems.filter(item => item.item_type === 'accommodation');
  const activities = cartItems.filter(item => item.item_type === 'activity');
  const products = cartItems.filter(item => item.item_type === 'product');

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded View */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 w-80 bg-[#2A4A2A] rounded-2xl shadow-2xl border border-[#5A9A3A]/30 overflow-hidden mb-2">
          <div className="p-4 border-b border-[#5A9A3A]/30">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold text-white">Your Cart</h3>
              <button 
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-[#1E3A1E] rounded-lg"
              >
                <Icon name="X" size={18} className="text-[#B8C4A8]" />
              </button>
            </div>
          </div>
          
          <div className="p-4 max-h-60 overflow-y-auto space-y-3">
            {accommodations.length > 0 && (
              <div className="flex items-center gap-3 p-2 bg-[#1E3A1E] rounded-lg">
                <div className="w-8 h-8 bg-[#5A9A3A]/20 rounded-lg flex items-center justify-center">
                  <Icon name="Home" size={16} className="text-[#5A9A3A]" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{accommodations.length} Accommodation{accommodations.length > 1 ? 's' : ''}</p>
                  <p className="text-[#B8C4A8] text-xs">{accommodations.map(a => a.item_name).join(', ')}</p>
                </div>
              </div>
            )}
            
            {activities.length > 0 && (
              <div className="flex items-center gap-3 p-2 bg-[#1E3A1E] rounded-lg">
                <div className="w-8 h-8 bg-[#FF9E6D]/20 rounded-lg flex items-center justify-center">
                  <Icon name="Binoculars" size={16} className="text-[#FF9E6D]" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{activities.length} Safari{activities.length > 1 ? 's' : ''}</p>
                  <p className="text-[#B8C4A8] text-xs">{activities.map(a => a.item_name.split(' - ')[0]).join(', ')}</p>
                </div>
              </div>
            )}
            
            {products.length > 0 && (
              <div className="flex items-center gap-3 p-2 bg-[#1E3A1E] rounded-lg">
                <div className="w-8 h-8 bg-[#A0522D]/20 rounded-lg flex items-center justify-center">
                  <Icon name="ShoppingBag" size={16} className="text-[#A0522D]" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{products.reduce((s, p) => s + p.quantity, 0)} Product{products.length > 1 ? 's' : ''}</p>
                  <p className="text-[#B8C4A8] text-xs truncate">{products.map(p => p.item_name).join(', ')}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-[#5A9A3A]/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#B8C4A8]">Subtotal</span>
              <span className="text-white font-bold">₹{cartTotal.toLocaleString()}</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsExpanded(false);
                  // Navigate based on what's missing
                  if (accommodations.length === 0) {
                    navigate('/');
                  } else if (activities.length === 0) {
                    navigate('/safari-route-explorer');
                  } else {
                    navigate('/e-shop');
                  }
                }}
                className="flex-1 py-2.5 bg-[#5A9A3A]/20 hover:bg-[#5A9A3A]/30 text-[#5A9A3A] rounded-xl text-sm font-medium transition-all"
              >
                Add More
              </button>
              <button
                onClick={() => {
                  setIsExpanded(false);
                  navigate('/shopping-cart');
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#FF9E6D] to-[#FF6B35] text-white rounded-xl text-sm font-medium transition-all"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative w-14 h-14 bg-gradient-to-r from-[#5A9A3A] to-[#2D5016] rounded-full shadow-lg shadow-[#5A9A3A]/30 hover:shadow-xl transition-all flex items-center justify-center group"
        data-testid="floating-cart-btn"
      >
        <Icon name="ShoppingCart" size={24} className="text-white" />
        
        {/* Count Badge */}
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-[#FF9E6D] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
          {cartCount}
        </span>
        
        {/* Pulse Animation */}
        <span className="absolute inset-0 rounded-full bg-[#5A9A3A] animate-ping opacity-25" />
      </button>
    </div>
  );
};

export default FloatingCartIndicator;
