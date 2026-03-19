import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/navigation/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useCart } from '../../contexts/CartContext';
import { useUserAuth } from '../../contexts/UserAuthContext';
import api from '../../lib/api';

// Simple toast notification
const showToast = (message, type = 'success') => {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all transform ${
    type === 'success' ? 'bg-green-600 text-white' : type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

const ShoppingCart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, sessionId, loading: cartLoading } = useCart();
  const { user, isAuthenticated } = useUserAuth();
  
  const [checkoutStep, setCheckoutStep] = useState('cart'); // cart, details, payment, confirmation
  const [guestInfo, setGuestInfo] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    alternatePhone: '',
    createAccount: true
  });
  const [processing, setProcessing] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setGuestInfo(prev => ({
        ...prev,
        fullName: user.full_name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone
      }));
    }
  }, [user]);

  const subtotal = getCartTotal();
  const gstRate = 12;
  const gstAmount = subtotal * gstRate / 100;
  const totalAmount = subtotal + gstAmount;

  const validateForm = () => {
    const newErrors = {};
    if (!guestInfo.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!guestInfo.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(guestInfo.email)) newErrors.email = 'Invalid email format';
    if (!guestInfo.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(guestInfo.phone.replace(/\D/g, ''))) newErrors.phone = 'Invalid phone number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    setProcessing(true);
    try {
      const response = await api.post('/api/checkout', {
        session_id: sessionId,
        full_name: guestInfo.fullName,
        email: guestInfo.email,
        phone: guestInfo.phone,
        alternate_phone: guestInfo.alternatePhone || null,
        create_account: guestInfo.createAccount && !isAuthenticated,
        payment_method: 'card',
        items: cartItems.map(item => ({
          item_type: item.item_type,
          item_id: item.item_id,
          item_name: item.item_name,
          item_details: item.item_details || {},
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }))
      });

      if (response.data?.success) {
        setOrderResult(response.data);
        setCheckoutStep('confirmation');
        await clearCart();
        showToast('Booking confirmed successfully!');
      } else {
        showToast(response.data?.message || 'Checkout failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showToast('Checkout failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { 
        day: 'numeric', month: 'short', year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  // Cart Item Card Component
  const CartItemCard = ({ item, index }) => {
    const details = item.item_details || {};
    
    return (
      <div 
        className="bg-[#2A4A2A] rounded-xl p-4 border border-[#5A9A3A]/30 flex flex-col md:flex-row gap-4"
        data-testid={`cart-item-${index}`}
      >
        {/* Item Image */}
        <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden bg-[#1E3A1E] flex-shrink-0">
          {details.image ? (
            <img src={details.image} alt={item.item_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon 
                name={item.item_type === 'accommodation' ? 'Home' : item.item_type === 'activity' ? 'Compass' : 'ShoppingBag'} 
                size={32} 
                className="text-[#5A9A3A]/50" 
              />
            </div>
          )}
        </div>
        
        {/* Item Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 ${
                item.item_type === 'accommodation' ? 'bg-[#5A9A3A]/20 text-[#5A9A3A]' :
                item.item_type === 'activity' ? 'bg-[#FF9E6D]/20 text-[#FF9E6D]' :
                'bg-[#A0522D]/20 text-[#A0522D]'
              }`}>
                {item.item_type === 'accommodation' ? 'Stay' : item.item_type === 'activity' ? 'Activity' : 'Product'}
              </span>
              <h3 className="font-heading font-semibold text-white text-lg">{item.item_name}</h3>
            </div>
            <button 
              onClick={() => removeFromCart(item.id)}
              className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
              data-testid={`remove-item-${index}`}
            >
              <Icon name="Trash2" size={18} />
            </button>
          </div>
          
          {/* Item Meta */}
          <div className="flex flex-wrap gap-3 text-sm text-[#B8C4A8] mb-3">
            {(details.checkIn || details.check_in_date) && (
              <span className="flex items-center gap-1">
                <Icon name="Calendar" size={14} className="text-[#5A9A3A]" />
                {formatDate(details.checkIn || details.check_in_date)}
                {(details.checkOut || details.check_out_date) && ` - ${formatDate(details.checkOut || details.check_out_date)}`}
              </span>
            )}
            {details.date && !details.checkIn && (
              <span className="flex items-center gap-1">
                <Icon name="Calendar" size={14} className="text-[#5A9A3A]" />
                {formatDate(details.date)}
              </span>
            )}
            {(details.guests || details.participants) && (
              <span className="flex items-center gap-1">
                <Icon name="Users" size={14} className="text-[#FF9E6D]" />
                {details.guests || details.participants} {details.guests ? 'Guests' : 'Participants'}
              </span>
            )}
            {details.nights && (
              <span className="flex items-center gap-1">
                <Icon name="Moon" size={14} className="text-[#A0522D]" />
                {details.nights} Nights
              </span>
            )}
          </div>
          
          {/* Quantity & Price */}
          <div className="flex items-center justify-between">
            {item.item_type === 'product' ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-lg bg-[#1E3A1E] text-[#B8C4A8] hover:text-white flex items-center justify-center"
                  data-testid={`decrease-qty-${index}`}
                >
                  <Icon name="Minus" size={16} />
                </button>
                <span className="w-8 text-center text-white font-medium">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-[#1E3A1E] text-[#B8C4A8] hover:text-white flex items-center justify-center"
                  data-testid={`increase-qty-${index}`}
                >
                  <Icon name="Plus" size={16} />
                </button>
              </div>
            ) : (
              <span className="text-sm text-[#B8C4A8]">Qty: {item.quantity}</span>
            )}
            <div className="text-right">
              <p className="text-xl font-bold text-[#5A9A3A]">₹{item.total_price?.toLocaleString()}</p>
              {item.quantity > 1 && (
                <p className="text-xs text-[#B8C4A8]">₹{item.unit_price?.toLocaleString()} each</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Empty Cart State
  if (!cartLoading && cartItems.length === 0 && checkoutStep !== 'confirmation') {
    return (
      <div className="min-h-screen bg-[#1E3A1E]">
        <Header />
        <main className="pt-[88px] px-4 pb-12">
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-[#2A4A2A] rounded-full flex items-center justify-center">
              <Icon name="ShoppingCart" size={48} className="text-[#5A9A3A]/50" />
            </div>
            <h1 className="font-heading font-bold text-3xl text-white mb-4">Your Cart is Empty</h1>
            <p className="text-[#B8C4A8] mb-8">Explore our accommodations, activities, and products to start planning your adventure.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-[#5A9A3A] to-[#2D5016]">
                <Icon name="Home" size={18} /> Browse Accommodations
              </Button>
              <Button onClick={() => navigate('/activity-booking')} variant="outline" className="border-[#FF9E6D] text-[#FF9E6D]">
                <Icon name="Compass" size={18} /> Explore Activities
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Confirmation Page
  if (checkoutStep === 'confirmation' && orderResult) {
    return (
      <div className="min-h-screen bg-[#1E3A1E]">
        <Header />
        <main className="pt-[88px] px-4 pb-12">
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <Icon name="CheckCircle" size={48} className="text-green-400" />
            </div>
            <h1 className="font-heading font-bold text-3xl text-white mb-2">Booking Confirmed!</h1>
            <p className="text-[#B8C4A8] mb-8">Thank you for your booking. A confirmation email has been sent.</p>
            
            <div className="bg-[#2A4A2A] rounded-2xl p-6 border border-[#5A9A3A]/30 text-left mb-6">
              <h3 className="font-heading font-semibold text-lg text-white mb-4">Order Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#B8C4A8]">Order ID</span>
                  <span className="text-white font-mono">{orderResult.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#B8C4A8]">Booking Reference(s)</span>
                  <span className="text-[#5A9A3A] font-mono">{orderResult.booking_references?.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#B8C4A8]">Total Amount</span>
                  <span className="text-white font-bold text-lg">₹{orderResult.total_amount?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {orderResult.user_password && (
              <div className="bg-[#FF9E6D]/10 border border-[#FF9E6D]/30 rounded-xl p-6 mb-6 text-left">
                <div className="flex items-start gap-3">
                  <Icon name="Key" size={24} className="text-[#FF9E6D] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Your Account Has Been Created!</h4>
                    <p className="text-[#B8C4A8] text-sm mb-3">
                      Save these credentials to view your bookings and manage your profile:
                    </p>
                    <div className="bg-[#1E3A1E] rounded-lg p-3 font-mono text-sm">
                      <p className="text-[#B8C4A8]">Email: <span className="text-white">{guestInfo.email}</span></p>
                      <p className="text-[#B8C4A8]">Password: <span className="text-[#FF9E6D]">{orderResult.user_password}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => navigate('/user-dashboard')} 
                className="bg-gradient-to-r from-[#5A9A3A] to-[#2D5016]"
                data-testid="view-bookings-btn"
              >
                <Icon name="User" size={18} /> View My Bookings
              </Button>
              <Button onClick={() => navigate('/')} variant="outline" className="border-[#5A9A3A]/50 text-[#B8C4A8]">
                <Icon name="Home" size={18} /> Back to Home
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E3A1E]" data-testid="shopping-cart-page">
      <Header />
      
      <main className="pt-[88px] px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-white mb-2">
              {checkoutStep === 'cart' ? 'Shopping Cart' : 'Checkout'}
            </h1>
            
            {/* Progress Steps */}
            <div className="flex items-center gap-2 mt-4">
              {['cart', 'details', 'payment'].map((step, idx) => (
                <React.Fragment key={step}>
                  <div className={`flex items-center gap-2 ${
                    checkoutStep === step ? 'text-[#5A9A3A]' : 
                    ['details', 'payment'].indexOf(checkoutStep) > ['details', 'payment'].indexOf(step) ? 'text-[#5A9A3A]' : 'text-[#B8C4A8]/50'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      checkoutStep === step ? 'bg-[#5A9A3A] text-white' : 
                      ['details', 'payment'].indexOf(checkoutStep) > ['details', 'payment'].indexOf(step) ? 'bg-[#5A9A3A]/50 text-white' : 'bg-[#2A4A2A] text-[#B8C4A8]'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className="text-sm font-medium hidden sm:inline">
                      {step === 'cart' ? 'Review Cart' : step === 'details' ? 'Your Details' : 'Payment'}
                    </span>
                  </div>
                  {idx < 2 && <div className="w-8 h-px bg-[#5A9A3A]/30" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {checkoutStep === 'cart' && (
                <>
                  {cartItems.map((item, index) => (
                    <CartItemCard key={item.id} item={item} index={index} />
                  ))}
                  
                  <div className="flex justify-between items-center pt-4">
                    <button 
                      onClick={() => navigate(-1)}
                      className="text-[#B8C4A8] hover:text-white flex items-center gap-2"
                    >
                      <Icon name="ArrowLeft" size={18} /> Continue Shopping
                    </button>
                    <button 
                      onClick={clearCart}
                      className="text-red-400 hover:text-red-300 flex items-center gap-2 text-sm"
                      data-testid="clear-cart-btn"
                    >
                      <Icon name="Trash2" size={16} /> Clear Cart
                    </button>
                  </div>
                </>
              )}

              {checkoutStep === 'details' && (
                <div className="bg-[#2A4A2A] rounded-2xl p-6 border border-[#5A9A3A]/30">
                  <h2 className="font-heading font-semibold text-xl text-white mb-6 flex items-center gap-3">
                    <Icon name="User" size={24} className="text-[#5A9A3A]" />
                    Guest Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#B8C4A8] mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={guestInfo.fullName}
                        onChange={(e) => setGuestInfo(prev => ({ ...prev, fullName: e.target.value }))}
                        className={`w-full px-4 py-3 bg-[#1E3A1E] border ${errors.fullName ? 'border-red-500' : 'border-[#5A9A3A]/30'} rounded-xl text-white focus:outline-none focus:border-[#5A9A3A]`}
                        placeholder="Enter your full name"
                        data-testid="guest-name-input"
                      />
                      {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#B8C4A8] mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={guestInfo.email}
                        onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                        className={`w-full px-4 py-3 bg-[#1E3A1E] border ${errors.email ? 'border-red-500' : 'border-[#5A9A3A]/30'} rounded-xl text-white focus:outline-none focus:border-[#5A9A3A]`}
                        placeholder="your.email@example.com"
                        data-testid="guest-email-input"
                      />
                      {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#B8C4A8] mb-2">Phone Number *</label>
                        <input
                          type="tel"
                          value={guestInfo.phone}
                          onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
                          className={`w-full px-4 py-3 bg-[#1E3A1E] border ${errors.phone ? 'border-red-500' : 'border-[#5A9A3A]/30'} rounded-xl text-white focus:outline-none focus:border-[#5A9A3A]`}
                          placeholder="10-digit mobile number"
                          data-testid="guest-phone-input"
                        />
                        {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#B8C4A8] mb-2">Alternate Phone</label>
                        <input
                          type="tel"
                          value={guestInfo.alternatePhone}
                          onChange={(e) => setGuestInfo(prev => ({ ...prev, alternatePhone: e.target.value }))}
                          className="w-full px-4 py-3 bg-[#1E3A1E] border border-[#5A9A3A]/30 rounded-xl text-white focus:outline-none focus:border-[#5A9A3A]"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    {!isAuthenticated && (
                      <div className="flex items-start gap-3 p-4 bg-[#5A9A3A]/10 border border-[#5A9A3A]/30 rounded-xl">
                        <input
                          type="checkbox"
                          id="createAccount"
                          checked={guestInfo.createAccount}
                          onChange={(e) => setGuestInfo(prev => ({ ...prev, createAccount: e.target.checked }))}
                          className="mt-1 w-5 h-5 rounded border-[#5A9A3A]/30 bg-[#1E3A1E] text-[#5A9A3A]"
                          data-testid="create-account-checkbox"
                        />
                        <label htmlFor="createAccount" className="text-sm">
                          <span className="text-white font-medium">Create an account</span>
                          <p className="text-[#B8C4A8] mt-0.5">
                            Get access to your bookings, special offers, and manage your profile. 
                            We'll send your login credentials to your email.
                          </p>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {checkoutStep === 'payment' && (
                <div className="bg-[#2A4A2A] rounded-2xl p-6 border border-[#5A9A3A]/30">
                  <h2 className="font-heading font-semibold text-xl text-white mb-6 flex items-center gap-3">
                    <Icon name="CreditCard" size={24} className="text-[#5A9A3A]" />
                    Payment Method
                  </h2>
                  
                  {/* Demo Payment Notice */}
                  <div className="p-4 bg-[#FF9E6D]/10 border border-[#FF9E6D]/30 rounded-xl mb-6">
                    <div className="flex items-start gap-3">
                      <Icon name="Info" size={20} className="text-[#FF9E6D] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Demo Mode</p>
                        <p className="text-[#B8C4A8] text-sm">
                          This is a demo checkout. No actual payment will be processed. 
                          Click "Confirm Booking" to simulate a successful payment.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Options */}
                  <div className="space-y-3">
                    {[
                      { id: 'card', label: 'Credit/Debit Card', icon: 'CreditCard' },
                      { id: 'upi', label: 'UPI Payment', icon: 'Smartphone' },
                      { id: 'netbanking', label: 'Net Banking', icon: 'Landmark' }
                    ].map(option => (
                      <label 
                        key={option.id}
                        className="flex items-center gap-4 p-4 bg-[#1E3A1E] border border-[#5A9A3A]/30 rounded-xl cursor-pointer hover:border-[#5A9A3A]/50 transition-colors"
                      >
                        <input 
                          type="radio" 
                          name="payment" 
                          value={option.id}
                          defaultChecked={option.id === 'card'}
                          className="w-5 h-5 text-[#5A9A3A]"
                        />
                        <Icon name={option.icon} size={20} className="text-[#5A9A3A]" />
                        <span className="text-white">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-[#2A4A2A] rounded-2xl p-6 border border-[#5A9A3A]/30 sticky top-24">
                <h2 className="font-heading font-semibold text-lg text-white mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B8C4A8]">Items ({cartItems.length})</span>
                    <span className="text-white">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B8C4A8]">GST ({gstRate}%)</span>
                    <span className="text-white">₹{gstAmount.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-[#5A9A3A]/30 pt-3 flex justify-between">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-[#5A9A3A] font-bold text-xl">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Cart Items Summary */}
                <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-[#1E3A1E] rounded-lg">
                      <div className="w-10 h-10 bg-[#5A9A3A]/20 rounded flex items-center justify-center">
                        <Icon 
                          name={item.item_type === 'accommodation' ? 'Home' : item.item_type === 'activity' ? 'Compass' : 'ShoppingBag'} 
                          size={16} 
                          className="text-[#5A9A3A]" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{item.item_name}</p>
                        <p className="text-[#B8C4A8] text-xs">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-white text-sm">₹{item.total_price?.toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                {checkoutStep === 'cart' && (
                  <Button 
                    onClick={() => setCheckoutStep('details')}
                    className="w-full bg-gradient-to-r from-[#5A9A3A] to-[#2D5016]"
                    data-testid="proceed-checkout-btn"
                  >
                    Proceed to Checkout <Icon name="ArrowRight" size={18} />
                  </Button>
                )}

                {checkoutStep === 'details' && (
                  <div className="space-y-3">
                    <Button 
                      onClick={() => setCheckoutStep('payment')}
                      className="w-full bg-gradient-to-r from-[#5A9A3A] to-[#2D5016]"
                      data-testid="proceed-payment-btn"
                    >
                      Continue to Payment <Icon name="ArrowRight" size={18} />
                    </Button>
                    <button 
                      onClick={() => setCheckoutStep('cart')}
                      className="w-full text-[#B8C4A8] hover:text-white text-sm flex items-center justify-center gap-2"
                    >
                      <Icon name="ArrowLeft" size={16} /> Back to Cart
                    </button>
                  </div>
                )}

                {checkoutStep === 'payment' && (
                  <div className="space-y-3">
                    <Button 
                      onClick={handleCheckout}
                      disabled={processing}
                      className="w-full bg-gradient-to-r from-[#FF9E6D] to-[#FF6B35]"
                      data-testid="confirm-booking-btn"
                    >
                      {processing ? (
                        <>
                          <Icon name="Loader2" size={18} className="animate-spin" /> Processing...
                        </>
                      ) : (
                        <>
                          <Icon name="Check" size={18} /> Confirm Booking
                        </>
                      )}
                    </Button>
                    <button 
                      onClick={() => setCheckoutStep('details')}
                      className="w-full text-[#B8C4A8] hover:text-white text-sm flex items-center justify-center gap-2"
                    >
                      <Icon name="ArrowLeft" size={16} /> Back to Details
                    </button>
                  </div>
                )}

                {/* Secure Checkout Badge */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#B8C4A8]">
                  <Icon name="Shield" size={14} className="text-[#5A9A3A]" />
                  <span>Secure checkout powered by SSL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShoppingCart;
