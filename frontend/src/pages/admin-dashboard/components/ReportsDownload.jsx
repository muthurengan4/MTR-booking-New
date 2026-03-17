import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { bookingsAPI } from '../../../lib/api';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

const ReportsDownload = () => {
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, [dateRange, reportType]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingsAPI.getAll(null, reportType === 'all' ? null : reportType);
      
      // Filter by date range
      const daysAgo = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      
      const filteredData = data.filter(b => new Date(b.booking_date) >= startDate);
      setBookings(filteredData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const dateRangeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: '365', label: 'Last year' }
  ];

  const reportTypeOptions = [
    { value: 'all', label: 'All Bookings' },
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'activity', label: 'Activities' },
    { value: 'product', label: 'Products' }
  ];

  const downloadCSV = () => {
    const csvData = bookings.map(b => ({
      'Booking ID': b.booking_reference,
      'Customer': b.customer_name,
      'Email': b.customer_email,
      'Phone': b.customer_phone || '',
      'Type': b.booking_type,
      'Item': b.item_name,
      'Date': b.booking_date,
      'Check-in': b.check_in_date || '',
      'Check-out': b.check_out_date || '',
      'Guests': b.guests_count,
      'Amount': b.amount,
      'GST': b.gst_amount,
      'Status': b.status,
      'Payment': b.payment_status
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bookings_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('MTR BookingHub - Booking Report', 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Period: Last ${dateRange} days`, 14, 36);
    doc.text(`Type: ${reportType === 'all' ? 'All Bookings' : reportType}`, 14, 42);

    const tableData = bookings.map(b => [
      b.booking_reference,
      b.customer_name,
      b.booking_type,
      b.item_name,
      b.booking_date,
      `₹${b.amount.toLocaleString()}`,
      b.status
    ]);

    doc.autoTable({
      head: [['Booking ID', 'Customer', 'Type', 'Item', 'Date', 'Amount', 'Status']],
      body: tableData,
      startY: 50,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [217, 119, 6] }
    });

    // Summary
    const totalRevenue = bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + b.amount, 0);
    const finalY = doc.lastAutoTable.finalY || 50;
    doc.text(`Total Bookings: ${bookings.length}`, 14, finalY + 10);
    doc.text(`Total Revenue: ₹${totalRevenue.toLocaleString()}`, 14, finalY + 16);

    doc.save(`bookings_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6" data-testid="reports-download">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">Reports & Export</h2>
          <p className="text-muted-foreground">Download booking reports in various formats</p>
        </div>
      </div>

      <div className="bg-muted rounded-lg border border-border p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Configure Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Date Range</label>
            <Select
              options={dateRangeOptions}
              value={dateRange}
              onChange={setDateRange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Booking Type</label>
            <Select
              options={reportTypeOptions}
              value={reportType}
              onChange={setReportType}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button onClick={downloadCSV} iconName="FileSpreadsheet" disabled={loading || bookings.length === 0}>
            Download CSV
          </Button>
          <Button onClick={downloadPDF} iconName="FileText" variant="outline" disabled={loading || bookings.length === 0}>
            Download PDF
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Report Preview</h3>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Icon name="Loader" size={32} className="animate-spin text-primary" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="FileX" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No bookings found for the selected criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Item</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 10).map((booking) => (
                  <tr key={booking.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-foreground">{booking.booking_reference}</td>
                    <td className="py-3 px-4 text-foreground">{booking.customer_name}</td>
                    <td className="py-3 px-4 text-foreground capitalize">{booking.booking_type}</td>
                    <td className="py-3 px-4 text-muted-foreground">{booking.item_name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{booking.booking_date}</td>
                    <td className="py-3 px-4 text-right text-foreground">₹{booking.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'completed' ? 'bg-success/10 text-success' :
                        booking.status === 'confirmed' ? 'bg-primary/10 text-primary' :
                        booking.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                        'bg-warning/10 text-warning'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length > 10 && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                Showing 10 of {bookings.length} bookings. Download full report for all data.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsDownload;
