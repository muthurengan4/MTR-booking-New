import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import ShoppingCart from './pages/shopping-cart';
import HomeLanding from './pages/home-landing';
import ActivityBooking from './pages/activity-booking';
import EShop from './pages/e-shop';
import UserDashboard from './pages/user-dashboard';
import AdminDashboard from './pages/admin-dashboard';
import AdminLogin from './pages/admin-login';
import SafariRouteExplorer from './pages/safari-route-explorer';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<HomeLanding />} />
        <Route path="/shopping-cart" element={<ShoppingCart />} />
        <Route path="/home-landing" element={<HomeLanding />} />
        <Route path="/activity-booking" element={<ActivityBooking />} />
        <Route path="/e-shop" element={<EShop />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/safari-route-explorer" element={<SafariRouteExplorer />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
