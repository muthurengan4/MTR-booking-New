import { supabase } from '../lib/supabase';

/**
 * Check if a room is available for the given date range
 * @param {string} roomTypeId - UUID of the room type
 * @param {string} location - Location name
 * @param {string} checkInDate - Check-in date (YYYY-MM-DD)
 * @param {string} checkOutDate - Check-out date (YYYY-MM-DD)
 * @returns {Promise<boolean>} - True if available, false if blocked
 */
export const checkRoomAvailability = async (roomTypeId, location, checkInDate, checkOutDate) => {
  try {
    const { data, error } = await supabase?.rpc('is_room_available', {
      p_room_type_id: roomTypeId,
      p_location: location,
      p_check_in_date: checkInDate,
      p_check_out_date: checkOutDate
    });

    if (error) {
      console.error('Error checking room availability:', error);
      return true; // Default to available on error
    }

    return data;
  } catch (error) {
    console.error('Error checking room availability:', error);
    return true; // Default to available on error
  }
};

/**
 * Check if an activity is available for the given date
 * @param {string} activityTypeId - UUID of the activity type
 * @param {string} location - Location name
 * @param {string} activityDate - Activity date (YYYY-MM-DD)
 * @returns {Promise<boolean>} - True if available, false if blocked
 */
export const checkActivityAvailability = async (activityTypeId, location, activityDate) => {
  try {
    const { data, error } = await supabase?.rpc('is_activity_available', {
      p_activity_type_id: activityTypeId,
      p_location: location,
      p_activity_date: activityDate
    });

    if (error) {
      console.error('Error checking activity availability:', error);
      return true; // Default to available on error
    }

    return data;
  } catch (error) {
    console.error('Error checking activity availability:', error);
    return true; // Default to available on error
  }
};

/**
 * Get all blocked dates for a room within a date range
 * @param {string} roomTypeId - UUID of the room type
 * @param {string} location - Location name
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<string[]>} - Array of blocked dates
 */
export const getRoomBlockedDates = async (roomTypeId, location, startDate, endDate) => {
  try {
    const { data, error } = await supabase?.from('room_blocked_dates')?.select('blocked_date')?.eq('room_type_id', roomTypeId)?.eq('location', location)?.gte('blocked_date', startDate)?.lte('blocked_date', endDate);

    if (error) {
      console.error('Error fetching blocked dates:', error);
      return [];
    }

    return data?.map(item => item?.blocked_date) || [];
  } catch (error) {
    console.error('Error fetching blocked dates:', error);
    return [];
  }
};

/**
 * Get all blocked dates for an activity within a date range
 * @param {string} activityTypeId - UUID of the activity type
 * @param {string} location - Location name
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<string[]>} - Array of blocked dates
 */
export const getActivityBlockedDates = async (activityTypeId, location, startDate, endDate) => {
  try {
    const { data, error } = await supabase?.from('activity_blocked_dates')?.select('blocked_date')?.eq('activity_type_id', activityTypeId)?.eq('location', location)?.gte('blocked_date', startDate)?.lte('blocked_date', endDate);

    if (error) {
      console.error('Error fetching blocked dates:', error);
      return [];
    }

    return data?.map(item => item?.blocked_date) || [];
  } catch (error) {
    console.error('Error fetching blocked dates:', error);
    return [];
  }
};