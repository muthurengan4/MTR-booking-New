import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import StatsCard from '../../user-dashboard/components/StatsCard';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

const COLORS = ['#D97706', '#059669', '#7C3AED', '#2563EB', '#DC2626'];

const FinancialManagement = () => {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [locations, setLocations] = useState([]);
  
  // Financial metrics
  const [financialSummary, setFinancialSummary] = useState({
    totalRevenue: 0,
    totalGST: 0,
    netRevenue: 0,
    totalCancellations: 0,
    totalRefunded: 0,
    cancellationImpact: 0
  });
  
  // Chart data
  const [gstBreakdown, setGstBreakdown] = useState([]);
  const [cancellationData, setCancellationData] = useState([]);
  const [revenueByType, setRevenueByType] = useState([]);
  const [locationRevenue, setLocationRevenue] = useState([]);

  useEffect(() => {
    fetchLocations();
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo?.setDate(today?.getDate() - 30);
    setStartDate(thirtyDaysAgo?.toISOString()?.split('T')?.[0]);
    setEndDate(today?.toISOString()?.split('T')?.[0]);
  }, []);

  const fetchLocations = async () => {
    try {
      const { data: roomTypes } = await supabase?.from('room_types')?.select('location')?.order('location');
      const uniqueLocations = [...new Set(roomTypes?.map(rt => rt?.location)?.filter(Boolean))];
      setLocations(uniqueLocations);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchFinancialData = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    setLoading(true);
    try {
      // Fetch GST breakdown by location
      const { data: gstData, error: gstError } = await supabase?.rpc('calculate_gst_breakdown', {
        start_date: startDate,
        end_date: endDate,
        filter_location: locationFilter === 'all' ? null : locationFilter
      });

      if (gstError) throw gstError;

      // Fetch cancellation impact
      const { data: cancellationImpactData, error: cancellationError } = await supabase?.rpc('calculate_cancellation_impact', {
        start_date: startDate,
        end_date: endDate,
        filter_location: locationFilter === 'all' ? null : locationFilter
      });

      if (cancellationError) throw cancellationError;

      // Fetch revenue by booking type
      const { data: revenueTypeData, error: revenueTypeError } = await supabase?.rpc('get_revenue_by_type', {
        start_date: startDate,
        end_date: endDate,
        filter_location: locationFilter === 'all' ? null : locationFilter
      });

      if (revenueTypeError) throw revenueTypeError;

      // Calculate summary metrics
      const totalRevenue = gstData?.reduce((sum, item) => sum + parseFloat(item?.total_revenue || 0), 0) || 0;
      const totalGST = gstData?.reduce((sum, item) => sum + parseFloat(item?.total_gst || 0), 0) || 0;
      const netRevenue = gstData?.reduce((sum, item) => sum + parseFloat(item?.net_revenue || 0), 0) || 0;
      const totalCancellations = cancellationImpactData?.reduce((sum, item) => sum + parseInt(item?.total_cancellations || 0), 0) || 0;
      const totalRefunded = cancellationImpactData?.reduce((sum, item) => sum + parseFloat(item?.total_refunded || 0), 0) || 0;
      const cancellationImpact = cancellationImpactData?.reduce((sum, item) => sum + parseFloat(item?.impact_on_revenue || 0), 0) || 0;

      setFinancialSummary({
        totalRevenue,
        totalGST,
        netRevenue,
        totalCancellations,
        totalRefunded,
        cancellationImpact
      });

      // Format data for charts
      setGstBreakdown(gstData?.map(item => ({
        location: item?.location,
        revenue: parseFloat(item?.total_revenue || 0),
        gst: parseFloat(item?.total_gst || 0),
        net: parseFloat(item?.net_revenue || 0)
      })) || []);

      setCancellationData(cancellationImpactData?.map(item => ({
        location: item?.location,
        cancellations: parseInt(item?.total_cancellations || 0),
        refunded: parseFloat(item?.total_refunded || 0),
        impact: parseFloat(item?.impact_on_revenue || 0)
      })) || []);

      setRevenueByType(revenueTypeData?.map(item => ({
        type: item?.booking_type,
        revenue: parseFloat(item?.total_revenue || 0),
        gst: parseFloat(item?.total_gst || 0),
        count: parseInt(item?.booking_count || 0)
      })) || []);

      setLocationRevenue(gstData?.map(item => ({
        name: item?.location,
        value: parseFloat(item?.total_revenue || 0)
      })) || []);

    } catch (error) {
      console.error('Error fetching financial data:', error);
      alert('Failed to fetch financial data');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc?.setFontSize(18);
    doc?.text('Financial Management Report', 14, 20);
    
    // Date range
    doc?.setFontSize(11);
    doc?.text(`Period: ${startDate} to ${endDate}`, 14, 30);
    doc?.text(`Location: ${locationFilter === 'all' ? 'All Locations' : locationFilter}`, 14, 36);
    
    // Summary section
    doc?.setFontSize(14);
    doc?.text('Financial Summary', 14, 46);
    
    const summaryData = [
      ['Total Revenue', `₹${financialSummary?.totalRevenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
      ['Total GST Collected', `₹${financialSummary?.totalGST?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
      ['Net Revenue', `₹${financialSummary?.netRevenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
      ['Total Cancellations', financialSummary?.totalCancellations?.toString()],
      ['Total Refunded', `₹${financialSummary?.totalRefunded?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
      ['Cancellation Impact', `₹${financialSummary?.cancellationImpact?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`]
    ];
    
    doc?.autoTable({
      startY: 50,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid'
    });
    
    // GST Breakdown by Location
    doc?.setFontSize(14);
    doc?.text('GST Breakdown by Location', 14, doc?.lastAutoTable?.finalY + 10);
    
    const gstTableData = gstBreakdown?.map(item => [
      item?.location,
      `₹${item?.revenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      `₹${item?.gst?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      `₹${item?.net?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    ]);
    
    doc?.autoTable({
      startY: doc?.lastAutoTable?.finalY + 14,
      head: [['Location', 'Total Revenue', 'GST Amount', 'Net Revenue']],
      body: gstTableData,
      theme: 'grid'
    });
    
    // Cancellation Impact
    doc?.addPage();
    doc?.setFontSize(14);
    doc?.text('Cancellation Impact by Location', 14, 20);
    
    const cancellationTableData = cancellationData?.map(item => [
      item?.location,
      item?.cancellations?.toString(),
      `₹${item?.refunded?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      `₹${item?.impact?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    ]);
    
    doc?.autoTable({
      startY: 24,
      head: [['Location', 'Cancellations', 'Refunded', 'Revenue Impact']],
      body: cancellationTableData,
      theme: 'grid'
    });
    
    // Revenue by Type
    doc?.setFontSize(14);
    doc?.text('Revenue by Booking Type', 14, doc?.lastAutoTable?.finalY + 10);
    
    const revenueTypeTableData = revenueByType?.map(item => [
      item?.type,
      item?.count?.toString(),
      `₹${item?.revenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      `₹${item?.gst?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    ]);
    
    doc?.autoTable({
      startY: doc?.lastAutoTable?.finalY + 14,
      head: [['Booking Type', 'Count', 'Revenue', 'GST']],
      body: revenueTypeTableData,
      theme: 'grid'
    });
    
    doc?.save(`Financial_Report_${startDate}_to_${endDate}.pdf`);
  };

  const exportToCSV = () => {
    const csvData = [];
    
    // Summary section
    csvData?.push(['Financial Management Report']);
    csvData?.push([`Period: ${startDate} to ${endDate}`]);
    csvData?.push([`Location: ${locationFilter === 'all' ? 'All Locations' : locationFilter}`]);
    csvData?.push([]);
    
    csvData?.push(['Financial Summary']);
    csvData?.push(['Metric', 'Value']);
    csvData?.push(['Total Revenue', financialSummary?.totalRevenue?.toFixed(2)]);
    csvData?.push(['Total GST Collected', financialSummary?.totalGST?.toFixed(2)]);
    csvData?.push(['Net Revenue', financialSummary?.netRevenue?.toFixed(2)]);
    csvData?.push(['Total Cancellations', financialSummary?.totalCancellations]);
    csvData?.push(['Total Refunded', financialSummary?.totalRefunded?.toFixed(2)]);
    csvData?.push(['Cancellation Impact', financialSummary?.cancellationImpact?.toFixed(2)]);
    csvData?.push([]);
    
    // GST Breakdown
    csvData?.push(['GST Breakdown by Location']);
    csvData?.push(['Location', 'Total Revenue', 'GST Amount', 'Net Revenue']);
    gstBreakdown?.forEach(item => {
      csvData?.push([item?.location, item?.revenue?.toFixed(2), item?.gst?.toFixed(2), item?.net?.toFixed(2)]);
    });
    csvData?.push([]);
    
    // Cancellation Impact
    csvData?.push(['Cancellation Impact by Location']);
    csvData?.push(['Location', 'Cancellations', 'Refunded', 'Revenue Impact']);
    cancellationData?.forEach(item => {
      csvData?.push([item?.location, item?.cancellations, item?.refunded?.toFixed(2), item?.impact?.toFixed(2)]);
    });
    csvData?.push([]);
    
    // Revenue by Type
    csvData?.push(['Revenue by Booking Type']);
    csvData?.push(['Booking Type', 'Count', 'Revenue', 'GST']);
    revenueByType?.forEach(item => {
      csvData?.push([item?.type, item?.count, item?.revenue?.toFixed(2), item?.gst?.toFixed(2)]);
    });
    
    const csv = Papa?.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Financial_Report_${startDate}_to_${endDate}.csv`;
    link?.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <Icon name="DollarSign" size={24} color="var(--color-primary)" strokeWidth={2} />
        </div>
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">Financial Management</h2>
          <p className="text-muted-foreground">Revenue tracking, GST calculations, and cancellation impact analysis</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-muted/30 rounded-xl p-6 border border-border">
        <h3 className="font-semibold text-lg mb-4 text-foreground">Report Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e?.target?.value)}
              className="w-full"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e?.target?.value)}
              className="w-full"
            />
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Location
            </label>
            <Select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e?.target?.value)}
              className="w-full"
            >
              <option value="all">All Locations</option>
              {locations?.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            onClick={fetchFinancialData}
            disabled={loading}
            className="flex-1 md:flex-none"
          >
            {loading ? (
              <>
                <Icon name="Loader2" size={20} className="animate-spin" strokeWidth={2} />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Icon name="Search" size={20} strokeWidth={2} />
                <span>Generate Report</span>
              </>
            )}
          </Button>
          
          {gstBreakdown?.length > 0 && (
            <>
              <Button
                onClick={exportToPDF}
                variant="outline"
                className="flex-1 md:flex-none"
              >
                <Icon name="FileText" size={20} strokeWidth={2} />
                <span>Export PDF</span>
              </Button>
              
              <Button
                onClick={exportToCSV}
                variant="outline"
                className="flex-1 md:flex-none"
              >
                <Icon name="Download" size={20} strokeWidth={2} />
                <span>Export CSV</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {gstBreakdown?.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatsCard
              icon="TrendingUp"
              label="Total Revenue"
              value={`₹${financialSummary?.totalRevenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              variant="primary"
              trend="up"
              trendValue="0"
            />
            <StatsCard
              icon="Receipt"
              label="Total GST Collected"
              value={`₹${financialSummary?.totalGST?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              variant="success"
              trend="up"
              trendValue="0"
            />
            <StatsCard
              icon="Wallet"
              label="Net Revenue"
              value={`₹${financialSummary?.netRevenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              variant="accent"
              trend="up"
              trendValue="0"
            />
            <StatsCard
              icon="XCircle"
              label="Total Cancellations"
              value={financialSummary?.totalCancellations?.toString()}
              variant="default"
              trend="neutral"
              trendValue="0"
            />
            <StatsCard
              icon="RefreshCw"
              label="Total Refunded"
              value={`₹${financialSummary?.totalRefunded?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              variant="default"
              trend="down"
              trendValue="0"
            />
            <StatsCard
              icon="AlertTriangle"
              label="Cancellation Impact"
              value={`₹${financialSummary?.cancellationImpact?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              variant="default"
              trend="down"
              trendValue="0"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GST Breakdown by Location */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="MapPin" size={20} className="text-primary" />
                <h3 className="text-lg font-semibold text-foreground">GST Breakdown by Location</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gstBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="location" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    formatter={(value) => [`₹${value?.toLocaleString('en-IN')}`, '']}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#D97706" name="Total Revenue" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="gst" fill="#059669" name="GST Amount" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="net" fill="#7C3AED" name="Net Revenue" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Distribution by Location */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="PieChart" size={20} className="text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Revenue Distribution</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={locationRevenue}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100)?.toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {locationRevenue?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    formatter={(value) => [`₹${value?.toLocaleString('en-IN')}`, 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Cancellation Impact */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="AlertTriangle" size={20} className="text-destructive" />
                <h3 className="text-lg font-semibold text-foreground">Cancellation Impact</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cancellationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="location" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    formatter={(value, name) => {
                      if (name === 'Cancellations') return [value, name];
                      return [`₹${value?.toLocaleString('en-IN')}`, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="cancellations" fill="#DC2626" name="Cancellations" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="refunded" fill="#F59E0B" name="Refunded" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="impact" fill="#EF4444" name="Revenue Impact" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue by Booking Type */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="BarChart3" size={20} className="text-success" />
                <h3 className="text-lg font-semibold text-foreground">Revenue by Booking Type</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByType} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis dataKey="type" type="category" stroke="#6B7280" style={{ fontSize: '12px' }} width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    formatter={(value) => [`₹${value?.toLocaleString('en-IN')}`, '']}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#059669" name="Revenue" radius={[0, 8, 8, 0]} />
                  <Bar dataKey="gst" fill="#D97706" name="GST" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Tables */}
          <div className="grid grid-cols-1 gap-6">
            {/* GST Breakdown Table */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">GST Breakdown Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Location</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Total Revenue</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">GST Amount</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Net Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gstBreakdown?.map((item, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm text-foreground">{item?.location}</td>
                        <td className="py-3 px-4 text-sm text-right text-foreground">₹{item?.revenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-4 text-sm text-right text-success">₹{item?.gst?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-4 text-sm text-right text-primary">₹{item?.net?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cancellation Impact Table */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Cancellation Impact Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Location</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Cancellations</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Refunded</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Revenue Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cancellationData?.map((item, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm text-foreground">{item?.location}</td>
                        <td className="py-3 px-4 text-sm text-right text-foreground">{item?.cancellations}</td>
                        <td className="py-3 px-4 text-sm text-right text-warning">₹{item?.refunded?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-4 text-sm text-right text-destructive">₹{item?.impact?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && gstBreakdown?.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Icon name="FileText" size={48} className="mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Data Available</h3>
          <p className="text-muted-foreground mb-4">Select date range and location, then click Generate Report to view financial data</p>
        </div>
      )}
    </div>
  );
};

export default FinancialManagement;