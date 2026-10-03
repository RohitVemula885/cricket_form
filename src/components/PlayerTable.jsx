import React from 'react';
import { 
  Eye, Trash2, Clock, CheckCircle2, XCircle, Shirt, Phone, 
  Mail, Image as ImageIcon, Users, Lock, Plus, ArrowRightLeft, RotateCcw 
} from 'lucide-react';
import { formatTshirtSizeWithNumber } from '../utils/tshirtConfig';
import { getTeamById, DEFAULT_TEAMS } from '../utils/teamsConfig';

export default function PlayerTable({
  players = [],
  teams = DEFAULT_TEAMS,
  onViewDetails,
  onDeletePlayer,
  onUpdatePlayerTeam,
  onOpenTeamPicker,
  onUpdateStatus,
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Player</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected Player</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Player</span>
          </span>
        );
    }
  };

  const getTShirtBadge = (player) => {
    return (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
            <Shirt className="w-3 h-3 text-teal-600" />
            <span>{formatTshirtSizeWithNumber(player.tshirtSize)}</span>
          </span>
          {player.tshirtNumber && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200">
              #{player.tshirtNumber}
            </span>
          )}
        </div>
        {player.tshirtName && (
          <span className="text-[11px] font-bold text-slate-600 tracking-wider">
            NAME: {player.tshirtName}
          </span>
        )}
      </div>
    );
  };

  const getTeamBadge = (player) => {
    const isVerified = player.paymentStatus === 'verified';

    // RULE: Pending players must not get to select to go to team option
    if (!isVerified) {
      return (
        <span 
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 cursor-not-allowed"
          title="Player is pending verification - verify player before team allocation is allowed"
        >
          <Lock className="w-3.5 h-3.5 text-amber-600" />
          <span>Locked (Pending)</span>
        </span>
      );
    }

    const team = getTeamById(player.teamId, teams);

    if (onOpenTeamPicker) {
      if (player.teamId) {
        return (
          <button
            type="button"
            onClick={() => onOpenTeamPicker(player)}
            title="Click to change player's team"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all hover:shadow-2xs cursor-pointer group"
            style={{ 
              backgroundColor: `${team.color}15`, 
              color: team.color, 
              borderColor: `${team.color}40` 
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: team.color }} />
            <span>{team.name}</span>
            <span className="opacity-75 font-mono">[{team.shortName}]</span>
            <ArrowRightLeft className="w-3 h-3 opacity-60 group-hover:opacity-100" />
          </button>
        );
      }

      return (
        <button
          type="button"
          onClick={() => onOpenTeamPicker(player)}
          title="Assign player to one of the 8 teams"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100/80 border border-teal-200 transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Assign Team</span>
        </button>
      );
    }

    if (onUpdatePlayerTeam) {
      return (
        <select
          value={player.teamId || ''}
          onChange={(e) => onUpdatePlayerTeam(player.id, e.target.value)}
          title="Change player's assigned team"
          className="text-xs font-semibold py-1 px-2 rounded-lg border border-slate-200 bg-white hover:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer shadow-2xs max-w-[140px] truncate"
        >
          <option value="">-- Unassigned --</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.shortName})
            </option>
          ))}
        </select>
      );
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${team.badgeClass}`}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: team.color }} />
        <span>{team.name}</span>
        <span className="opacity-75 font-mono">[{team.shortName}]</span>
      </span>
    );
  };

  if (!players || players.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
          <Shirt className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No registrations found</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
          No players match your search criteria or filter conditions.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* DESKTOP TABLE VIEW (md and up) */}
      <div className="hidden md:block overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Assigned Team</th>
                <th className="py-3 px-4">Contact Details</th>
                <th className="py-3 px-4">Jersey &amp; Size</th>
                <th className="py-3 px-4 text-center">Proof</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {players.map((player, index) => (
                <tr 
                  key={player.id} 
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Sequence Number */}
                  <td className="py-3.5 px-3 text-center font-mono tabular-nums text-xs text-slate-400">
                    {index + 1}
                  </td>

                  {/* Player Name */}
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => onViewDetails(player)}
                      className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors text-left cursor-pointer hover:underline"
                    >
                      {player.fullName}
                    </button>
                  </td>

                  {/* Team */}
                  <td className="py-3.5 px-4">
                    {getTeamBadge(player)}
                  </td>

                  {/* Mobile & Email */}
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-900">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{player.mobile}</span>
                    </div>
                    {player.email && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 max-w-[170px] truncate mt-0.5" title={player.email}>
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{player.email}</span>
                      </div>
                    )}
                  </td>

                  {/* T-Shirt & Jersey */}
                  <td className="py-3.5 px-4">
                    {getTShirtBadge(player)}
                  </td>

                  {/* Payment Proof Quick Link */}
                  <td className="py-3.5 px-4 text-center">
                    {player.paymentScreenshot ? (
                      <button
                        type="button"
                        onClick={() => onViewDetails(player)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Proof</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">N/A</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col items-start gap-1">
                      {getStatusBadge(player.paymentStatus)}
                      {onUpdateStatus && (
                        player.paymentStatus === 'verified' ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (player.teamId) {
                                if (window.confirm(`Unverify ${player.fullName}?\n\nTournament rules require verified status to belong to a squad. Unverifying will remove them from their team and return them to Pending verification queue.`)) {
                                  onUpdateStatus(player.id, 'pending');
                                }
                              } else {
                                onUpdateStatus(player.id, 'pending');
                              }
                            }}
                            title="Unverify player (Return to Pending status)"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-300 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-2.5 h-2.5 text-amber-700" />
                            <span>Unverify</span>
                          </button>
                        ) : player.paymentStatus === 'pending' ? (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(player.id, 'verified')}
                            title="Verify player registration and payment"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded border border-teal-300 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 text-teal-700" />
                            <span>Verify</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(player.id, 'pending')}
                            title="Reset player to Pending status"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded border border-slate-300 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-2.5 h-2.5 text-slate-500" />
                            <span>Set Pending</span>
                          </button>
                        )
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onViewDetails(player)}
                        id={`btn-view-${player.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeletePlayer(player)}
                        id={`btn-delete-${player.id}`}
                        title="Delete registration"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE RESPONSIVE CARDS (Under md) */}
      <div className="md:hidden space-y-3">
        {players.map((player) => {
          const isVerified = player.paymentStatus === 'verified';
          const team = getTeamById(player.teamId, teams);

          return (
            <div 
              key={player.id} 
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{player.fullName}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{player.mobile}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getStatusBadge(player.paymentStatus)}
                  {onUpdateStatus && (
                    player.paymentStatus === 'verified' ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (player.teamId) {
                            if (window.confirm(`Unverify ${player.fullName}?\n\nTournament rules require verified status to belong to a squad. Unverifying will remove them from their team and return them to Pending verification queue.`)) {
                              onUpdateStatus(player.id, 'pending');
                            }
                          } else {
                            onUpdateStatus(player.id, 'pending');
                          }
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-300 cursor-pointer"
                      >
                        <RotateCcw className="w-2.5 h-2.5 text-amber-700" />
                        <span>Unverify</span>
                      </button>
                    ) : player.paymentStatus === 'pending' ? (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(player.id, 'verified')}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded border border-teal-300 cursor-pointer"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-teal-700" />
                        <span>Verify</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(player.id, 'pending')}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 cursor-pointer"
                      >
                        <RotateCcw className="w-2.5 h-2.5 text-slate-500" />
                        <span>Set Pending</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Team Pill / Selector */}
              <div className="flex items-center justify-between text-xs py-2 px-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-medium">Assigned Team:</span>
                {!isVerified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>Locked (Pending)</span>
                  </span>
                ) : onOpenTeamPicker ? (
                  player.teamId ? (
                    <button
                      type="button"
                      onClick={() => onOpenTeamPicker(player)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold border shadow-2xs cursor-pointer"
                      style={{ 
                        backgroundColor: `${team.color}15`, 
                        color: team.color, 
                        borderColor: `${team.color}40` 
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: team.color }} />
                      <span>{team.name}</span>
                      <ArrowRightLeft className="w-2.5 h-2.5 opacity-70" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenTeamPicker(player)}
                      className="inline-flex items-center gap-1 text-2xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Select Team</span>
                    </button>
                  )
                ) : (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${team.badgeClass}`}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: team.color }} />
                    <span>{team.name}</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                <div>
                  <span className="text-slate-400 block font-medium">Mobile</span>
                  <span className="text-slate-800 font-semibold">{player.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">T-Shirt &amp; Jersey</span>
                  <span className="text-slate-800 font-bold">
                    {formatTshirtSizeWithNumber(player.tshirtSize)}
                    {player.tshirtNumber ? ` • #${player.tshirtNumber}` : ''}
                  </span>
                  {player.tshirtName && (
                    <span className="text-[11px] text-teal-700 font-semibold block uppercase">
                      {player.tshirtName}
                    </span>
                  )}
                </div>
                <div className="col-span-2 truncate">
                  <span className="text-slate-400 block font-medium">Email</span>
                  <span className="text-slate-700 truncate block">{player.email}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => onViewDetails(player)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeletePlayer(player)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete registration"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
