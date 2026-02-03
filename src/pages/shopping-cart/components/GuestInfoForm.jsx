import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const GuestInfoForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    createAccount: false
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData?.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/?.test(formData?.phone)) {
      newErrors.phone = 'Invalid phone number (10 digits starting with 6-9)';
    }

    if (formData?.alternatePhone && !/^[6-9]\d{9}$/?.test(formData?.alternatePhone)) {
      newErrors.alternatePhone = 'Invalid alternate phone number';
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

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="User" size={20} color="var(--color-primary)" strokeWidth={2} />
        </div>
        <div>
          <h2 className="font-heading text-xl md:text-2xl font-semibold text-foreground">Guest Information</h2>
          <p className="text-sm text-muted-foreground">Provide your contact details for booking confirmation</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          name="fullName"
          placeholder="Enter your full name"
          value={formData?.fullName}
          onChange={handleChange}
          error={errors?.fullName}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="your.email@example.com"
            value={formData?.email}
            onChange={handleChange}
            error={errors?.email}
            description="Booking confirmation will be sent here"
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            placeholder="9876543210"
            value={formData?.phone}
            onChange={handleChange}
            error={errors?.phone}
            description="10-digit mobile number"
            required
          />
        </div>

        <Input
          label="Alternate Phone Number (Optional)"
          type="tel"
          name="alternatePhone"
          placeholder="9876543210"
          value={formData?.alternatePhone}
          onChange={handleChange}
          error={errors?.alternatePhone}
          description="For emergency contact"
        />

        <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
          <Checkbox
            label="Create an account for faster future bookings"
            description="Auto-generated credentials will be sent to your email and SMS"
            checked={formData?.createAccount}
            onChange={handleChange}
            name="createAccount"
          />
        </div>

        <div className="flex items-start gap-2 p-4 bg-muted/50 rounded-lg">
          <Icon name="Info" size={16} color="var(--color-primary)" strokeWidth={2} className="flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Your booking confirmation, payment receipt, and visit guidelines will be sent via email and SMS immediately after payment.
          </p>
        </div>
      </form>
    </div>
  );
};

export default GuestInfoForm;