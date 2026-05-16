import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/navigation/Header';
import Icon from '../../components/AppIcon';
import api, { specialBookingRequestsAPI } from '../../lib/api';

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const SpecialBooking = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestNumber, setRequestNumber] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    designation: '',
    department: '',
    official_id_number: '',
    state: 'Tamil Nadu',
    location: 'Theppakadu',
    number_of_people: 1,
    number_of_rooms: 1,
    check_in_date: '',
    check_out_date: '',
    safari_required: false,
    mobile_number: '',
    email: '',
    document_type: 'id_proof',
    document_url: '',
    document_filename: ''
  });

  const [errors, setErrors] = useState({});

  // Set default dates
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    setFormData(prev => ({
      ...prev,
      check_in_date: tomorrow.toISOString().split('T')[0],
      check_out_date: dayAfter.toISOString().split('T')[0]
    }));
  }, []);

  // Calculate estimated amount
  const calculateAmount = () => {
    if (!formData.check_in_date || !formData.check_out_date) return { nights: 0, base: 0, gst: 0, total: 0 };
    const checkIn = new Date(formData.check_in_date);
    const checkOut = new Date(formData.check_out_date);
    const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
    const base = 500 * formData.number_of_rooms * nights;
    const gst = base * 0.05;
    return { nights, base, gst, total: base + gst };
  };

  const amount = calculateAmount();

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, document: 'Invalid file type. Please upload PDF, JPG, PNG, WebP, or HEIC' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, document: 'File too large. Maximum size is 5MB' }));
      return;
    }

    setUploadingDoc(true);
    setErrors(prev => ({ ...prev, document: null }));

    try {
      // Get Cloudinary signature
      const sigResponse = await api.get('/api/cloudinary/signature?folder=special_booking_docs&resource_type=auto');
      const sig = sigResponse.data;

      // Upload to Cloudinary
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('api_key', sig.api_key);
      uploadData.append('timestamp', sig.timestamp);
      uploadData.append('signature', sig.signature);
      uploadData.append('folder', sig.folder);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloud_name}/auto/upload`,
        { method: 'POST', body: uploadData }
      );

      const result = await uploadResponse.json();

      if (result.error) {
        throw new Error(result.error.message);
      }

      setFormData(prev => ({
        ...prev,
        document_url: result.secure_url,
        document_filename: file.name
      }));
    } catch (error) {
      console.error('Upload error:', error);
      setErrors(prev => ({ ...prev, document: 'Failed to upload document. Please try again.' }));
    } finally {
      setUploadingDoc(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.official_id_number.trim()) newErrors.official_id_number = 'Official ID number is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (formData.number_of_people < 1) newErrors.number_of_people = 'At least 1 person required';
    if (formData.number_of_rooms < 1) newErrors.number_of_rooms = 'At least 1 room required';
    if (!formData.check_in_date) newErrors.check_in_date = 'Check-in date is required';
    if (!formData.check_out_date) newErrors.check_out_date = 'Check-out date is required';
    if (formData.check_in_date >= formData.check_out_date) newErrors.check_out_date = 'Check-out must be after check-in';
    
    // Mobile validation (10 digits)
    if (!formData.mobile_number.trim()) {
      newErrors.mobile_number = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile_number)) {
      newErrors.mobile_number = 'Enter valid 10-digit mobile number';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter valid email address';
    }

    if (!formData.document_url) newErrors.document = 'Please upload ID proof or official letter';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await specialBookingRequestsAPI.create(formData);
      setRequestNumber(response.request_number);
      setSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: error.response?.data?.detail || 'Failed to submit request. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#1E3A1E]">
        <Header />
        <main className="pt-[88px] min-h-[80vh] flex items-center justify-center px-4">
          <div className="max-w-lg w-full bg-[#2A4A2A] rounded-2xl border border-[#5A9A3A]/30 p-8 text-center">
            <div className="w-20 h-20 bg-[#5A9A3A]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="CheckCircle" size={48} className="text-[#5A9A3A]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Request Submitted Successfully!</h1>
            <p className="text-[#B8C4A8] mb-6">
              Your special booking request has been submitted for review by the reserve administration.
            </p>
            <div className="bg-[#1E3A1E] rounded-xl p-4 mb-6">
              <p className="text-sm text-[#B8C4A8]">Request Number</p>
              <p className="text-2xl font-bold text-[#5A9A3A]">{requestNumber}</p>
            </div>
            <p className="text-sm text-[#B8C4A8] mb-6">
              You will receive an email notification once your request is reviewed and approved/rejected.
              Please save your request number for future reference.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-3 bg-[#5A9A3A] text-white rounded-xl font-medium hover:bg-[#4A8A2A] transition-colors"
              >
                Back to Home
              </button>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    full_name: '',
                    designation: '',
                    department: '',
                    official_id_number: '',
                    state: 'Tamil Nadu',
                    location: 'Theppakadu',
                    number_of_people: 1,
                    number_of_rooms: 1,
                    check_in_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    check_out_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
                    safari_required: false,
                    mobile_number: '',
                    email: '',
                    document_type: 'id_proof',
                    document_url: '',
                    document_filename: ''
                  });
                }}
                className="flex-1 py-3 bg-[#1E3A1E] text-white rounded-xl font-medium border border-[#5A9A3A]/30 hover:border-[#5A9A3A] transition-colors"
              >
                New Request
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E3A1E]">
      <Header />
      
      <main className="pt-[88px]">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 bg-[#5A9A3A]/20 rounded-xl flex items-center justify-center">
                <Icon name="FileText" size={32} className="text-[#5A9A3A]" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Special Room Booking Request
            </h1>
            <p className="text-[#B8C4A8]">
              For Government Officials & Special Categories
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Applicant Details */}
            <div className="bg-[#2A4A2A] rounded-2xl border border-[#5A9A3A]/30 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Icon name="User" size={20} className="text-[#5A9A3A]" />
                Applicant Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#B8C4A8] mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className={`w-full px-4 py-3 bg-[#1E3A1E] border rounded-xl text-white focus:outline-none focus:border-[#5A9A3A] ${errors.full_name ? 'border-red-500' : 'border-[#5A9A3A]/30'}`}
                    placeholder="Enter your full name"
                  />
                  {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#B8C4A8] mb-1">Designation *</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className={`w-full px-4 py-3 bg-[#1E3A1E] border rounded-xl text-white focus:outline-none focus:border-[#5A9A3A] ${errors.designation ? 'border-red-500' : 'border-[#5A9A3A]/30'}`}
                    placeholder="e.g., Forest Officer"
                  />
                  {errors.designation && <p className="text-red-400 text-xs mt-1">{errors.designation}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#B8C4A8] mb-1">Department *</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className={`w-full px-4 py-3 bg-[#1E3A1E] border rounded-xl text-white focus:outline-none focus:border-[#5A9A3A] ${errors.department ? 'border-red-500' : 'border-[#5A9A3A]/30'}`}
                    placeholder="e.g., Forest Department"
                  />
                  {errors.department && <p className="text-red-400 text-xs mt-1">{errors.department}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#B8C4A8] mb-1">Official ID Number *</label>
                  <input
                    type="text"
                    value={formData.official_id_number}
                    onChange={(e) => setFormData({ ...formData, official_id_number: e.target.value })}
                    className={`w-full px-4 py-3 bg-[#1E3A1E] border rounded-xl text-white focus:outline-none focus:border-[#5A9A3A] ${errors.official_id_number ? 'border-red-500' : 'border-[#5A9A3A]/30'}`}
                    placeholder="Enter your official ID"
                  />
                  {errors.official_id_number && <p className="text-red-400 text-xs mt-1">{errors.official_id_number}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#B8C4A8] mb-1">State *</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className={`w-full px-4 py-3 bg-[#1E3A1E] border rounded-xl text-white focus:outline-none focus:border-[#5A9A3A] ${errors.state ? 'border-red-500' : 'border-[#5A9A3A]/30'}`}
                  >
                    {indianStates.map(state => (
                      <option key={state} value={state} className="bg-[#1E3A1E]">{state}</option>
                    ))}
                  </select>
                  {errors.state && <p className="text-red-400 text-xs mt-1">{errors.state}</p>}
                </div>
              </div>
            </div>

            {/* Stay Details */}
            <div className="bg-[#2A4A2A] rounded-2xl border border-[#5A9A3A]/30 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Icon name="Home" size={20} className="text-[#5A9A3A]" />
                Stay Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#B8C4A8] mb-1">Location *</label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1E3A1E] border border-[#5A9A3A]/30 rounded-xl text-white focus:outline-none focus:border-[#5A9A3A]"
                  >
                    <option value="Theppakadu" className="bg-[#1E3A1E]">Theppakadu</option>
                    <option value="Masinagudi" className="bg-[#1E3A1E]">Masinagudi</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#B8C4A8] mb-1">People *</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.number_of_people}
                      onChange={(e) => setFormData({ ...formData, number_of_people: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 bg-[#1E3A1E] border border-[#5A9A3A]/30 rounded-xl text-white focus:outline-none focus:border-[#5A9A3A]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#B8C4A8] mb-1">Rooms *</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.number_of_rooms}
                      onChange={(e) => setFormData({ ...formData, number_of_rooms: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 bg-[#1E3A1E] border border-[#5A9A3A]/30 rounded-xl text-white focus:outline-none focus:border-[#5A9A3A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#B8C4A8] mb-1">Check-in Date *</label>
                  <input
                    type="date"
                    value={formData.check_in_date}
                    onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 bg-[#1E3A1E] border rounded-xl text-white focus:outline-none focus:border-[#5A9A3A] ${errors.check_in_date ? 'border-red-500' : 'border-[#5A9A3A]/30'}`}
                  />
                  {errors.check_in_date && <p className="text-red-400 text-xs mt-1">{errors.check_in_date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#B8C4A8] mb-1">Check-out Date *</label>
                  <input
                    type="date"
                    value={formData.check_out_date}
                    onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
                    min={formData.check_in_date || new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 bg-[#1E3A1E] border rounded-xl text-white focus:outline-none focus:border-[#5A9A3A] ${errors.check_out_date ? 'border-red-500' : 'border-[#5A9A3A]/30'}`}
                  />
                  {errors.check_out_date && <p className="text-red-400 text-xs mt-1">{errors.check_out_date}</p>}
                </div>
              </div>

              {/* Complimentary Note */}
              <div className="mt-4 p-3 bg-[#5A9A3A]/10 rounded-lg border border-[#5A9A3A]/30">
                <p className="text-sm text-[#5A9A3A] flex items-center gap-2">
                  <Icon name="Gift" size={16} />
                  Complimentary visit to Theppakadu Elephant Camp included with your stay
                </p>
              </div>
            </div>

            {/* Safari Requirement */}
            <div className="bg-[#2A4A2A] rounded-2xl border border-[#5A9A3A]/30 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Icon name="Compass" size={20} className="text-[#5A9A3A]" />
                Safari Requirement
              </h2>
              
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, safari_required: true })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    formData.safari_required
                      ? 'bg-[#5A9A3A] text-white'
                      : 'bg-[#1E3A1E] text-[#B8C4A8] border border-[#5A9A3A]/30 hover:border-[#5A9A3A]'
                  }`}
                >
                  Yes, I need Safari
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, safari_required: false })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    !formData.safari_required
                      ? 'bg-[#5A9A3A] text-white'
                      : 'bg-[#1E3A1E] text-[#B8C4A8] border border-[#5A9A3A]/30 hover:border-[#5A9A3A]'
                  }`}
                >
                  No Safari Needed
                </button>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-[#2A4A2A] rounded-2xl border border-[#5A9A3A]/30 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Icon name="Phone" size={20} className="text-[#5A9A3A]" />
                Contact Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#B8C4A8] mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    value={formData.mobile_number}
                    onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className={`w-full px-4 py-3 bg-[#1E3A1E] border rounded-xl text-white focus:outline-none focus:border-[#5A9A3A] ${errors.mobile_number ? 'border-red-500' : 'border-[#5A9A3A]/30'}`}
                    placeholder="10-digit mobile number"
                  />
                  {errors.mobile_number && <p className="text-red-400 text-xs mt-1">{errors.mobile_number}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#B8C4A8] mb-1">Email ID *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-3 bg-[#1E3A1E] border rounded-xl text-white focus:outline-none focus:border-[#5A9A3A] ${errors.email ? 'border-red-500' : 'border-[#5A9A3A]/30'}`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Supporting Document */}
            <div className="bg-[#2A4A2A] rounded-2xl border border-[#5A9A3A]/30 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Icon name="FileUp" size={20} className="text-[#5A9A3A]" />
                Supporting Document
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#B8C4A8] mb-1">Document Type *</label>
                  <select
                    value={formData.document_type}
                    onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1E3A1E] border border-[#5A9A3A]/30 rounded-xl text-white focus:outline-none focus:border-[#5A9A3A]"
                  >
                    <option value="id_proof" className="bg-[#1E3A1E]">ID Proof (Aadhaar, PAN, Passport)</option>
                    <option value="official_letter" className="bg-[#1E3A1E]">Official Letter / Authorization</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#B8C4A8] mb-1">Upload Document *</label>
                  {formData.document_url ? (
                    <div className="flex items-center gap-3 p-4 bg-[#5A9A3A]/10 border border-[#5A9A3A]/30 rounded-xl">
                      <Icon name="FileCheck" size={24} className="text-[#5A9A3A]" />
                      <div className="flex-1">
                        <p className="text-white font-medium">{formData.document_filename}</p>
                        <p className="text-xs text-[#B8C4A8]">Uploaded successfully</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, document_url: '', document_filename: '' })}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"
                      >
                        <Icon name="X" size={18} />
                      </button>
                    </div>
                  ) : (
                    <label className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                      errors.document ? 'border-red-500 bg-red-500/5' : 'border-[#5A9A3A]/30 hover:border-[#5A9A3A] bg-[#1E3A1E]'
                    }`}>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
                        onChange={handleFileUpload}
                        disabled={uploadingDoc}
                        className="hidden"
                      />
                      {uploadingDoc ? (
                        <Icon name="Loader" size={32} className="text-[#5A9A3A] animate-spin mb-2" />
                      ) : (
                        <Icon name="Upload" size={32} className="text-[#5A9A3A] mb-2" />
                      )}
                      <p className="text-white font-medium">{uploadingDoc ? 'Uploading...' : 'Click to upload'}</p>
                      <p className="text-xs text-[#B8C4A8] mt-1">PDF, JPG, PNG, WebP, HEIC (max 5MB)</p>
                    </label>
                  )}
                  {errors.document && <p className="text-red-400 text-xs mt-1">{errors.document}</p>}
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-gradient-to-br from-[#5A9A3A]/20 to-[#2A4A2A] rounded-2xl border border-[#5A9A3A]/30 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Price Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[#B8C4A8]">
                  <span>Room Rate</span>
                  <span>₹500/room/night</span>
                </div>
                <div className="flex justify-between text-[#B8C4A8]">
                  <span>{formData.number_of_rooms} room(s) × {amount.nights} night(s)</span>
                  <span>₹{amount.base.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#B8C4A8]">
                  <span>GST (5%)</span>
                  <span>₹{amount.gst.toLocaleString()}</span>
                </div>
                <div className="border-t border-[#5A9A3A]/30 pt-2 mt-2">
                  <div className="flex justify-between text-white font-semibold text-lg">
                    <span>Estimated Total</span>
                    <span>₹{amount.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#B8C4A8] mt-3">
                * Final amount subject to availability and approval
              </p>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 flex items-center gap-2">
                  <Icon name="AlertCircle" size={18} />
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#FF9E6D] to-[#FF6B35] text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#FF9E6D]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Icon name="Loader" size={24} className="animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <Icon name="Send" size={24} />
                  Send Room Request
                </>
              )}
            </button>

            <p className="text-xs text-center text-[#B8C4A8]">
              By submitting, you agree to the terms and conditions. Room availability and approval is subject to reserve administration review.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SpecialBooking;
