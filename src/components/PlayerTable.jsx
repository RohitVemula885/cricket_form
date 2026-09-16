import React from 'react';
import { Eye, Trash2, Clock, CheckCircle2, XCircle, Shirt, Phone, Mail, Image as ImageIcon } from 'lucide-react';

export default function PlayerTable({
  players = [],
  onViewDetails,
  onDeletePlayer,
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
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
            <span>Size {player.tshirtSize || 'N/A'}</span>
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
      <div className="hidden md:block overflow-hidden bg-white border border-slate-200 rounded-xl shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Player</th>
                <th className="py-3.5 px-4">Mobile</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">T-Shirt</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {players.map((player) => (
                <tr 
                  key={player.id} 
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Player Name and ID */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {player.fullName}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {player.id}
                    </div>
                  </td>

                  {/* Mobile */}
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{player.mobile}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate" title={player.email}>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{player.email}</span>
                    </div>
                  </td>

                  {/* T-Shirt */}
                  <td className="py-3.5 px-4">
                    {getTShirtBadge(player)}
                  </td>

                  {/* Payment Proof Quick Link */}
                  <td className="py-3.5 px-4">
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
                    {getStatusBadge(player.paymentStatus)}
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
        {players.map((player) => (
          <div 
            key={player.id} 
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-900 text-base">{player.fullName}</h4>
                <p className="text-xs text-slate-400 font-mono">{player.id}</p>
              </div>
              <div>
                {getStatusBadge(player.paymentStatus)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
              <div>
                <span className="text-slate-400 block font-medium">Mobile</span>
                <span className="text-slate-800 font-semibold">{player.mobile}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">T-Shirt & Jersey</span>
                <span className="text-slate-800 font-bold">
                  Size {player.tshirtSize || '-'}
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
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Details</span>
              </button>

              <button
                type="button"
                onClick={() => onDeletePlayer(player)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete registration"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
