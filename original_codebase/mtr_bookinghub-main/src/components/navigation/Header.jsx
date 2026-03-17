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
    <header className="fixed top-0 left-0 right-0 bg-card shadow-md z-navigation transition-organic">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between h-20 px-6">
          <div className="flex items-center gap-8">
            <Link to="/home-landing" className="flex items-center gap-3 transition-organic hover-lift">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden transition-organic">
                <Image 
                  src="/assets/images/MTR-1769601441831.png" 
                  alt="Mudumalai Tiger Reserve Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-xl text-foreground">Mudumalai Tiger Reserve</span>
                <span className="text-caption text-muted-foreground text-xs">Where Wildlife Thrives</span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-2">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-organic hover-lift ${
                    isActivePath(item?.path)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground hover:bg-muted'
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
              className="relative p-3 rounded-lg transition-organic hover:bg-muted hover-lift active-press"
              aria-label="Shopping cart"
            >
              <Icon name="ShoppingCart" size={24} strokeWidth={2} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  {cartItemCount}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={toggleAccountMenu}
                className="flex items-center gap-2 p-3 rounded-lg transition-organic hover:bg-muted hover-lift active-press"
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
              className="lg:hidden p-3 rounded-lg transition-organic hover:bg-muted active-press"
              aria-label="Toggle mobile menu"
            >
              <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={24} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-background z-40 lg:hidden"
            onClick={toggleMobileMenu}
          />
          <div className="fixed top-20 left-0 right-0 bottom-0 bg-card z-dropdown lg:hidden overflow-y-auto">
            <nav className="p-6 space-y-2">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  onClick={toggleMobileMenu}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-organic ${
                    isActivePath(item?.path)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground hover:bg-muted'
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