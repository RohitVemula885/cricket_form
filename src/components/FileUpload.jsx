import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, X, Image as ImageIcon, FileText } from 'lucide-react';

export default function FileUpload({
  id = 'payment-screenshot',
  label = 'Payment Screenshot',
  required = true,
  error,
  value, // data URL or image string
  fileName,
  fileSize,
  onChange,
  onClear,
  disabled = false,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState('');

  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const processFile = (file) => {
    setLocalError('');

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setLocalError('Only JPG, JPEG, PNG, and WEBP formats are accepted.');
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setLocalError('File size must be less than 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;
      const formattedSize = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      onChange({
        file,
        previewUrl: base64Data,
        fileName: file.name,
        fileSize: formattedSize,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setLocalError('');
    onClear();
  };

  const displayError = error || localError;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label 
          htmlFor={id} 
          className="block text-sm font-semibold text-slate-700"
        >
          {label}
          {required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
        </label>
        <span className="text-xs text-slate-400 font-medium">Max 5 MB (JPG, PNG, WEBP)</span>
      </div>

      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      {value ? (
        // Preview State
        <div className="relative border border-slate-200 rounded-xl p-3 sm:p-4 bg-slate-50/70">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0 shadow-2xs">
                <img
                  src={value}
                  alt="Payment Proof Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-teal-700 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready for submission</span>
                </div>
                <p className="text-sm font-semibold text-slate-900 truncate max-w-xs sm:max-w-sm mt-0.5">
                  {fileName || 'payment-receipt.png'}
                </p>
                {fileSize && (
                  <p className="text-xs text-slate-500 mt-0.5">{fileSize}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                Change Image
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                title="Remove uploaded image"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Upload Dropzone
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-6 sm:p-7 text-center transition-all cursor-pointer ${
            disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''
          } ${
            isDragging
              ? 'border-teal-500 bg-teal-50/60 scale-[1.005]'
              : displayError
              ? 'border-rose-300 bg-rose-50/20 hover:bg-rose-50/40'
              : 'border-slate-300 bg-white hover:border-teal-500 hover:bg-teal-50/20'
          }`}
        >
          <div className="mx-auto w-12 h-12 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="text-sm font-semibold text-slate-800">
            <span className="text-teal-700 hover:underline">Click to upload screenshot</span> or drag and drop
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            UPI, Google Pay, PhonePe, Paytm, or Bank transfer receipt (JPG, PNG, WEBP)
          </p>
        </div>
      )}

      {displayError && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-rose-600 animate-in fade-in duration-150">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{displayError}</span>
        </p>
      )}
    </div>
  );
}
