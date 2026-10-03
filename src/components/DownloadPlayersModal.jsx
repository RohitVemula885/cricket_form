import React, { useState } from 'react';
import { 
  X, Download, FileText, FileSpreadsheet, CheckCircle2, 
  Users, ShieldCheck, Filter, ArrowRight, Sparkles, Loader2, Info
} from 'lucide-react';
import { generateRegistrationsPDF, downloadAllPlayersCSV } from '../utils/pdfExport';
import { getStoredTeams } from '../utils/teamsConfig';

export default function DownloadPlayersModal({
  isOpen,
  onClose,
  players = [],
  teams = getStoredTeams(),
  adminName = 'Tournament Director',
  onPdfGenerated,
}) {
  const [selectedScope, setSelectedScope] = useState('all'); // 'all' | 'verified' | 'pending'
  const [isExporting, setIsExporting] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState(null);

  if (!isOpen) return null;

  const verifiedPlayers = players.filter((p) => p.paymentStatus === 'verified');
  const pendingPlayers = players.filter((p) => p.paymentStatus === 'pending' || !p.paymentStatus);
  const rejectedPlayers = players.filter((p) => p.paymentStatus === 'rejected');

  const getTargetPlayers = () => {
    switch (selectedScope) {
      case 'verified':
        return verifiedPlayers;
      case 'pending':
        return pendingPlayers;
      case 'all':
      default:
        return players;
    }
  };

  const targetList = getTargetPlayers();

  const handleDownloadPDF = async () => {
    if (targetList.length === 0) {
      alert('No players found in selected scope.');
      return;
    }

    try {
      setIsExporting(true);
      setDownloadFormat('pdf');
      await new Promise((r) => setTimeout(r, 60));

      const result = await generateRegistrationsPDF(targetList, {
        adminName,
      });

      if (onPdfGenerated && result) {
        onPdfGenerated(result);
      }
      onClose();
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
      setDownloadFormat(null);
    }
  };

  const handleDownloadCSV = () => {
    if (targetList.length === 0) {
      alert('No players found in selected scope.');
      return;
    }
    downloadAllPlayersCSV(targetList, teams);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-teal-900 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 id="download-modal-title" className="text-lg font-extrabold tracking-tight">
                Download Players Directory
              </h3>
              <p className="text-xs text-teal-200/80 font-medium">
                Complete roster with full details of every player
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Details Included Pill */}
          <div className="bg-teal-50/70 border border-teal-200/70 rounded-xl p-3.5 text-xs text-teal-900">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>All Player Details Included in Export:</span>
            </div>
            <p className="text-teal-800 leading-relaxed">
              Serial No. • Full Name • 10-Digit Mobile • Email Address • Assigned Team &amp; Code • 
              Jersey Printed Name • Jersey Number • T-Shirt Size (with chest measurement) • 
              Verification Status • Registration Timestamp • Notes &amp; Payment Proof.
            </p>
          </div>

          {/* Scope Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Player Scope:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedScope('all')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedScope === 'all'
                    ? 'bg-teal-50/80 border-teal-600 text-teal-900 ring-2 ring-teal-500/20 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <div className="text-base font-extrabold text-slate-900">{players.length}</div>
                <div className="text-2xs uppercase tracking-wider mt-0.5">All Players</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedScope('verified')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedScope === 'verified'
                    ? 'bg-emerald-50/80 border-emerald-600 text-emerald-900 ring-2 ring-emerald-500/20 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <div className="text-base font-extrabold text-emerald-700">{verifiedPlayers.length}</div>
                <div className="text-2xs uppercase tracking-wider mt-0.5">Verified Only</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedScope('pending')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedScope === 'pending'
                    ? 'bg-amber-50/80 border-amber-600 text-amber-900 ring-2 ring-amber-500/20 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <div className="text-base font-extrabold text-amber-700">{pendingPlayers.length}</div>
                <div className="text-2xs uppercase tracking-wider mt-0.5">Pending Only</div>
              </button>
            </div>
          </div>

          {/* Export Format Actions */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Choose Download Format:
            </label>

            {/* Format 1: Official PDF Document */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isExporting || targetList.length === 0}
              id="btn-modal-download-pdf"
              className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-teal-600 bg-teal-50/40 hover:bg-teal-50 text-slate-900 hover:border-teal-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group shadow-xs"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  {isExporting && downloadFormat === 'pdf' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                <div className="text-left">
                  <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <span>Download Master PDF Directory</span>
                    <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                      Recommended
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Official landscape document with all 10 columns, ready to print or share
                  </div>
                </div>
              </div>
              <Download className="w-5 h-5 text-teal-600 shrink-0 ml-3" />
            </button>

            {/* Format 2: Excel / CSV Spreadsheet */}
            <button
              type="button"
              onClick={handleDownloadCSV}
              disabled={isExporting || targetList.length === 0}
              id="btn-modal-download-csv"
              className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-900 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-extrabold text-sm text-slate-900">
                    Download Excel / CSV Spreadsheet
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Structured tabular data with UTF-8 BOM for Microsoft Excel &amp; Google Sheets
                  </div>
                </div>
              </div>
              <Download className="w-5 h-5 text-slate-500 shrink-0 ml-3" />
            </button>
          </div>

          <div className="flex items-center justify-between text-2xs text-slate-400 pt-2 border-t border-slate-100">
            <span>Includes 8 Teams, Jersey sizes &amp; contact data</span>
            <button
              type="button"
              onClick={onClose}
              className="font-semibold text-slate-500 hover:text-slate-800 underline"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
