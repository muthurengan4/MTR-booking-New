import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Image from '../AppImage';
import { useCart } from '../../contexts/CartContext';
import { useUserAuth } from '../../contexts/UserAuthContext';


const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const { user, isAuthenticated } = useUserAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItemCount = getCartCount();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const navigationItems = [
    { label: 'Home', path: '/home-landing', icon: 'Home' },
    { label: 'Book Stay', path: '/#booking', icon: 'MapPin', isScroll: true },
    { label: 'Activities', path: '/activity-booking', icon: 'Compass' },
    { label: 'Safari Routes', path: '/safari-route-explorer', icon: 'Map' },
    { label: 'Shop', path: '/e-shop', icon: 'ShoppingBag' }
  ];

  const handleNavClick = (item, e) => {
    if (item.isScroll) {
      e.preventDefault();
      // If not on homepage, navigate first then scroll
      if (location.pathname !== '/' && location.pathname !== '/home-landing') {
        navigate('/');
        setTimeout(() => {
          const bookingWidget = document.querySelector('[data-testid="hero-carousel"]');
          if (bookingWidget) {
            bookingWidget.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        // Already on homepage, just scroll
        const bookingWidget = document.querySelector('[data-testid="hero-carousel"]');
        if (bookingWidget) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  };

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleAccountMenu = () => {
    setAccountMenuOpen(!accountMenuOpen);
  };

  const handleCartClick = () => {
    window.location.href = '/shopping-cart';
  };

  const handleDashboardClick = () => {
    window.location.href = '/user-dashboard';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-navigation transition-organic">
      {/* Dark naturalistic header */}
      <div className="relative">
        {/* Gradient stripe at top */}
        <div className="h-1 bg-gradient-to-r from-[#2D5016] via-[#4A7C2E] via-40% via-[#8B4513] via-70% to-[#FF8C5A]" />
        
        {/* Main header with glass effect */}
        <div className="bg-[#0D1A0D]/95 backdrop-blur-md border-b border-[#4A7C2E]/30 shadow-lg shadow-black/20">
          <div className="max-w-screen-2xl mx-auto">
            <div className="flex items-center justify-between h-20 px-6">
              <div className="flex items-center gap-8">
                <Link to="/home-landing" className="flex items-center gap-3 transition-organic hover-lift">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden transition-organic bg-white/90 shadow-lg shadow-[#4A7C2E]/20">
                    <Image 
                      src="/assets/images/MTR-1769601441831.png" 
                      alt="Mudumalai Tiger Reserve Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-heading font-bold text-xl text-[#4A7C2E]">Mudumalai Tiger Reserve</span>
                    <span className="text-caption text-[#FF8C5A] text-xs font-medium">Where Wildlife Thrives</span>
                  </div>
                </Link>

                <nav className="hidden lg:flex items-center gap-1">
                  {navigationItems?.map((item) => (
                    <Link
                      key={item?.path}
                      to={item?.isScroll ? '/' : item?.path}
                      onClick={(e) => handleNavClick(item, e)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-organic ${
                        isActivePath(item?.path)
                          ? 'bg-gradient-to-r from-[#4A7C2E] to-[#2D5016] text-white shadow-lg shadow-[#4A7C2E]/30'
                          : 'text-[#9CA38B] hover:text-[#4A7C2E] hover:bg-[#4A7C2E]/10'
                      }`}
                    >
                      <Icon name={item?.icon} size={18} strokeWidth={2} />
                      <span className="font-medium text-sm">{item?.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCartClick}
                  className="relative p-3 rounded-lg transition-organic hover:bg-[#4A7C2E]/20 text-[#9CA38B] hover:text-[#4A7C2E]"
                  aria-label="Shopping cart"
                >
                  <Icon name="ShoppingCart" size={22} strokeWidth={2} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF8C5A] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                      {cartItemCount}
                    </span>
                  )}
                </button>

                <div className="relative">
                  <button
                    onClick={toggleAccountMenu}
                    className="flex items-center gap-2 p-3 rounded-lg transition-organic hover:bg-[#4A7C2E]/20 text-[#9CA38B] hover:text-[#4A7C2E]"
                    aria-label="User account"
                  >
                    <Icon name={isAuthenticated ? 'User' : 'UserCircle'} size={22} strokeWidth={2} />
                  </button>

                  {accountMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A2D1A] rounded-xl shadow-xl shadow-black/30 border border-[#4A7C2E]/30 overflow-hidden z-50">
                      {isAuthenticated ? (
                        <>
                          <button
                            onClick={handleDashboardClick}
                            className="w-full flex items-center gap-3 px-4 py-3 text-[#E0DCD7] hover:bg-[#4A7C2E]/20 transition-organic"
                          >
                            <Icon name="LayoutDashboard" size={18} />
                            <span>Dashboard</span>
                          </button>
                          <button
                            className="w-full flex items-center gap-3 px-4 py-3 text-[#E0DCD7] hover:bg-[#4A7C2E]/20 transition-organic"
                          >
                            <Icon name="LogOut" size={18} />
                            <span>Logout</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/admin/login"
                            className="w-full flex items-center gap-3 px-4 py-3 text-[#E0DCD7] hover:bg-[#4A7C2E]/20 transition-organic"
                          >
                            <Icon name="Shield" size={18} />
                            <span>Admin Login</span>
                          </Link>
                          <button
                            onClick={handleDashboardClick}
                            className="w-full flex items-center gap-3 px-4 py-3 text-[#E0DCD7] hover:bg-[#4A7C2E]/20 transition-organic"
                          >
                            <Icon name="User" size={18} />
                            <span>Guest Dashboard</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={toggleMobileMenu}
                  className="lg:hidden p-3 rounded-lg transition-organic hover:bg-[#4A7C2E]/20 text-[#9CA38B] hover:text-[#4A7C2E]"
                  aria-label="Toggle mobile menu"
                >
                  <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={24} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={toggleMobileMenu}
          />
          <div className="fixed top-[85px] left-0 right-0 bottom-0 bg-[#0D1A0D] z-50 lg:hidden overflow-y-auto border-t border-[#4A7C2E]/30">
            <nav className="p-6 space-y-2">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.isScroll ? '/' : item?.path}
                  onClick={(e) => {
                    handleNavClick(item, e);
                    toggleMobileMenu();
                  }}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-organic ${
                    isActivePath(item?.path)
                      ? 'bg-gradient-to-r from-[#4A7C2E] to-[#2D5016] text-white'
                      : 'text-[#9CA38B] hover:bg-[#4A7C2E]/20 hover:text-[#4A7C2E]'
                  }`}
                >
                  <Icon name={item?.icon} size={24} strokeWidth={2} />
                  <span className="font-medium text-lg">{item?.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
