import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { specialBookingRequestsAPI } from '../../../lib/api';

const SpecialBookingManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsData, statsData] = await Promise.all([
        specialBookingRequestsAPI.getAll(filterStatus === 'all' ? null : filterStatus),
        specialBookingRequestsAPI.getStats()
      ]);
      setRequests(requestsData || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedRequest || !reviewAction) return;

    setProcessing(true);
    try {
      await specialBookingRequestsAPI.review(selectedRequest.id, {
        status: reviewAction,
        review_notes: reviewNotes,
        rejection_reason: reviewAction === 'rejected' ? rejectionReason : null
      });
      
      setShowReviewModal(false);
      setSelectedRequest(null);
      setReviewAction(null);
      setReviewNotes('');
      setRejectionReason('');
      await fetchData();
    } catch (error) {
      console.error('Error reviewing request:', error);
      alert('Failed to process review');
    } finally {
      setProcessing(false);
    }
  };

  const openReviewModal = (request, action) => {
    setSelectedRequest(request);
    setReviewAction(action);
    setShowReviewModal(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">Special Booking Requests</h2>
          <p className="text-muted-foreground">Review and manage special accommodation requests from officials</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Icon name="FileText" size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Requests</p>
            </div>
          </div>
        </div>
        <div className="bg-muted rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={20} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-muted rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle" size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-muted rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Icon name="XCircle" size={20} className="text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.rejected}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border">
        {['all', 'pending', 'approved', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 font-medium transition-colors ${
              filterStatus === status
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === 'pending' && stats.pending > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                {stats.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-xl border border-border">
            <Icon name="Inbox" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No requests found</p>
          </div>
        ) : (
          requests.map(request => (
            <div key={request.id} className="bg-muted rounded-xl border border-border p-5">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Left - Main Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono text-sm text-primary bg-primary/10 px-2 py-1 rounded">
                      {request.request_number}
                    </span>
                    {getStatusBadge(request.status)}
                    <span className="text-xs text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-1">{request.full_name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {request.designation}, {request.department}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="text-foreground font-medium">{request.location}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Check-in</p>
                      <p className="text-foreground font-medium">{request.check_in_date}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Check-out</p>
                      <p className="text-foreground font-medium">{request.check_out_date}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rooms / People</p>
                      <p className="text-foreground font-medium">{request.number_of_rooms} / {request.number_of_people}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon name="Phone" size={14} /> {request.mobile_number}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Mail" size={14} /> {request.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="MapPin" size={14} /> {request.state}
                    </span>
                    {request.safari_required && (
                      <span className="flex items-center gap-1 text-accent">
                        <Icon name="Compass" size={14} /> Safari Required
                      </span>
                    )}
                  </div>
                </div>

                {/* Right - Actions & Amount */}
                <div className="lg:w-64 space-y-4">
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Estimated Amount</p>
                    <p className="text-2xl font-bold text-primary">₹{request.estimated_amount?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {request.number_of_rooms} room(s) × {request.total_room_nights} night(s)
                    </p>
                  </div>

                  {/* Document Link */}
                  {request.document_url && (
                    <a
                      href={request.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-background rounded-lg text-sm text-foreground hover:bg-primary/10 transition-colors"
                    >
                      <Icon name="FileText" size={18} className="text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">View Document</p>
                        <p className="text-xs text-muted-foreground">{request.document_type === 'id_proof' ? 'ID Proof' : 'Official Letter'}</p>
                      </div>
                      <Icon name="ExternalLink" size={16} />
                    </a>
                  )}

                  {/* Action Buttons */}
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        iconName="CheckCircle"
                        onClick={() => openReviewModal(request, 'approved')}
                        className="flex-1"
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        iconName="XCircle"
                        onClick={() => openReviewModal(request, 'rejected')}
                        className="flex-1"
                      >
                        Reject
                      </Button>
                    </div>
                  )}

                  {/* Review Info */}
                  {request.status !== 'pending' && request.reviewed_at && (
                    <div className="p-3 bg-background rounded-lg text-sm">
                      <p className="text-muted-foreground">
                        {request.status === 'approved' ? 'Approved' : 'Rejected'} on {new Date(request.reviewed_at).toLocaleDateString()}
                      </p>
                      {request.review_notes && (
                        <p className="text-foreground mt-1">{request.review_notes}</p>
                      )}
                      {request.rejection_reason && (
                        <p className="text-red-400 mt-1">Reason: {request.rejection_reason}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                reviewAction === 'approved' ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                <Icon 
                  name={reviewAction === 'approved' ? 'CheckCircle' : 'XCircle'} 
                  size={28} 
                  className={reviewAction === 'approved' ? 'text-green-400' : 'text-red-400'} 
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {reviewAction === 'approved' ? 'Approve Request' : 'Reject Request'}
                </h3>
                <p className="text-sm text-muted-foreground">{selectedRequest.request_number}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground h-20"
                  placeholder="Add any notes for this decision..."
                />
              </div>

              {reviewAction === 'rejected' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground h-20"
                    placeholder="Please provide a reason for rejection..."
                    required
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1"
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  variant={reviewAction === 'approved' ? 'success' : 'destructive'}
                  onClick={handleReview}
                  className="flex-1"
                  disabled={processing || (reviewAction === 'rejected' && !rejectionReason.trim())}
                  iconName={processing ? 'Loader' : reviewAction === 'approved' ? 'Check' : 'X'}
                >
                  {processing ? 'Processing...' : reviewAction === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialBookingManagement;
