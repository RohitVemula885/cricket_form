import React from 'react';
import { 
  X, Trophy, CheckCircle2, Clock, XCircle, Shirt, Phone, 
  Lock, Check, UserCheck, AlertTriangle, ArrowRight, RotateCcw 
} from 'lucide-react';
import { formatTshirtSizeWithNumber } from '../utils/tshirtConfig';

export default function TeamSelectModal({
  isOpen,
  onClose,
  player,
  teams = [],
  players = [],
  onSelectTeam,
  onVerifyPlayer,
  onUnverifyPlayer,
}) {
  if (!isOpen || !player) return null;

  const isVerified = player.paymentStatus === 'verified';

  // Calculate current squad size for each team
  const squadCounts = {};
  teams.forEach((t) => {
    squadCounts[t.id] = players.filter((p) => p.teamId === t.id).length;
  });

  const handleTeamClick = (teamId) => {
    if (!isVerified) return;
    onSelectTeam(player.id, teamId);
    onClose();
  };

  const handleRemoveFromTeam = () => {
    onSelectTeam(player.id, '');
    onClose();
  };

  const handleVerifyNow = async () => {
    if (onVerifyPlayer) {
      await onVerifyPlayer(player.id);
    }
  };

  const handleUnverifyNow = async () => {
    if (onUnverifyPlayer) {
      if (window.confirm(`Unverify ${player.fullName}?\n\nTournament rules require verified status to belong to a team squad. Unverifying will return them to Pending status and remove any team squad assignment.`)) {
        await onUnverifyPlayer(player.id);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Trophy className="w-5 h-5 text-teal-600" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Select Tournament Team</h3>
              <p className="text-xs text-slate-500">Official 8-Team Match Roster Squad Allocation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Target Player Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">{player.fullName}</span>
                {player.tshirtNumber && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
                    #{player.tshirtNumber}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 font-bold text-teal-700 uppercase">
                  <Shirt className="w-3.5 h-3.5" />
                  Jersey: {player.tshirtName || '-'} {player.tshirtNumber ? `#${player.tshirtNumber}` : ''}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-medium">
                  Size: {formatTshirtSizeWithNumber(player.tshirtSize)}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {player.mobile}
                </span>
              </div>
            </div>

            {/* Status indicator & Unverify Option */}
            <div className="shrink-0 flex items-center gap-2">
              {isVerified ? (
                <>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Player</span>
                  </span>
                  {onUnverifyPlayer && (
                    <button
                      type="button"
                      onClick={handleUnverifyNow}
                      title="Unverify player and set back to Pending"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-amber-700" />
                      <span>Unverify</span>
                    </button>
                  )}
                </>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending Player</span>
                </span>
              )}
            </div>
          </div>

          {/* LOCK WARNING FOR PENDING PLAYERS */}
          {!isVerified ? (
            <div className="bg-amber-50/90 border border-amber-300/80 rounded-2xl p-5 text-amber-950 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-200 text-amber-900 shrink-0">
                  <Lock className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-950">
                    Pending Player Cannot Be Selected for Team
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    Tournament rules require players to be verified before they can be assigned to an official match team. 
                    Verify this player&apos;s registration to unlock squad selection.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleVerifyNow}
                  id="btn-verify-unlock-team"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Verify Player &amp; Unlock Teams</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Select an Official Squad for this Player:
              </p>
            </div>
          )}

          {/* 8 TEAMS INTERACTIVE GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {teams.map((team, idx) => {
              const isSelected = player.teamId === team.id;
              const count = squadCounts[team.id] || 0;

              return (
                <button
                  key={team.id}
                  type="button"
                  disabled={!isVerified}
                  onClick={() => handleTeamClick(team.id)}
                  className={`relative p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                    !isVerified
                      ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200'
                      : isSelected
                      ? 'ring-2 ring-teal-600 bg-teal-50/40 border-teal-300 shadow-xs cursor-pointer'
                      : 'hover:border-slate-400 hover:shadow-xs bg-white border-slate-200 cursor-pointer active:scale-98'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Team Color Pill / Avatar */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-xs shrink-0"
                      style={{ backgroundColor: team.color }}
                    >
                      {team.shortName}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-slate-900 leading-tight">
                          {team.name}
                        </span>
                        <span className="text-2xs font-mono font-bold text-slate-500">
                          [{team.shortName}]
                        </span>
                      </div>
                      <div className="text-2xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <span>Squad Size:</span>
                        <strong className="text-slate-700 font-bold">{count} Players</strong>
                      </div>
                    </div>
                  </div>

                  {/* Selected checkmark or status badge */}
                  <div className="shrink-0">
                    {!isVerified ? (
                      <Lock className="w-4 h-4 text-slate-400" />
                    ) : isSelected ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold bg-teal-600 text-white shadow-xs">
                        <Check className="w-3 h-3" />
                        <span>Current</span>
                      </span>
                    ) : (
                      <span 
                        className="text-xs font-bold hover:underline"
                        style={{ color: team.color }}
                      >
                        Assign
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Remove / Reset to Draft Pool Button */}
          {isVerified && player.teamId && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Want to remove player from current team?
              </span>
              <button
                type="button"
                onClick={handleRemoveFromTeam}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors cursor-pointer"
              >
                Remove from Team (Move to Draft Pool)
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            {isVerified
              ? 'Clicking a team allocates the player immediately.'
              : 'Verify the player first to activate team selection.'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
