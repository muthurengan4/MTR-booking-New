import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

const ReportsDownload = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('booking');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [locations, setLocations] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);

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

      const uniqueLocations = [...new Set(roomTypes?.map(rt => rt.location).filter(Boolean))];
      setLocations(uniqueLocations);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchReportData = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    setLoading(true);
    try {
      let query = supabase?.from('bookings')?.select('*')?.gte('booking_date', startDate)?.lte('booking_date', endDate)?.order('booking_date', { ascending: false });

      const { data: bookings, error } = await query;

      if (error) throw error;

      // Filter by location if specified
      let filteredData = bookings || [];
      if (locationFilter !== 'all') {
        filteredData = bookings?.filter(b => 
          b?.item_name?.toLowerCase()?.includes(locationFilter?.toLowerCase())
        ) || [];
      }

      // Filter by report type
      if (reportType === 'accommodation') {
        filteredData = filteredData?.filter(b => b?.booking_type === 'accommodation');
      } else if (reportType === 'activity') {
        filteredData = filteredData?.filter(b => b?.booking_type === 'activity');
      }

      setReportData(filteredData);
      calculateSummary(filteredData);
    } catch (error) {
      console.error('Error fetching report data:', error);
      alert('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data) => {
    const totalBookings = data?.length;
    const totalRevenue = data?.reduce((sum, b) => sum + parseFloat(b?.amount || 0), 0);
    const confirmedBookings = data?.filter(b => b?.status === 'confirmed' || b?.status === 'completed')?.length;
    const cancelledBookings = data?.filter(b => b?.status === 'cancelled')?.length;
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Calculate occupancy for accommodation bookings
    let occupancyRate = 0;
    if (reportType === 'accommodation' || reportType === 'booking') {
      const accommodationBookings = data?.filter(b => b?.booking_type === 'accommodation');
      const totalRoomNights = accommodationBookings?.reduce((sum, b) => {
        if (b?.check_in_date && b?.check_out_date) {
          const checkIn = new Date(b.check_in_date);
          const checkOut = new Date(b.check_out_date);
          const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
          return sum + nights;
        }
        return sum;
      }, 0);

      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const totalAvailableRoomNights = 50 * daysDiff; // Assuming 50 rooms
      occupancyRate = totalAvailableRoomNights > 0 ? (totalRoomNights / totalAvailableRoomNights * 100) : 0;
    }

    setSummary({
      totalBookings,
      totalRevenue,
      confirmedBookings,
      cancelledBookings,
      averageBookingValue,
      occupancyRate
    });
  };

  const generatePDF = () => {
    if (reportData?.length === 0) {
      alert('No data to export. Please generate a report first.');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc?.internal?.pageSize?.getWidth();

    // Title
    doc?.setFontSize(18);
    doc?.setFont('helvetica', 'bold');
    const title = `${reportType?.charAt(0)?.toUpperCase() + reportType?.slice(1)} Report`;
    doc?.text(title, pageWidth / 2, 15, { align: 'center' });

    // Date range and location
    doc?.setFontSize(10);
    doc?.setFont('helvetica', 'normal');
    doc?.text(`Period: ${startDate} to ${endDate}`, 14, 25);
    doc?.text(`Location: ${locationFilter === 'all' ? 'All Locations' : locationFilter}`, 14, 30);
    doc?.text(`Generated: ${new Date()?.toLocaleString()}`, 14, 35);

    // Summary section
    if (summary) {
      doc?.setFontSize(12);
      doc?.setFont('helvetica', 'bold');
      doc?.text('Summary', 14, 45);
      doc?.setFontSize(10);
      doc?.setFont('helvetica', 'normal');
      let yPos = 52;
      doc?.text(`Total Bookings: ${summary?.totalBookings}`, 14, yPos);
      yPos += 5;
      doc?.text(`Total Revenue: ₹${summary?.totalRevenue?.toFixed(2)}`, 14, yPos);
      yPos += 5;
      doc?.text(`Average Booking Value: ₹${summary?.averageBookingValue?.toFixed(2)}`, 14, yPos);
      yPos += 5;
      doc?.text(`Confirmed: ${summary?.confirmedBookings} | Cancelled: ${summary?.cancelledBookings}`, 14, yPos);
      if (reportType === 'accommodation' || reportType === 'booking') {
        yPos += 5;
        doc?.text(`Occupancy Rate: ${summary?.occupancyRate?.toFixed(2)}%`, 14, yPos);
      }
    }

    // Table data
    const tableData = reportData?.map(booking => [
      booking?.booking_reference,
      booking?.customer_name,
      booking?.booking_type,
      booking?.item_name,
      new Date(booking.booking_date)?.toLocaleDateString(),
      booking?.check_in_date ? new Date(booking.check_in_date)?.toLocaleDateString() : 'N/A',
      booking?.guests_count || 'N/A',
      `₹${parseFloat(booking?.amount)?.toFixed(2)}`,
      booking?.status
    ]);

    doc?.autoTable({
      startY: summary ? 75 : 45,
      head: [['Reference', 'Customer', 'Type', 'Item', 'Booking Date', 'Check-in', 'Guests', 'Amount', 'Status']],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [34, 139, 34], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 10 }
    });

    // Save PDF
    const fileName = `${reportType}_report_${startDate}_to_${endDate}.pdf`;
    doc?.save(fileName);
  };

  const generateCSV = () => {
    if (reportData?.length === 0) {
      alert('No data to export. Please generate a report first.');
      return;
    }

    // Prepare CSV data
    const csvData = reportData?.map(booking => ({
      'Booking Reference': booking?.booking_reference,
      'Customer Name': booking?.customer_name,
      'Customer Email': booking?.customer_email,
      'Customer Phone': booking?.customer_phone || 'N/A',
      'Booking Type': booking?.booking_type,
      'Item Name': booking?.item_name,
      'Booking Date': booking?.booking_date,
      'Check-in Date': booking?.check_in_date || 'N/A',
      'Check-out Date': booking?.check_out_date || 'N/A',
      'Guests Count': booking?.guests_count || 'N/A',
      'Amount': booking?.amount,
      'Status': booking?.status,
      'Payment Status': booking?.payment_status
    }));

    // Add summary row at the beginning
    if (summary) {
      const summaryRow = {
        'Booking Reference': 'SUMMARY',
        'Customer Name': `Total Bookings: ${summary?.totalBookings}`,
        'Customer Email': `Total Revenue: ₹${summary?.totalRevenue?.toFixed(2)}`,
        'Customer Phone': `Avg Value: ₹${summary?.averageBookingValue?.toFixed(2)}`,
        'Booking Type': `Confirmed: ${summary?.confirmedBookings}`,
        'Item Name': `Cancelled: ${summary?.cancelledBookings}`,
        'Booking Date': reportType === 'accommodation' || reportType === 'booking' ? `Occupancy: ${summary?.occupancyRate?.toFixed(2)}%` : '',
        'Check-in Date': '',
        'Check-out Date': '',
        'Guests Count': '',
        'Amount': '',
        'Status': '',
        'Payment Status': ''
      };
      csvData?.unshift({}, summaryRow, {});
    }

    // Convert to CSV
    const csv = Papa?.unparse(csvData);

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link?.setAttribute('href', url);
    link?.setAttribute('download', `${reportType}_report_${startDate}_to_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body?.appendChild(link);
    link?.click();
    document.body?.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <Icon name="FileText" size={24} color="var(--color-primary)" strokeWidth={2} />
        </div>
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">Downloadable Reports</h2>
          <p className="text-muted-foreground">Generate and download business analysis reports</p>
        </div>
      </div>
      {/* Filters Section */}
      <div className="bg-muted/30 rounded-xl p-6 border border-border">
        <h3 className="font-semibold text-lg mb-4 text-foreground">Report Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Report Type
            </label>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e?.target?.value)}
              className="w-full"
            >
              <option value="booking">All Bookings</option>
              <option value="accommodation">Accommodation Only</option>
              <option value="activity">Activities Only</option>
              <option value="revenue">Revenue Analysis</option>
              <option value="occupancy">Occupancy Report</option>
            </Select>
          </div>

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

        {/* Generate Button */}
        <div className="mt-4">
          <Button
            onClick={fetchReportData}
            disabled={loading}
            className="w-full md:w-auto"
          >
            {loading ? (
              <>
                <Icon name="Loader2" size={20} className="animate-spin" strokeWidth={2} />
                <span>Generating Report...</span>
              </>
            ) : (
              <>
                <Icon name="Search" size={20} strokeWidth={2} />
                <span>Generate Report</span>
              </>
            )}
          </Button>
        </div>
      </div>
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Icon name="Calendar" size={20} color="#3b82f6" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold text-foreground">{summary?.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Icon name="DollarSign" size={20} color="#22c55e" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">₹{summary?.totalRevenue?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Icon name="TrendingUp" size={20} color="#a855f7" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Booking Value</p>
                <p className="text-2xl font-bold text-foreground">₹{summary?.averageBookingValue?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {(reportType === 'accommodation' || reportType === 'booking' || reportType === 'occupancy') && (
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Icon name="Home" size={20} color="#f97316" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-foreground">{summary?.occupancyRate?.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Export Buttons */}
      {reportData?.length > 0 && (
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="font-semibold text-lg mb-4 text-foreground">Export Options</h3>
          <div className="flex flex-wrap gap-4">
            <Button onClick={generatePDF} variant="default">
              <Icon name="FileText" size={20} strokeWidth={2} />
              <span>Download PDF</span>
            </Button>
            <Button onClick={generateCSV} variant="outline">
              <Icon name="Table" size={20} strokeWidth={2} />
              <span>Download CSV</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            {reportData?.length} record(s) ready for export
          </p>
        </div>
      )}
      {/* Data Preview Table */}
      {reportData?.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-lg text-foreground">Data Preview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Reference</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Item</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reportData?.slice(0, 10)?.map((booking) => (
                  <tr key={booking?.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm text-foreground">{booking?.booking_reference}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{booking?.customer_name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{booking?.booking_type}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{booking?.item_name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(booking.booking_date)?.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">₹{parseFloat(booking?.amount)?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking?.status === 'completed' ? 'bg-green-100 text-green-800' :
                        booking?.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        booking?.status === 'cancelled'? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {booking?.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {reportData?.length > 10 && (
            <div className="p-4 border-t border-border text-center text-sm text-muted-foreground">
              Showing 10 of {reportData?.length} records. Download full report for complete data.
            </div>
          )}
        </div>
      )}
      {/* Empty State */}
      {!loading && reportData?.length === 0 && (
        <div className="bg-card rounded-xl p-12 border border-border text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="FileText" size={32} color="var(--color-muted-foreground)" strokeWidth={2} />
          </div>
          <h3 className="font-semibold text-lg text-foreground mb-2">No Report Generated</h3>
          <p className="text-muted-foreground">
            Configure your report parameters above and click "Generate Report" to view data.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportsDownload;