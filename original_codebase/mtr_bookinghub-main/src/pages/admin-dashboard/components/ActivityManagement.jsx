import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ActivityManagement = () => {
  const [activities, setActivities] = useState([]);
  const [editingActivity, setEditingActivity] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showBlockingCalendar, setShowBlockingCalendar] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);

  const statusOptions = [
    { value: 'all', label: 'All Activities' },
    { value: 'active', label: 'Active Only' },
    { value: 'inactive', label: 'Inactive Only' }
  ];

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    if (showBlockingCalendar) {
      fetchBlockedDates(showBlockingCalendar?.id, showBlockingCalendar?.location);
    }
  }, [showBlockingCalendar]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase?.from('activity_types')?.select('*')?.order('name');

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockedDates = async (activityTypeId, location) => {
    try {
      const { data, error } = await supabase?.from('activity_blocked_dates')?.select('*')?.eq('activity_type_id', activityTypeId)?.eq('location', location)?.gte('blocked_date', new Date()?.toISOString()?.split('T')?.[0]);

      if (error) throw error;
      setBlockedDates(data || []);
    } catch (error) {
      console.error('Error fetching blocked dates:', error);
    }
  };

  const filteredActivities = activities?.filter(activity => {
    if (filterStatus === 'active') return activity?.is_active;
    if (filterStatus === 'inactive') return !activity?.is_active;
    return true;
  });

  const handleEditActivity = (activity) => {
    setEditingActivity({ ...activity });
  };

  const handleSaveActivity = async () => {
    try {
      const { error } = await supabase?.from('activity_types')?.update({
          base_price: editingActivity?.base_price,
          max_capacity: editingActivity?.max_capacity,
          location: editingActivity?.location,
          is_active: editingActivity?.is_active
        })?.eq('id', editingActivity?.id);

      if (error) throw error;
      await fetchActivities();
      setEditingActivity(null);
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingActivity(null);
  };

  const handleToggleActive = async (activityId, currentStatus) => {
    try {
      const { error } = await supabase?.from('activity_types')?.update({ is_active: !currentStatus })?.eq('id', activityId);

      if (error) throw error;
      await fetchActivities();
    } catch (error) {
      console.error('Error toggling activity status:', error);
    }
  };

  const handleToggleBlockDate = async (date, activityTypeId, location) => {
    const dateStr = date?.toISOString()?.split('T')?.[0];
    const isBlocked = blockedDates?.some(bd => bd?.blocked_date === dateStr);

    try {
      if (isBlocked) {
        const { error } = await supabase?.from('activity_blocked_dates')?.delete()?.eq('activity_type_id', activityTypeId)?.eq('location', location)?.eq('blocked_date', dateStr);

        if (error) throw error;
      } else {
        const { error } = await supabase?.from('activity_blocked_dates')?.insert({
            activity_type_id: activityTypeId,
            location: location,
            blocked_date: dateStr,
            reason: 'Manually blocked by admin'
          });

        if (error) throw error;
      }

      await fetchBlockedDates(activityTypeId, location);
    } catch (error) {
      console.error('Error toggling block date:', error);
    }
  };

  const renderBlockingCalendar = () => {
    if (!showBlockingCalendar) return null;

    const today = new Date();
    const next90Days = [];
    
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date?.setDate(today?.getDate() + i);
      next90Days?.push(date);
    }

    const groupedByMonth = next90Days?.reduce((acc, date) => {
      const monthKey = `${date?.getFullYear()}-${date?.getMonth()}`;
      if (!acc?.[monthKey]) acc[monthKey] = [];
      acc?.[monthKey]?.push(date);
      return acc;
    }, {});

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading text-xl font-semibold text-foreground">
                Block Dates - {showBlockingCalendar?.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Location: {showBlockingCalendar?.location} | Click dates to block/unblock
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              iconName="X"
              onClick={() => setShowBlockingCalendar(null)}
            >
              Close
            </Button>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedByMonth)?.map(([monthKey, dates]) => {
              const firstDate = dates?.[0];
              const monthName = firstDate?.toLocaleString('default', { month: 'long', year: 'numeric' });

              return (
                <div key={monthKey}>
                  <h4 className="font-semibold text-foreground mb-3">{monthName}</h4>
                  <div className="grid grid-cols-7 gap-2">
                    {dates?.map((date) => {
                      const dateStr = date?.toISOString()?.split('T')?.[0];
                      const isBlocked = blockedDates?.some(bd => bd?.blocked_date === dateStr);
                      const dayOfWeek = date?.getDay();
                      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                      return (
                        <button
                          key={dateStr}
                          onClick={() => handleToggleBlockDate(date, showBlockingCalendar?.id, showBlockingCalendar?.location)}
                          className={`p-3 rounded-lg border-2 transition-organic active-press ${
                            isBlocked
                              ? 'bg-destructive text-destructive-foreground border-destructive'
                              : isWeekend
                              ? 'bg-muted border-border hover:border-primary' :'bg-card border-border hover:border-primary'
                          }`}
                        >
                          <div className="text-xs font-medium">
                            {date?.toLocaleDateString('default', { weekday: 'short' })}
                          </div>
                          <div className="text-lg font-semibold">{date?.getDate()}</div>
                          {isBlocked && (
                            <Icon name="Lock" size={14} className="mx-auto mt-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-destructive rounded" />
              <span className="text-muted-foreground">Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-card border-2 border-border rounded" />
              <span className="text-muted-foreground">Available</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" size={48} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">Activity Management</h2>
          <p className="text-muted-foreground">Manage activities, slots, and pricing</p>
        </div>
        <Select
          options={statusOptions}
          value={filterStatus}
          onChange={setFilterStatus}
          className="w-48"
        />
      </div>

      <div className="grid gap-4">
        {filteredActivities?.map((activity) => (
          <div
            key={activity?.id}
            className="bg-muted rounded-lg border border-border p-4 transition-organic hover:shadow-md"
          >
            {editingActivity?.id === activity?.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input
                    label="Price (₹)"
                    type="number"
                    value={editingActivity?.base_price}
                    onChange={(e) => setEditingActivity({ ...editingActivity, base_price: parseFloat(e?.target?.value) })}
                  />
                  <Input
                    label="Max Capacity"
                    type="number"
                    min="1"
                    value={editingActivity?.max_capacity}
                    onChange={(e) => setEditingActivity({ ...editingActivity, max_capacity: parseInt(e?.target?.value) })}
                  />
                  <Input
                    label="Location"
                    type="text"
                    value={editingActivity?.location || ''}
                    onChange={(e) => setEditingActivity({ ...editingActivity, location: e?.target?.value })}
                  />
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingActivity?.is_active}
                        onChange={(e) => setEditingActivity({ ...editingActivity, is_active: e?.target?.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Active</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveActivity} iconName="Check">Save Changes</Button>
                  <Button variant="outline" onClick={handleCancelEdit} iconName="X">Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-foreground text-lg">{activity?.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activity?.is_active
                          ? 'bg-success/10 text-success' :'bg-muted-foreground/10 text-muted-foreground'
                      }`}>
                        {activity?.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Icon name="Clock" size={16} />
                        <span>{activity?.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="Users" size={16} />
                        <span>Max {activity?.max_capacity} people</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="IndianRupee" size={16} />
                        <span>₹{activity?.base_price?.toLocaleString()}/person</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="MapPin" size={16} />
                        <span>{activity?.location || 'No location set'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Calendar"
                      onClick={() => setShowBlockingCalendar(activity)}
                      disabled={!activity?.location}
                    >
                      Block Dates
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Edit"
                      onClick={() => handleEditActivity(activity)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant={activity?.is_active ? 'destructive' : 'success'}
                      size="sm"
                      iconName={activity?.is_active ? 'XCircle' : 'CheckCircle'}
                      onClick={() => handleToggleActive(activity?.id, activity?.is_active)}
                    >
                      {activity?.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredActivities?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Activity" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No activities found</p>
        </div>
      )}

      {renderBlockingCalendar()}
    </div>
  );
};

export default ActivityManagement;