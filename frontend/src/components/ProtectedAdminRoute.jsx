import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Icon from './AppIcon';

const ProtectedAdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAdminAuth = () => {
      try {
        const adminSession = localStorage.getItem('admin_session');
        
        if (!adminSession) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        const session = JSON.parse(adminSession);
        
        // Check if session is valid (not expired - 24 hours)
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);

        if (hoursSinceLogin > 24) {
          // Session expired
          localStorage.removeItem('admin_session');
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('admin_session');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;