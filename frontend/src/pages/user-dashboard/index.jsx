import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/navigation/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useUserAuth } from '../../contexts/UserAuthContext';
import api from '../../lib/api';

// Simple toast notification
const showToast = (message, type = 'success') => {
  const toastEl = document.createElement('div');
  toastEl.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all transform ${
    type === 'success' ? 'bg-green-600 text-white' : type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'
  }`;
  toastEl.textContent = message;
  document.body.appendChild(toastEl);
  setTimeout(() => toastEl.remove(), 3000);
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, logout, loading: authLoading } = useUserAuth();
  
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchBookings();
    } else if (!authLoading) {
      setShowLoginModal(true);
      setLoadingBookings(false);
    }
  }, [isAuthenticated, token, authLoading]);

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = await api.get('/api/users/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      showToast('Failed to load bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    
    try {
      const response = await api.post('/api/users/login', loginForm);
      
      if (response.data?.success) {
        localStorage.setItem('user_token', response.data.token);
        window.location.reload();
      } else {
        setLoginError(response.data?.message || 'Login failed');
      }
    } catch (error) {
      setLoginError('Login failed. Please check your credentials.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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

  // Stats calculations
  const stats = {
    totalBookings: bookings.length,
    upcoming: bookings.filter(b => b.status === 'confirmed' && new Date(b.check_in_date) > new Date()).length,
    completed: bookings.filter(b => b.status === 'completed').length,
    totalSpent: bookings.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + (b.amount || 0), 0)
  };

  // Login Modal
  const LoginModal = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2A4A2A] rounded-2xl p-8 max-w-md w-full border border-[#5A9A3A]/30">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#5A9A3A]/20 rounded-full flex items-center justify-center">
            <Icon name="User" size={32} className="text-[#5A9A3A]" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-white mb-2">Welcome Back</h2>
          <p className="text-[#B8C4A8] text-sm">Login to view your bookings and manage your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {loginError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {loginError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#B8C4A8] mb-2">Email</label>
            <input
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 bg-[#1E3A1E] border border-[#5A9A3A]/30 rounded-xl text-white focus:outline-none focus:border-[#5A9A3A]"
              placeholder="your.email@example.com"
              required
              data-testid="login-email-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#B8C4A8] mb-2">Password</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 bg-[#1E3A1E] border border-[#5A9A3A]/30 rounded-xl text-white focus:outline-none focus:border-[#5A9A3A]"
              placeholder="Enter your password"
              required
              data-testid="login-password-input"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loggingIn}
            className="w-full bg-gradient-to-r from-[#5A9A3A] to-[#2D5016]"
            data-testid="login-submit-btn"
          >
            {loggingIn ? (
              <><Icon name="Loader2" size={18} className="animate-spin" /> Logging in...</>
            ) : (
              <><Icon name="LogIn" size={18} /> Login</>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#B8C4A8] text-sm mb-3">Don't have an account?</p>
          <button 
            onClick={() => navigate('/')}
            className="text-[#5A9A3A] hover:text-[#5A8C3E] text-sm font-medium"
          >
            Book your first stay to create one automatically
          </button>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 p-2 text-[#B8C4A8] hover:text-white"
        >
          <Icon name="X" size={24} />
        </button>
      </div>
    </div>
  );

  // If not authenticated, show login
  if (!isAuthenticated && !authLoading) {
    return (
      <div className="min-h-screen bg-[#1E3A1E]">
        <Header />
        <main className="pt-[88px] px-4 pb-12">
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-[#2A4A2A] rounded-full flex items-center justify-center">
              <Icon name="Lock" size={48} className="text-[#5A9A3A]/50" />
            </div>
            <h1 className="font-heading font-bold text-3xl text-white mb-4">Login Required</h1>
            <p className="text-[#B8C4A8] mb-8">Please login to access your dashboard and view your bookings.</p>
          </div>
          <LoginModal />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E3A1E]" data-testid="user-dashboard">
      <Header />
      
      <main className="pt-[88px] px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* User Profile Header */}
          <div className="bg-gradient-to-r from-[#2D5016] to-[#5A9A3A] rounded-2xl p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <h1 className="font-heading font-bold text-2xl text-white">{user?.full_name || 'Guest'}</h1>
                  <p className="text-white/70">{user?.email}</p>
                  <p className="text-white/50 text-sm">Member since {user?.member_since ? formatDate(user.member_since) : 'Recently'}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors"
              >
                <Icon name="LogOut" size={18} /> Logout
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Bookings', value: stats.totalBookings, icon: 'Calendar', color: '#5A9A3A' },
              { label: 'Upcoming', value: stats.upcoming, icon: 'Clock', color: '#FF9E6D' },
              { label: 'Completed', value: stats.completed, icon: 'CheckCircle', color: '#22C55E' },
              { label: 'Total Spent', value: `₹${stats.totalSpent.toLocaleString()}`, icon: 'Wallet', color: '#A0522D' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-[#2A4A2A] rounded-xl p-4 border border-[#5A9A3A]/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}20` }}>
                    <Icon name={stat.icon} size={20} style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-[#B8C4A8]">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: 'bookings', label: 'My Bookings', icon: 'Calendar' },
              { id: 'profile', label: 'Profile', icon: 'User' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-[#5A9A3A] text-white' 
                    : 'bg-[#2A4A2A] text-[#B8C4A8] hover:bg-[#3A5A3A]'
                }`}
              >
                <Icon name={tab.icon} size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {loadingBookings ? (
                <div className="text-center py-12">
                  <Icon name="Loader2" size={32} className="text-[#5A9A3A] animate-spin mx-auto mb-4" />
                  <p className="text-[#B8C4A8]">Loading your bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12 bg-[#2A4A2A] rounded-2xl border border-[#5A9A3A]/30">
                  <div className="w-20 h-20 mx-auto mb-4 bg-[#5A9A3A]/20 rounded-full flex items-center justify-center">
                    <Icon name="Calendar" size={36} className="text-[#5A9A3A]/50" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl text-white mb-2">No Bookings Yet</h3>
                  <p className="text-[#B8C4A8] mb-6">Start planning your wildlife adventure today!</p>
                  <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-[#5A9A3A] to-[#2D5016]">
                    <Icon name="Search" size={18} /> Explore Accommodations
                  </Button>
                </div>
              ) : (
                bookings.map((booking, idx) => (
                  <div 
                    key={booking.id || idx}
                    className="bg-[#2A4A2A] rounded-xl p-5 border border-[#5A9A3A]/30"
                    data-testid={`booking-card-${idx}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          booking.booking_type === 'accommodation' ? 'bg-[#5A9A3A]/20' :
                          booking.booking_type === 'activity' ? 'bg-[#FF9E6D]/20' : 'bg-[#A0522D]/20'
                        }`}>
                          <Icon 
                            name={booking.booking_type === 'accommodation' ? 'Home' : booking.booking_type === 'activity' ? 'Compass' : 'ShoppingBag'} 
                            size={24} 
                            className={
                              booking.booking_type === 'accommodation' ? 'text-[#5A9A3A]' :
                              booking.booking_type === 'activity' ? 'text-[#FF9E6D]' : 'text-[#A0522D]'
                            }
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-heading font-semibold text-white text-lg">{booking.item_name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                          <p className="text-[#B8C4A8] text-sm mb-2">Ref: {booking.booking_reference}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-[#B8C4A8]">
                            {booking.check_in_date && (
                              <span className="flex items-center gap-1">
                                <Icon name="Calendar" size={14} className="text-[#5A9A3A]" />
                                {formatDate(booking.check_in_date)}
                                {booking.check_out_date && booking.check_out_date !== booking.check_in_date && (
                                  <> - {formatDate(booking.check_out_date)}</>
                                )}
                              </span>
                            )}
                            {booking.guests_count && (
                              <span className="flex items-center gap-1">
                                <Icon name="Users" size={14} className="text-[#FF9E6D]" />
                                {booking.guests_count} Guests
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#5A9A3A]">₹{booking.amount?.toLocaleString()}</p>
                        <p className={`text-xs ${booking.payment_status === 'paid' ? 'text-green-400' : 'text-amber-400'}`}>
                          {booking.payment_status === 'paid' ? '✓ Paid' : 'Pending Payment'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-[#2A4A2A] rounded-2xl p-6 border border-[#5A9A3A]/30">
              <h2 className="font-heading font-semibold text-xl text-white mb-6">Profile Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#B8C4A8] mb-2">Full Name</label>
                  <p className="text-white">{user?.full_name || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#B8C4A8] mb-2">Email</label>
                  <p className="text-white">{user?.email || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#B8C4A8] mb-2">Phone</label>
                  <p className="text-white">{user?.phone || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#B8C4A8] mb-2">User ID</label>
                  <p className="text-white font-mono">{user?.user_id || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#B8C4A8] mb-2">Member Since</label>
                  <p className="text-white">{user?.member_since ? formatDate(user.member_since) : '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#B8C4A8] mb-2">Account Status</label>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${user?.is_verified ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {user?.is_verified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
