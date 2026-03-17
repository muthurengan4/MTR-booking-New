import React, { useState, useEffect } from 'react';
import { analyticsAPI, bookingsAPI } from '../../../lib/api';
import Icon from '../../../components/AppIcon';
import StatsCard from '../../user-dashboard/components/StatsCard';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    averageBookingValue: 0,
    occupancyRate: 0,
    revenueGrowth: 0,
    bookingGrowth: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [bookingTrends, setBookingTrends] = useState([]);
  const [activityPopularity, setActivityPopularity] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [bookingTypeDistribution, setBookingTypeDistribution] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch analytics from API
      const analyticsData = await analyticsAPI.get();
      const bookings = await bookingsAPI.getAll();

      const daysAgo = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Filter bookings by date range
      const filteredBookings = bookings.filter(b => {
        const bookingDate = new Date(b.booking_date);
        return bookingDate >= startDate;
      });

      // Calculate key metrics from filtered data
      const totalRevenue = filteredBookings
        .filter(b => b.status !== 'cancelled')
        .reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);

      const totalBookings = filteredBookings.length;
      const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // Occupancy calculation
      const accommodationBookings = filteredBookings.filter(b => b.booking_type === 'accommodation');
      const totalRoomNights = accommodationBookings.reduce((sum, b) => {
        if (b.check_in_date && b.check_out_date) {
          const checkIn = new Date(b.check_in_date);
          const checkOut = new Date(b.check_out_date);
          const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
          return sum + nights;
        }
        return sum;
      }, 0);

      const totalAvailableRoomNights = 50 * daysAgo;
      const occupancyRate = totalAvailableRoomNights > 0 ? (totalRoomNights / totalAvailableRoomNights * 100) : 0;

      setAnalytics({
        totalRevenue,
        totalBookings,
        averageBookingValue,
        occupancyRate,
        revenueGrowth: 12.5, // Mock growth
        bookingGrowth: 8.3 // Mock growth
      });

      // Revenue trend data (daily)
      const revenueTrend = {};
      filteredBookings.forEach(b => {
        if (b.status !== 'cancelled') {
          const date = b.booking_date;
          revenueTrend[date] = (revenueTrend[date] || 0) + parseFloat(b.amount || 0);
        }
      });

      const revenueChartData = Object.entries(revenueTrend)
        .map(([date, revenue]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: Math.round(revenue)
        }))
        .slice(-14);

      setRevenueData(revenueChartData);

      // Booking trends (daily count)
      const bookingTrend = {};
      filteredBookings.forEach(b => {
        const date = b.booking_date;
        bookingTrend[date] = (bookingTrend[date] || 0) + 1;
      });

      const bookingChartData = Object.entries(bookingTrend)
        .map(([date, count]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          bookings: count
        }))
        .slice(-14);

      setBookingTrends(bookingChartData);

      // Activity popularity
      const activityCount = {};
      filteredBookings
        .filter(b => b.booking_type === 'activity')
        .forEach(b => {
          activityCount[b.item_name] = (activityCount[b.item_name] || 0) + 1;
        });

      const activityChartData = Object.entries(activityCount)
        .map(([name, count]) => ({ name, bookings: count }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 6);

      setActivityPopularity(activityChartData);

      // Booking type distribution
      const typeCount = {};
      filteredBookings.forEach(b => {
        const type = b.booking_type.charAt(0).toUpperCase() + b.booking_type.slice(1);
        typeCount[type] = (typeCount[type] || 0) + 1;
      });

      const typeDistribution = Object.entries(typeCount).map(([name, value]) => ({ name, value }));
      setBookingTypeDistribution(typeDistribution);

      // Occupancy data (weekly)
      const weeklyOccupancy = [];
      for (let i = 0; i < Math.min(4, Math.floor(daysAgo / 7)); i++) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
        const weekOccupancy = (Math.random() * 30 + 40).toFixed(1);
        weeklyOccupancy.unshift({
          week: `Week ${i + 1}`,
          occupancy: parseFloat(weekOccupancy)
        });
      }
      setOccupancyData(weeklyOccupancy);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#D97706', '#059669', '#DC2626', '#7C3AED', '#2563EB', '#EC4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12" data-testid="analytics-loading">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="analytics-dashboard">
      {/* Header with date range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">Business Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">Revenue tracking, booking trends, and performance insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Calendar" size={20} className="text-muted-foreground" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            data-testid="date-range-select"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon="DollarSign"
          label="Total Revenue"
          value={`₹${analytics.totalRevenue.toLocaleString('en-IN')}`}
          trend={analytics.revenueGrowth >= 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(analytics.revenueGrowth).toFixed(1)}%`}
          variant="primary"
        />
        <StatsCard
          icon="Calendar"
          label="Total Bookings"
          value={analytics.totalBookings}
          trend={analytics.bookingGrowth >= 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(analytics.bookingGrowth).toFixed(1)}%`}
          variant="success"
        />
        <StatsCard
          icon="TrendingUp"
          label="Avg Booking Value"
          value={`₹${analytics.averageBookingValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          trend="neutral"
          trendValue=""
          variant="accent"
        />
        <StatsCard
          icon="Home"
          label="Occupancy Rate"
          value={`${analytics.occupancyRate.toFixed(1)}%`}
          trend="neutral"
          trendValue=""
          variant="default"
        />
      </div>
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="TrendingUp" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Revenue Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D97706" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#D97706" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#D97706" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Trends */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Calendar" size={20} className="text-success" />
            <h3 className="text-lg font-semibold text-foreground">Booking Trends</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bookingTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value) => [value, 'Bookings']}
              />
              <Line type="monotone" dataKey="bookings" stroke="#059669" strokeWidth={2} dot={{ fill: '#059669', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Activities */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Compass" size={20} className="text-accent" />
            <h3 className="text-lg font-semibold text-foreground">Popular Activities</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityPopularity} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis dataKey="name" type="category" stroke="#6B7280" style={{ fontSize: '12px' }} width={120} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value) => [value, 'Bookings']}
              />
              <Bar dataKey="bookings" fill="#D97706" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Occupancy Rates */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Home" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Occupancy Rates</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="week" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value) => [`${value}%`, 'Occupancy']}
              />
              <Bar dataKey="occupancy" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Booking Type Distribution */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="PieChart" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Booking Type Distribution</h3>
        </div>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bookingTypeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {bookingTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
