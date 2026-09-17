import React, { useState } from 'react';
import { User, Phone, Mail, Shirt, Hash, CheckCircle, Loader2, Shield, ArrowRight, RefreshCw, Trophy, Calendar, MapPin, UserPlus, Check } from 'lucide-react';
import InputField from '../components/InputField.jsx';
import { addRegistration } from '../utils/storage.js';
import { TSHIRT_OPTIONS, formatTshirtSizeWithNumber } from '../utils/tshirtConfig.js';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    tshirtSize: '',
    tshirtName: '',
    tshirtNumber: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedPlayer, setSubmittedPlayer] = useState(null);

  const tshirtOptions = TSHIRT_OPTIONS;

  // Client-side validations
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'fullName':
        if (!value || !value.trim()) {
          error = 'Please enter your full name.';
        } else if (value.trim().length < 2) {
          error = 'Full name must be at least 2 characters.';
        }
        break;

      case 'mobile':
        if (!value || !value.trim()) {
          error = 'Please enter a valid 10-digit mobile number.';
        } else {
          // Indian 10-digit mobile check: starts with 6, 7, 8, or 9
          const cleanMobile = value.trim().replace(/\D/g, '');
          const indianPhoneRegex = /^[6-9]\d{9}$/;
          if (!indianPhoneRegex.test(cleanMobile)) {
            error = 'Please enter a valid 10-digit mobile number.';
          }
        }
        break;

      case 'email':
        if (!value || !value.trim()) {
          error = 'Please enter a valid email address.';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) {
            error = 'Please enter a valid email address.';
          }
        }
        break;

      case 'tshirtSize':
        if (!value) {
          error = 'Please select your T-shirt size.';
        }
        break;

      case 'tshirtName':
        if (!value || !value.trim()) {
          error = 'Please enter the name to print on your T-shirt.';
        } else if (value.trim().length > 12) {
          error = 'Name on T-shirt cannot exceed 12 characters.';
        }
        break;

      case 'tshirtNumber':
        if (value === undefined || value === null || value.toString().trim() === '') {
          error = 'Please enter your T-shirt jersey number.';
        } else {
          const cleanNum = value.toString().trim();
          if (!/^\d+$/.test(cleanNum)) {
            error = 'Jersey number must be digits only.';
          } else if (cleanNum.length > 3) {
            error = 'Jersey number cannot be more than 3 digits (max 999).';
          }
        }
        break;

      default:
        break;
    }
    return error;
  };

  const validateAll = () => {
    const newErrors = {};
    newErrors.fullName = validateField('fullName', formData.fullName);
    newErrors.mobile = validateField('mobile', formData.mobile);
    newErrors.email = validateField('email', formData.email);
    newErrors.tshirtSize = validateField('tshirtSize', formData.tshirtSize);
    newErrors.tshirtName = validateField('tshirtName', formData.tshirtName);
    newErrors.tshirtNumber = validateField('tshirtNumber', formData.tshirtNumber);

    // Filter out empty errors
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, v]) => Boolean(v))
    );

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    if (name === 'mobile') {
      formattedValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'tshirtNumber') {
      // Enforce digits only and strictly max 3 digits
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    } else if (name === 'tshirtName') {
      // Jersey name uppercase max 12 characters
      formattedValue = value.slice(0, 12).toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    // Clear error on change if fixed
    if (errors[name]) {
      const errorMsg = validateField(name, formattedValue);
      setErrors((prev) => ({
        ...prev,
        [name]: errorMsg,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newEntry = await addRegistration({
        fullName: formData.fullName,
        mobile: formData.mobile,
        email: formData.email,
        tshirtSize: formData.tshirtSize,
        tshirtName: formData.tshirtName,
        tshirtNumber: formData.tshirtNumber,
        paymentScreenshot: '',
      });

      setSubmittedPlayer(newEntry);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Registration submission failed:', err);
      setErrors({ form: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      fullName: '',
      mobile: '',
      email: '',
      tshirtSize: '',
      tshirtName: '',
      tshirtNumber: '',
    });
    setErrors({});
    setIsSuccess(false);
    setSubmittedPlayer(null);
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* SUCCESS SCREEN */}
      {isSuccess ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 shadow-xs text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 border-2 border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 mb-2">
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Registration Completed!
          </h2>

          <p className="mt-2 text-base text-slate-600 max-w-md mx-auto">
            Your tournament entry and jersey details have been recorded successfully.
          </p>

          {/* Submission Summary Ticket */}
          {submittedPlayer && (
            <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-5 text-left max-w-md mx-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registration Reference</span>
                <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {submittedPlayer.id}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Player</span>
                  <span className="text-slate-900 font-bold text-sm">{submittedPlayer.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">T-Shirt Size</span>
                  <span className="text-slate-900 font-bold text-sm">
                    {formatTshirtSizeWithNumber(submittedPlayer.tshirtSize)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Name on T-Shirt</span>
                  <span className="text-teal-700 font-bold text-sm tracking-wide">{submittedPlayer.tshirtName || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Number on T-Shirt</span>
                  <span className="text-teal-700 font-bold text-sm">#{submittedPlayer.tshirtNumber || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Mobile Contact</span>
                  <span className="text-slate-800 font-medium">{submittedPlayer.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Registration Status</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Done (Registered)
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleResetForm}
              id="btn-done"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Done</span>
            </button>

            <button
              type="button"
              onClick={handleResetForm}
              id="btn-register-another"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Another Player</span>
            </button>
          </div>
        </div>
      ) : (
        /* REGISTRATION CARD & TOURNAMENT INFO */
        <div className="space-y-8">
          
          {/* Tournament Overview Banner */}
          <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-200 border border-teal-400/30">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Official Registration 2026</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  GRAND CRICKET TOURNAMENT 2026
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-teal-100/90 font-medium pt-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-teal-300" />
                    <span>Sunday, 25 October 2026</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-teal-300" />
                    <span>J.K. Knowledge Centre, Wadala</span>
                  </span>
                </div>
              </div>

              {/* Tournament Match Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 sm:min-w-[200px]">
                <span className="text-xs text-teal-200 font-medium block">Match Roster</span>
                <div className="text-xl font-extrabold text-white mt-0.5">Player Entry</div>
                <div className="text-xs text-teal-100/80 mt-1">Official Jersey Included</div>
              </div>
            </div>
          </div>

          {/* Registration Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 lg:p-10">
            <div className="border-b border-slate-100 pb-5 mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Player Registration
              </h2>
              <p className="mt-1 text-sm text-slate-500 font-medium">
                Enter your player details and personalize your official tournament T-Shirt.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              
              {/* Field 1: Full Name */}
              <InputField
                id="fullName"
                name="fullName"
                label="Full Name"
                placeholder="e.g. Rohit Vemula"
                value={formData.fullName}
                onChange={handleInputChange}
                error={errors.fullName}
                required
                icon={User}
                helperText="Player's official tournament name"
                disabled={isSubmitting}
              />

              {/* Two columns on desktop: Mobile & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                {/* Field 2: Mobile Number */}
                <InputField
                  id="mobile"
                  name="mobile"
                  type="tel"
                  label="Mobile Number"
                  placeholder="e.g. 9876543210"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  error={errors.mobile}
                  required
                  icon={Phone}
                  helperText="10-digit Indian mobile number"
                  maxLength={10}
                  disabled={isSubmitting}
                />

                {/* Field 3: Email Address */}
                <InputField
                  id="email"
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="e.g. player@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  required
                  icon={Mail}
                  helperText="For match schedule & updates"
                  disabled={isSubmitting}
                />
              </div>

              {/* T-Shirt Customization Section */}
              <div className="pt-3 border-t border-slate-100">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Shirt className="w-4 h-4 text-teal-600" />
                    <span>Tournament T-Shirt Customization</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose your jersey size, name printing, and jersey number (up to 3 digits).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
                  {/* Field 4: T-Shirt Size */}
                  <InputField
                    id="tshirtSize"
                    name="tshirtSize"
                    type="select"
                    label="T-Shirt Size"
                    value={formData.tshirtSize}
                    onChange={handleInputChange}
                    error={errors.tshirtSize}
                    required
                    options={tshirtOptions}
                    icon={Shirt}
                    helperText="Official match jersey fit"
                    disabled={isSubmitting}
                  />

                  {/* Field 5: Name on T-Shirt */}
                  <InputField
                    id="tshirtName"
                    name="tshirtName"
                    label="Name on T-Shirt"
                    placeholder="e.g. ROHIT"
                    value={formData.tshirtName}
                    onChange={handleInputChange}
                    error={errors.tshirtName}
                    required
                    icon={User}
                    helperText="Back of jersey (Max 12 chars)"
                    maxLength={12}
                    disabled={isSubmitting}
                  />

                  {/* Field 6: Number on T-Shirt */}
                  <InputField
                    id="tshirtNumber"
                    name="tshirtNumber"
                    type="text"
                    inputMode="numeric"
                    label="Number on T-Shirt"
                    placeholder="e.g. 7 or 18"
                    value={formData.tshirtNumber}
                    onChange={handleInputChange}
                    error={errors.tshirtNumber}
                    required
                    icon={Hash}
                    helperText="Max 3 digits (0 - 999)"
                    maxLength={3}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {errors.form && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700">
                  {errors.form}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="btn-submit-registration"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm sm:text-base font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl shadow-xs transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting Registration...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium pt-2">
                <Shield className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Your information is securely saved directly to the tournament roster.</span>
              </div>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
