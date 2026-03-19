import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import { useCart } from '../../contexts/CartContext';

const BookingFlowIndicator = ({ currentStep, bookingType }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartCount, cartItems } = useCart();
  
  // Define steps based on booking type
  const getSteps = () => {
    const baseSteps = [];
    
    if (bookingType === 'rooms' || bookingType === 'both') {
      baseSteps.push({ 
        id: 'rooms', 
        label: 'Select Room', 
        icon: 'Home', 
        path: '/',
        description: 'Choose your accommodation'
      });
    }
    
    if (bookingType === 'safari' || bookingType === 'both') {
      baseSteps.push({ 
        id: 'safari', 
        label: 'Add Safari', 
        icon: 'Binoculars', 
        path: '/safari-route-explorer',
        description: 'Explore safari options'
      });
    }
    
    baseSteps.push({ 
      id: 'shop', 
      label: 'Souvenirs', 
      icon: 'ShoppingBag', 
      path: '/e-shop',
      description: 'Optional souvenirs',
      optional: true
    });
    
    baseSteps.push({ 
      id: 'checkout', 
      label: 'Checkout', 
      icon: 'CreditCard', 
      path: '/shopping-cart',
      description: 'Complete booking'
    });
    
    return baseSteps;
  };

  const steps = getSteps();
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  
  // Check what's in cart
  const hasRooms = cartItems.some(item => item.item_type === 'accommodation');
  const hasSafari = cartItems.some(item => item.item_type === 'activity');
  const hasProducts = cartItems.some(item => item.item_type === 'product');

  const getStepStatus = (step, index) => {
    if (step.id === 'rooms' && hasRooms) return 'completed';
    if (step.id === 'safari' && hasSafari) return 'completed';
    if (step.id === 'shop' && hasProducts) return 'completed';
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'current';
    return 'upcoming';
  };

  const handleStepClick = (step) => {
    navigate(step.path);
  };

  const handleSkip = () => {
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length) {
      navigate(steps[nextStepIndex].path);
    }
  };

  if (!bookingType || getCartCount() === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#2A4A2A]/95 backdrop-blur-lg border-t border-[#5A9A3A]/30 shadow-2xl">
      <div className="max-w-screen-xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Progress Steps */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {steps.map((step, index) => {
              const status = getStepStatus(step, index);
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => handleStepClick(step)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                      status === 'current' 
                        ? 'bg-[#5A9A3A] text-white' 
                        : status === 'completed'
                          ? 'bg-[#5A9A3A]/30 text-[#5A9A3A]'
                          : 'bg-[#1E3A1E] text-[#B8C4A8] hover:bg-[#3A5A3A]'
                    }`}
                  >
                    {status === 'completed' ? (
                      <Icon name="CheckCircle" size={18} />
                    ) : (
                      <Icon name={step.icon} size={18} />
                    )}
                    <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                    {step.optional && status !== 'completed' && (
                      <span className="text-xs opacity-60">(optional)</span>
                    )}
                  </button>
                  {index < steps.length - 1 && (
                    <Icon name="ChevronRight" size={16} className="text-[#5A9A3A]/50 flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Skip Button */}
            {currentStep !== 'checkout' && steps[currentStepIndex]?.optional && (
              <button
                onClick={handleSkip}
                className="text-sm text-[#B8C4A8] hover:text-white transition-colors"
              >
                Skip
              </button>
            )}
            
            {/* Cart Summary */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#1E3A1E] rounded-lg">
              <Icon name="ShoppingCart" size={16} className="text-[#5A9A3A]" />
              <span className="text-sm text-white">{getCartCount()} items</span>
            </div>

            {/* Continue/Checkout Button */}
            {currentStep !== 'checkout' ? (
              <button
                onClick={() => navigate('/shopping-cart')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF9E6D] to-[#FF6B35] text-white rounded-lg font-medium text-sm hover:from-[#FFA07A] hover:to-[#FF9E6D] transition-all"
              >
                <span>View Cart</span>
                <Icon name="ArrowRight" size={16} />
              </button>
            ) : (
              <button
                onClick={() => document.getElementById('proceed-checkout-btn')?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#5A9A3A] to-[#2D5016] text-white rounded-lg font-medium text-sm"
              >
                <span>Proceed</span>
                <Icon name="ArrowRight" size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFlowIndicator;
