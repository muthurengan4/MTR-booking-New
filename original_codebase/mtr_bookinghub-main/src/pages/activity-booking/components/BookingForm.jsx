import React, { useState } from 'react';

import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const BookingForm = ({ selectedActivity, selectedSlot, onSubmit, maxParticipants }) => {
  const [formData, setFormData] = useState({
    participants: 1,
    leadName: '',
    leadEmail: '',
    leadPhone: '',
    specialRequirements: '',
    agreeTerms: false
  });

  const [errors, setErrors] = useState({});

  const participantOptions = Array.from({ length: Math.min(maxParticipants, 10) }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1} ${i === 0 ? 'Person' : 'People'}`
  }));

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.leadName?.trim()) {
      newErrors.leadName = 'Full name is required';
    }

    if (!formData?.leadEmail?.trim()) {
      newErrors.leadEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.leadEmail)) {
      newErrors.leadEmail = 'Invalid email format';
    }

    if (!formData?.leadPhone?.trim()) {
      newErrors.leadPhone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/?.test(formData?.leadPhone?.replace(/\s/g, ''))) {
      newErrors.leadPhone = 'Invalid Indian mobile number';
    }

    if (!formData?.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const calculateTotal = () => {
    if (!selectedSlot) return 0;
    return selectedSlot?.price * formData?.participants;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6">
      <h3 className="font-heading text-xl md:text-2xl font-semibold text-foreground mb-6">
        Booking Details
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        <Select
          label="Number of Participants"
          description={`Maximum ${maxParticipants} participants allowed`}
          options={participantOptions}
          value={String(formData?.participants)}
          onChange={(value) => handleInputChange('participants', parseInt(value))}
          required
        />

        <Input
          label="Lead Participant Name"
          type="text"
          placeholder="Enter full name"
          value={formData?.leadName}
          onChange={(e) => handleInputChange('leadName', e?.target?.value)}
          error={errors?.leadName}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="your.email@example.com"
          description="Booking confirmation will be sent here"
          value={formData?.leadEmail}
          onChange={(e) => handleInputChange('leadEmail', e?.target?.value)}
          error={errors?.leadEmail}
          required
        />

        <Input
          label="Mobile Number"
          type="tel"
          placeholder="9876543210"
          description="10-digit Indian mobile number"
          value={formData?.leadPhone}
          onChange={(e) => handleInputChange('leadPhone', e?.target?.value)}
          error={errors?.leadPhone}
          required
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Special Requirements
            <span className="text-muted-foreground ml-1">(Optional)</span>
          </label>
          <textarea
            value={formData?.specialRequirements}
            onChange={(e) => handleInputChange('specialRequirements', e?.target?.value)}
            placeholder="Any dietary restrictions, accessibility needs, or special requests..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-organic resize-none"
          />
        </div>

        {selectedActivity && selectedSlot && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-foreground mb-3">Booking Summary</h4>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Activity</span>
              <span className="font-medium text-foreground">{selectedActivity?.name}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Time Slot</span>
              <span className="font-medium text-foreground">{selectedSlot?.time}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Participants</span>
              <span className="font-medium text-foreground">{formData?.participants}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price per person</span>
              <span className="font-medium text-foreground">₹{selectedSlot?.price?.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="h-px bg-border my-2" />
            
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Total Amount</span>
              <span className="font-bold text-xl text-primary">₹{calculateTotal()?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        <Checkbox
          label="I agree to the terms and conditions"
          description="By checking this box, you agree to our booking policies and cancellation terms"
          checked={formData?.agreeTerms}
          onChange={(e) => handleInputChange('agreeTerms', e?.target?.checked)}
          error={errors?.agreeTerms}
          required
        />

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            variant="default"
            fullWidth
            iconName="ShoppingCart"
            iconPosition="left"
          >
            Add to Cart
          </Button>
          <Button
            type="button"
            variant="outline"
            fullWidth
            iconName="CreditCard"
            iconPosition="left"
          >
            Book Now
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;