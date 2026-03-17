import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import { bookingsAPI } from '../../../lib/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FinancialManagement = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    totalGST: 0,
    netRevenue: 0,
    totalCancellations: 0,
    totalRefunded: 0,
    revenueByType: [],
    revenueByLocation: []
  });

  useEffect(() => {
    fetchFinancialData();
  }, [dateRange, selectedLocation]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const bookings = await bookingsAPI.getAll();
      
      const daysAgo = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      
      const filteredBookings = bookings.filter(b => new Date(b.booking_date) >= startDate);
      
      // Calculate totals
      const activeBookings = filteredBookings.filter(b => b.status !== 'cancelled');
      const cancelledBookings = filteredBookings.filter(b => b.status === 'cancelled');
      
      const totalRevenue = activeBookings.reduce((sum, b) => sum + b.amount, 0);
      const totalGST = activeBookings.reduce((sum, b) => sum + (b.gst_amount || 0), 0);
      const totalRefunded = cancelledBookings.reduce((sum, b) => sum + (b.refund_amount || 0), 0);
      
      // Revenue by type
      const revenueByType = {};
      activeBookings.forEach(b => {
        const type = b.booking_type.charAt(0).toUpperCase() + b.booking_type.slice(1);
        revenueByType[type] = (revenueByType[type] || 0) + b.amount;
      });
      
      // Revenue by location (extracted from item_name)
      const revenueByLocation = {};
      activeBookings.forEach(b => {
        const location = b.item_name.includes('Masinagudi') ? 'Masinagudi' :
                        b.item_name.includes('Gudalur') ? 'Gudalur' :
                        b.item_name.includes('Ooty') ? 'Ooty' : 'Other';
        revenueByLocation[location] = (revenueByLocation[location] || 0) + b.amount;
      });
      
      setFinancialData({
        totalRevenue,
        totalGST,
        netRevenue: totalRevenue - totalGST,
        totalCancellations: cancelledBookings.length,
        totalRefunded,
        revenueByType: Object.entries(revenueByType).map(([name, value]) => ({ name, value })),
        revenueByLocation: Object.entries(revenueByLocation).map(([name, value]) => ({ name, value }))
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#D97706', '#059669', '#DC2626', '#7C3AED', '#2563EB'];

  const dateRangeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: '365', label: 'Last year' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="financial-management">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">Financial Management</h2>
          <p className="text-muted-foreground">GST breakdown, revenue analysis, and cancellation impact</p>
        </div>
        <Select
          options={dateRangeOptions}
          value={dateRange}
          onChange={setDateRange}
          className="w-48"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-muted rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="DollarSign" size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-semibold text-foreground">₹{financialData.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-muted rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Icon name="Receipt" size={20} className="text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total GST (12%)</p>
              <p className="text-xl font-semibold text-foreground">₹{financialData.totalGST.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-muted rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={20} className="text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Revenue</p>
              <p className="text-xl font-semibold text-foreground">₹{financialData.netRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-muted rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
              <Icon name="RefreshCw" size={20} className="text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Refunded</p>
              <p className="text-xl font-semibold text-foreground">₹{financialData.totalRefunded.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Revenue by Booking Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={financialData.revenueByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="value" fill="#D97706" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Revenue by Location</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={financialData.revenueByLocation}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {financialData.revenueByLocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GST Summary Table */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">GST Breakdown Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Gross Revenue</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">GST (12%)</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Net Revenue</th>
              </tr>
            </thead>
            <tbody>
              {financialData.revenueByType.map((item, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="py-3 px-4 text-foreground">{item.name}</td>
                  <td className="py-3 px-4 text-right text-foreground">₹{item.value.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-muted-foreground">₹{Math.round(item.value * 0.12 / 1.12).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-success">₹{Math.round(item.value / 1.12).toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-muted font-semibold">
                <td className="py-3 px-4 text-foreground">Total</td>
                <td className="py-3 px-4 text-right text-foreground">₹{financialData.totalRevenue.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-foreground">₹{financialData.totalGST.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-success">₹{financialData.netRevenue.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialManagement;
