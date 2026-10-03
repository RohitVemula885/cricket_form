import React, { useState } from 'react';
import { 
  X, CheckCircle2, XCircle, Clock, Calendar, Mail, 
  Phone, Shirt, Users, Lock, ArrowRightLeft, Sparkles, Plus, Check, AlertTriangle, RotateCcw
} from 'lucide-react';
import { formatTshirtSizeWithNumber } from '../utils/tshirtConfig';
import { DEFAULT_TEAMS, getTeamById } from '../utils/teamsConfig';

export default function PlayerModal({
  player,
  teams = DEFAULT_TEAMS,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdateTeam,
  onOpenTeamPicker,
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showInlinePicker, setShowInlinePicker] = useState(false);

  if (!isOpen || !player) return null;

  const isVerified = player.paymentStatus === 'verified';
  const currentTeam = getTeamById(player.teamId, teams);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'pending' && isVerified && player.teamId) {
      const confirmUnverify = window.confirm(
        `Are you sure you want to unverify ${player.fullName}?\n\nTournament rules require players to be verified to be in an official squad. Unverifying will remove them from ${currentTeam.name} and return them to the pending verification queue.`
      );
      if (!confirmUnverify) return;
    }
    setIsUpdating(true);
    try {
      await onUpdateStatus(player.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSelectTeamInline = async (newTeamId) => {
    if (!isVerified) return;
    if (onUpdateTeam) {
      setIsUpdating(true);
      try {
        await onUpdateTeam(player.id, newTeamId);
        setShowInlinePicker(false);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleOpenPickerModal = () => {
    if (!isVerified) return;
    if (onOpenTeamPicker) {
      onOpenTeamPicker(player);
    } else {
      setShowInlinePicker((prev) => !prev);
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
            <h3 className="text-lg font-bold text-slate-900">{player.fullName}</h3>
            <p className="text-xs text-slate-500 font-medium">Player Details &amp; Squad Assignment</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* 1. TOURNAMENT TEAM SQUAD SECTION */}
          {!isVerified ? (
            /* RULE: Pending players must not get to select to go to team option */
            <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-200 text-amber-900 shrink-0">
                  <Lock className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                    <span>Team Selection Locked (Pending Player)</span>
                    <span className="px-2 py-0.5 rounded-full text-2xs font-extrabold bg-amber-200 text-amber-900 uppercase">
                      Action Required
                    </span>
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    Tournament rules require players to be <strong>Verified</strong> before they can be assigned to an official team squad. Pending players cannot join or select any team.
                  </p>
                </div>
              </div>

              <div className="pt-2 pl-0 sm:pl-10 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleStatusChange('verified')}
                  disabled={isUpdating}
                  id="modal-verify-and-unlock-team"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Player Now &amp; Unlock Team Selection</span>
                </button>
                <span className="text-2xs text-amber-700 font-medium">
                  Verifying will instantly allow squad assignment.
                </span>
              </div>
            </div>
          ) : (
            /* VERIFIED: ENHANCED MODERN TEAM SELECTION UI/UX */
            <div className="bg-gradient-to-r from-slate-50 to-teal-50/50 rounded-2xl p-4 sm:p-5 border border-teal-200/80 shadow-2xs space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-xs shrink-0"
                    style={{ backgroundColor: currentTeam.color }}
                  >
                    {currentTeam.shortName || 'UN'}
                  </div>
                  <div>
                    <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider block">
                      Assigned Tournament Squad
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-base font-black text-slate-900">
                        {currentTeam.name}
                      </span>
                      <span 
                        className="px-2 py-0.5 rounded-md text-2xs font-mono font-extrabold border shadow-2xs"
                        style={{ 
                          backgroundColor: `${currentTeam.color}15`, 
                          color: currentTeam.color, 
                          borderColor: `${currentTeam.color}40` 
                        }}
                      >
                        [{currentTeam.shortName}]
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team Selector Trigger Button */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenPickerModal}
                    id="btn-modal-open-team-selector"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>{player.teamId ? 'Change Team Squad' : 'Select Team Squad'}</span>
                  </button>

                  {player.teamId && (
                    <button
                      type="button"
                      onClick={() => handleSelectTeamInline('')}
                      disabled={isUpdating}
                      title="Move player back to unassigned draft pool"
                      className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                    >
                      Unassign
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Visual Team Grid (Toggleable or fallback) */}
              {showInlinePicker && (
                <div className="pt-3 border-t border-teal-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                    <span>Click a team to assign immediately:</span>
                    <button 
                      type="button" 
                      onClick={() => setShowInlinePicker(false)}
                      className="text-2xs text-slate-400 hover:text-slate-600"
                    >
                      Close
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {teams.map((t) => {
                      const isCurrent = player.teamId === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleSelectTeamInline(t.id)}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                            isCurrent
                              ? 'ring-2 ring-teal-600 bg-teal-50 border-teal-300 font-bold shadow-2xs'
                              : 'bg-white hover:border-slate-400 hover:shadow-2xs border-slate-200'
                          }`}
                        >
                          <span 
                            className="w-3 h-3 rounded-full shrink-0 shadow-2xs" 
                            style={{ backgroundColor: t.color }} 
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 block truncate">
                              {t.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              [{t.shortName}]
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. PLAYER INFORMATION GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <div>
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Full Name</span>
              <span className="text-base font-bold text-slate-900">{player.fullName}</span>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Verification Status</span>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {player.paymentStatus === 'verified' && (
                  <>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Player</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStatusChange('pending')}
                      disabled={isUpdating}
                      title="Unverify this player and set status back to Pending"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-2xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-amber-700" />
                      <span>Unverify Player (Set to Pending)</span>
                    </button>
                  </>
                )}
                {player.paymentStatus === 'rejected' && (
                  <>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Rejected Player</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStatusChange('pending')}
                      disabled={isUpdating}
                      title="Reset player to Pending status"
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-2xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-500" />
                      <span>Set as Pending</span>
                    </button>
                  </>
                )}
                {player.paymentStatus === 'pending' && (
                  <>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending Player</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStatusChange('verified')}
                      disabled={isUpdating}
                      title="Verify player payment and unlock team selection"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-2xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                      <CheckCircle2 className="w-3 h-3 text-white" />
                      <span>Verify Now</span>
                    </button>
                  </>
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
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Name on T-Shirt / Jersey</span>
              <div className="text-sm font-bold text-teal-700 tracking-wide uppercase">
                {player.tshirtName ? player.tshirtName.toUpperCase() : 'Not Specified'}
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-400 block mb-0.5">Number on T-Shirt / Jersey</span>
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
            {!isVerified 
              ? 'Player must be verified before they can be selected into any team.'
              : 'Player is verified and eligible for match squads.'}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end order-1 sm:order-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200 cursor-pointer"
            >
              Close
            </button>

            {/* UNVERIFY OPTION: When player is verified, provide prominent Unverify button */}
            {isVerified ? (
              <button
                type="button"
                onClick={() => handleStatusChange('pending')}
                disabled={isUpdating}
                id="btn-modal-unverify-player"
                title="Unverify this player and set back to Pending"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-800" />
                <span>Unverify Player</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleStatusChange('verified')}
                disabled={isUpdating}
                id="btn-modal-verify-player"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify Player</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleStatusChange('rejected')}
              disabled={isUpdating || player.paymentStatus === 'rejected'}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Player</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
