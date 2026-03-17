import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Image from '../AppImage';


const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItemCount] = useState(3);
  const [isAuthenticated] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const navigationItems = [
    { label: 'Home', path: '/home-landing', icon: 'Home' },
    { label: 'Book Stay', path: '/interactive-map-booking', icon: 'MapPin' },
    { label: 'Activities', path: '/activity-booking', icon: 'Compass' },
    { label: 'Safari Routes', path: '/safari-route-explorer', icon: 'Map' },
    { label: 'Shop', path: '/e-shop', icon: 'ShoppingBag' }
  ];

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
      {/* Full header with gradient stripe background */}
      <div className="relative">
        {/* Gradient stripe spanning full header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2D5016] via-[#4A7C2E] via-40% via-[#8B4513] via-70% to-[#FF6B35]" />
        
        {/* Main header content with subtle gradient overlay */}
        <div className="bg-gradient-to-r from-[#2D5016]/5 via-[#8B4513]/5 to-[#FF6B35]/5 shadow-md border-b-4 border-gradient" style={{borderImage: 'linear-gradient(to right, #2D5016, #4A7C2E, #8B4513, #FF6B35) 1'}}>
          <div className="max-w-screen-2xl mx-auto">
            <div className="flex items-center justify-between h-20 px-6">
          <div className="flex items-center gap-8">
            <Link to="/home-landing" className="flex items-center gap-3 transition-organic hover-lift">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden transition-organic bg-white/80 shadow-sm">
                <Image 
                  src="/assets/images/MTR-1769601441831.png" 
                  alt="Mudumalai Tiger Reserve Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-xl text-[#2D5016]">Mudumalai Tiger Reserve</span>
                <span className="text-caption text-[#8B4513] text-xs font-medium">Where Wildlife Thrives</span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-2">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-organic hover-lift ${
                    isActivePath(item?.path)
                      ? 'bg-gradient-to-r from-[#2D5016] to-[#4A7C2E] text-white shadow-sm'
                      : 'text-[#2D5016] hover:bg-[#2D5016]/10'
                  }`}
                >
                  <Icon name={item?.icon} size={20} strokeWidth={2} />
                  <span className="font-medium">{item?.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleCartClick}
              className="relative p-3 rounded-lg transition-organic hover:bg-[#2D5016]/10 hover-lift active-press text-[#2D5016]"
              aria-label="Shopping cart"
            >
              <Icon name="ShoppingCart" size={24} strokeWidth={2} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF6B35] text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {cartItemCount}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={toggleAccountMenu}
                className="flex items-center gap-2 p-3 rounded-lg transition-organic hover:bg-[#2D5016]/10 hover-lift active-press text-[#2D5016]"
                aria-label="User account"
              >
                <Icon name={isAuthenticated ? 'User' : 'UserCircle'} size={24} strokeWidth={2} />
              </button>

              {accountMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={toggleAccountMenu}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl shadow-lg z-dropdown border border-border">
                    <div className="p-2">
                      {isAuthenticated ? (
                        <>
                          <button
                            onClick={handleDashboardClick}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-organic hover:bg-muted text-left"
                          >
                            <Icon name="LayoutDashboard" size={20} strokeWidth={2} />
                            <span>Dashboard</span>
                          </button>
                          <button
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-organic hover:bg-muted text-left"
                          >
                            <Icon name="Settings" size={20} strokeWidth={2} />
                            <span>Settings</span>
                          </button>
                          <div className="h-px bg-border my-2" />
                          <button
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-organic hover:bg-destructive hover:text-destructive-foreground text-left"
                          >
                            <Icon name="LogOut" size={20} strokeWidth={2} />
                            <span>Sign Out</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-organic hover:bg-muted text-left"
                          >
                            <Icon name="LogIn" size={20} strokeWidth={2} />
                            <span>Sign In</span>
                          </button>
                          <button
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-organic hover:bg-muted text-left"
                          >
                            <Icon name="UserPlus" size={20} strokeWidth={2} />
                            <span>Create Account</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-3 rounded-lg transition-organic hover:bg-[#2D5016]/10 active-press text-[#2D5016]"
              aria-label="Toggle mobile menu"
            >
              <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={24} strokeWidth={2} />
            </button>
          </div>
        </div>
        </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-background z-40 lg:hidden"
            onClick={toggleMobileMenu}
          />
          <div className="fixed top-[88px] left-0 right-0 bottom-0 bg-card z-dropdown lg:hidden overflow-y-auto border-t-4" style={{borderImage: 'linear-gradient(to right, #2D5016, #4A7C2E, #8B4513, #FF6B35) 1'}}>
            <nav className="p-6 space-y-2">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  onClick={toggleMobileMenu}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-organic ${
                    isActivePath(item?.path)
                      ? 'bg-gradient-to-r from-[#2D5016] to-[#4A7C2E] text-white shadow-sm'
                      : 'text-[#2D5016] hover:bg-[#2D5016]/10'
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