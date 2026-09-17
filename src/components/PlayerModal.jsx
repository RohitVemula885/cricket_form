import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Clock, Calendar, Mail, Phone, Shirt } from 'lucide-react';
import { formatTshirtSizeWithNumber } from '../utils/tshirtConfig';

export default function PlayerModal({
  player,
  isOpen,
  onClose,
  onUpdateStatus,
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !player) return null;

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(player.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const formattedDate = player.createdAt
    ? new Date(player.createdAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'N/A';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Player Details</h3>
            <p className="text-xs text-slate-500 font-mono">ID: {player.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <div>
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Full Name</span>
              <span className="text-base font-bold text-slate-900">{player.fullName}</span>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Player Status</span>
              <div className="inline-flex items-center gap-1.5 mt-0.5">
                {player.paymentStatus === 'verified' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Player</span>
                  </span>
                )}
                {player.paymentStatus === 'rejected' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Rejected Player</span>
                  </span>
                )}
                {player.paymentStatus === 'pending' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pending Player</span>
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Mobile Number</span>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{player.mobile}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Email Address</span>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 truncate" title={player.email}>
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{player.email}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-400 block mb-0.5">T-Shirt Size</span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                <Shirt className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatTshirtSizeWithNumber(player.tshirtSize)}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Name on T-Shirt</span>
              <div className="text-sm font-bold text-teal-700 tracking-wide">
                {player.tshirtName ? player.tshirtName.toUpperCase() : 'Not Specified'}
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Number on T-Shirt</span>
              <div className="text-sm font-bold text-teal-700 font-mono">
                {player.tshirtNumber ? `#${player.tshirtNumber}` : 'Not Specified'}
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Registration Date</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <div className="text-xs text-slate-500 font-medium order-2 sm:order-1 text-center sm:text-left">
            Review player details and update roster verification status.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end order-1 sm:order-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('rejected')}
              disabled={isUpdating || player.paymentStatus === 'rejected'}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Player</span>
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('verified')}
              disabled={isUpdating || player.paymentStatus === 'verified'}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify Player</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
