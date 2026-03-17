import React, { useState, useEffect } from 'react';
import Header from '../../components/navigation/Header';
import Icon from '../../components/AppIcon';
import { useNavigate } from 'react-router-dom';

import RoomManagement from './components/RoomManagement';
import ActivityManagement from './components/ActivityManagement';
import RefundManagement from './components/RefundManagement';
import RoomTypeManagement from './components/RoomTypeManagement';
import ActivityTypeManagement from './components/ActivityTypeManagement';
import IntegrationSettings from './components/IntegrationSettings';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ReportsDownload from './components/ReportsDownload';
import FinancialManagement from './components/FinancialManagement';
import SafariRouteManagement from './components/SafariRouteManagement';
import WildlifeZoneManagement from './components/WildlifeZoneManagement';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    // Load admin info from session
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
      setAdminInfo(JSON.parse(adminSession));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    navigate('/admin/login');
  };

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
    { id: 'reports', label: 'Reports', icon: 'FileText' },
    { id: 'financial', label: 'Financial Management', icon: 'DollarSign' },
    { id: 'safari-routes', label: 'Safari Routes', icon: 'Map' },
    { id: 'wildlife-zones', label: 'Wildlife Zones', icon: 'Binoculars' },
    { id: 'room-types', label: 'Room Types', icon: 'Home' },
    { id: 'activity-types', label: 'Activity Types', icon: 'Compass' },
    { id: 'rooms', label: 'Room Management', icon: 'Bed' },
    { id: 'activities', label: 'Activity Management', icon: 'Map' },
    { id: 'refunds', label: 'Refund Processing', icon: 'DollarSign' },
    { id: 'integrations', label: 'Integration Settings', icon: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        {/* Header Section */}
        <div className="bg-card border-b border-border">
          <div className="max-w-screen-2xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Icon name="Settings" size={24} color="var(--color-primary)" strokeWidth={2} />
                </div>
                <div>
                  <h1 className="font-heading text-3xl font-bold text-foreground">Admin Dashboard</h1>
                  <p className="text-muted-foreground">Manage resort operations and bookings</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {adminInfo && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{adminInfo?.fullName || adminInfo?.username}</p>
                    <p className="text-xs text-muted-foreground">{adminInfo?.email}</p>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                >
                  <Icon name="LogOut" size={20} strokeWidth={2} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar + Content Layout */}
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex">
            {/* Left Sidebar Navigation */}
            <aside className="w-64 bg-card border-r border-border min-h-[calc(100vh-180px)] sticky top-20">
              <nav className="p-4 space-y-1">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-organic text-left ${
                      activeTab === tab?.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon name={tab?.icon} size={20} strokeWidth={2} />
                    <span>{tab?.label}</span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-6 bg-background">
              <div className="bg-card rounded-xl border border-border p-6">
                {activeTab === 'analytics' && <AnalyticsDashboard />}
                {activeTab === 'reports' && <ReportsDownload />}
                {activeTab === 'financial' && <FinancialManagement />}
                {activeTab === 'safari-routes' && <SafariRouteManagement />}
                {activeTab === 'wildlife-zones' && <WildlifeZoneManagement />}
                {activeTab === 'room-types' && <RoomTypeManagement />}
                {activeTab === 'activity-types' && <ActivityTypeManagement />}
                {activeTab === 'rooms' && <RoomManagement />}
                {activeTab === 'activities' && <ActivityManagement />}
                {activeTab === 'refunds' && <RefundManagement />}
                {activeTab === 'integrations' && <IntegrationSettings />}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;