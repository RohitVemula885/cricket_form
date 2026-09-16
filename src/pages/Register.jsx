import React, { useState } from 'react';
import { User, Phone, Mail, Shirt, CheckCircle, Loader2, QrCode, Shield, Info, ArrowRight, RefreshCw, Trophy, Calendar, MapPin } from 'lucide-react';
import InputField from '../components/InputField.jsx';
import FileUpload from '../components/FileUpload.jsx';
import { addRegistration } from '../utils/storage.js';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    tshirtSize: '',
    paymentScreenshot: '',
    fileName: '',
    fileSize: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedPlayer, setSubmittedPlayer] = useState(null);

  const tshirtOptions = [
    { value: '', label: 'Select T-Shirt Size', disabled: true },
    { value: 'S', label: 'S (Small - 36-38")' },
    { value: 'M', label: 'M (Medium - 38-40")' },
    { value: 'L', label: 'L (Large - 40-42")' },
    { value: 'XL', label: 'XL (Extra Large - 42-44")' },
    { value: 'XXL', label: 'XXL (Double Extra Large - 44-46")' },
  ];

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

      case 'paymentScreenshot':
        if (!value) {
          error = 'Please upload your payment screenshot.';
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
    newErrors.paymentScreenshot = validateField('paymentScreenshot', formData.paymentScreenshot);

    // Filter out empty errors
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, v]) => Boolean(v))
    );

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-clean mobile input for ease of use
    let formattedValue = value;
    if (name === 'mobile') {
      formattedValue = value.replace(/\D/g, '').slice(0, 10);
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

  const handleFileChange = ({ previewUrl, fileName, fileSize }) => {
    setFormData((prev) => ({
      ...prev,
      paymentScreenshot: previewUrl,
      fileName,
      fileSize,
    }));

    if (errors.paymentScreenshot) {
      setErrors((prev) => ({
        ...prev,
        paymentScreenshot: '',
      }));
    }
  };

  const handleFileClear = () => {
    setFormData((prev) => ({
      ...prev,
      paymentScreenshot: '',
      fileName: '',
      fileSize: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);

    try {
      /**
       * Call storage utility.
       * (In future with Supabase, addRegistration will call:
       *  - supabase.storage for file upload
       *  - supabase.from('registrations').insert(...) for record persistence)
       */
      const newEntry = await addRegistration({
        fullName: formData.fullName,
        mobile: formData.mobile,
        email: formData.email,
        tshirtSize: formData.tshirtSize,
        paymentScreenshot: formData.paymentScreenshot,
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
      paymentScreenshot: '',
      fileName: '',
      fileSize: '',
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
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 border-2 border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-2xs">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <span className="text-4xl mb-2 block" role="img" aria-label="Success checkmark">
            ✅
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Registration Submitted Successfully!
          </h2>

          <p className="mt-3 text-base text-slate-600 max-w-md mx-auto">
            Your registration details and payment screenshot have been received.
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Info className="w-3.5 h-3.5" />
            <span>Your payment will be verified by the organizer.</span>
          </div>

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
                  <span className="text-slate-400 block font-medium">T-Shirt Allocated</span>
                  <span className="text-slate-900 font-bold text-sm">Size {submittedPlayer.tshirtSize}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Mobile Contact</span>
                  <span className="text-slate-800 font-medium">{submittedPlayer.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Status</span>
                  <span className="text-amber-700 font-bold">Pending Verification</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-4">
            <button
              type="button"
              onClick={handleResetForm}
              id="btn-register-another"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
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
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  GRAND TOURNAMENT 2026
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

              {/* Match Fee & Payment Box */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 sm:min-w-[220px]">
                <span className="text-xs text-teal-200 font-medium block">Registration Fee</span>
                <div className="text-2xl font-extrabold text-white mt-0.5">₹600 <span className="text-xs font-normal text-teal-200">/ player</span></div>
                <div className="text-xs text-teal-100/80 mt-1 font-mono">UPI: <span className="font-semibold text-white">spavan9874-3@oksbi</span></div>
              </div>
            </div>
          </div>

          {/* Registration Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 lg:p-10">
            <div className="border-b border-slate-100 pb-5 mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Register for the Match
              </h2>
              <p className="mt-1 text-sm text-slate-500 font-medium">
                Fill in your details and submit your payment proof to confirm your registration.
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
                helperText="Minimum 2 characters"
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
                  helperText="10-digit Indian mobile"
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
                  disabled={isSubmitting}
                />
              </div>

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
                helperText="Official match jersey size"
                disabled={isSubmitting}
              />

              {/* Payment Proof Instructions */}
              <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-700">
                <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-teal-900 block">Payment Instructions:</span>
                  <span>
                    Pay <strong className="font-semibold text-slate-900">₹600</strong> using Google Pay, PhonePe, Paytm, or UPI to <strong className="font-semibold text-slate-900">spavan9874-3@oksbi</strong>. Take a clear screenshot displaying the UPI Reference / UTR Number and upload below.
                  </span>
                </div>
              </div>

              {/* Field 5: Payment Screenshot */}
              <FileUpload
                id="paymentScreenshot"
                label="Payment Screenshot"
                required
                value={formData.paymentScreenshot}
                fileName={formData.fileName}
                fileSize={formData.fileSize}
                onChange={handleFileChange}
                onClear={handleFileClear}
                error={errors.paymentScreenshot}
                disabled={isSubmitting}
              />

              {errors.form && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700">
                  {errors.form}
                </div>
              )}

              {/* Field 6: Submit Button */}
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
                <span>Your information is encrypted and securely sent directly to match organizers.</span>
              </div>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
