import React, { useState } from 'react';
import { 
  Users, Trophy, Download, Shuffle, Settings, 
  Shirt, Eye, CheckCircle2, Clock, XCircle, ArrowRightLeft, 
  FileText, Loader2, Sparkles, Lock, UserCheck, Plus, AlertTriangle, RotateCcw
} from 'lucide-react';
import { formatTshirtSizeWithNumber } from '../utils/tshirtConfig';
import TeamSelectModal from './TeamSelectModal';

export default function TeamsSquadsView({
  players = [],
  teams = [],
  onUpdatePlayerTeam,
  onViewPlayerDetails,
  onDownloadTeamsPDF,
  onDownloadSingleTeamPDF,
  onDownloadAllPlayersPDF,
  onDownloadAllPlayersCSV,
  onOpenDownloadModal,
  onOpenManageTeams,
  onAutoDistribute,
  onVerifyPlayer,
  onUnverifyPlayer,
  isExportingPdf = false,
}) {
  const [playerForTeamModal, setPlayerForTeamModal] = useState(null);

  // Group players by teamId
  const teamBuckets = {};
  teams.forEach((t) => {
    teamBuckets[t.id] = [];
  });

  const verifiedDraftPool = [];
  const pendingQueue = [];

  players.forEach((player) => {
    if (player.teamId && teamBuckets[player.teamId]) {
      teamBuckets[player.teamId].push(player);
    } else {
      if (player.paymentStatus === 'verified') {
        verifiedDraftPool.push(player);
      } else {
        pendingQueue.push(player);
      }
    }
  });

  // Calculate global kit size distribution
  const globalSizes = {};
  players.forEach((p) => {
    const sz = formatTshirtSizeWithNumber(p.tshirtSize);
    globalSizes[sz] = (globalSizes[sz] || 0) + 1;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Verified</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
    }
  };

  const handleOpenTeamPicker = (player) => {
    setPlayerForTeamModal(player);
  };

  const handleSelectTeamFromModal = (playerId, teamId) => {
    onUpdatePlayerTeam(playerId, teamId);
  };

  const handleVerifyPlayerFromModal = async (playerId) => {
    if (onVerifyPlayer) {
      await onVerifyPlayer(playerId);
      // Update local object so modal unlocks immediately
      setPlayerForTeamModal((prev) => (prev ? { ...prev, paymentStatus: 'verified' } : null));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP TEAM ROSTER HERO CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <Trophy className="w-5 h-5 text-teal-600" />
            </span>
            <span className="text-xs uppercase tracking-wider font-extrabold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60">
              8 Official Tournament Teams
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Team Separation &amp; Jersey Kit Rosters
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-medium">
            Manage squads for all 8 tournament teams. Customize team names &amp; colors. Only <strong>Verified Players</strong> can be selected into teams. Easily download PDF rosters to separate team kits.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Customize Team Names & Colors */}
          <button
            type="button"
            onClick={onOpenManageTeams}
            id="btn-customize-teams-hero"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Customize Names &amp; Colors</span>
          </button>

          {/* Auto-Balance Verified Teams */}
          <button
            type="button"
            onClick={onAutoDistribute}
            disabled={verifiedDraftPool.length === 0}
            id="btn-auto-balance-verified"
            title="Evenly distribute verified draft pool players across 8 teams"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-teal-700 bg-teal-50/70 hover:bg-teal-100/70 disabled:opacity-50 disabled:cursor-not-allowed border border-teal-200 rounded-xl transition-colors cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5 text-teal-600" />
            <span>Auto-Balance ({verifiedDraftPool.length} Verified)</span>
          </button>

          {/* Primary: Download 8-Teams & Jersey Names PDF */}
          <button
            type="button"
            onClick={onDownloadTeamsPDF}
            disabled={isExportingPdf || players.length === 0}
            id="btn-download-teams-pdf-view"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating Team PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-white" />
                <span>Download 8-Teams PDF</span>
              </>
            )}
          </button>

          {/* Prominent Download Players (All Details) Action */}
          <button
            type="button"
            onClick={onOpenDownloadModal || onDownloadAllPlayersPDF}
            disabled={players.length === 0}
            id="btn-download-all-players-squads-view"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-black text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Download full player directory with all details (PDF & Excel)"
          >
            <Download className="w-4 h-4 text-teal-200" />
            <span>Download Players (All Details)</span>
          </button>

          {onDownloadAllPlayersCSV && (
            <button
              type="button"
              onClick={onDownloadAllPlayersCSV}
              disabled={players.length === 0}
              id="btn-download-all-players-csv-squads-view"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-slate-700 hover:text-teal-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Download all players as an Excel / CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. PENDING PLAYERS SECTION (RULE ENFORCEMENT: CANNOT SELECT SQUADS UNTIL VERIFIED) */}
      {pendingQueue.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-300/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-amber-200/80">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-amber-200/80 text-amber-900">
                <Lock className="w-4 h-4 text-amber-800" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <span>Pending Players ({pendingQueue.length})</span>
                  <span className="px-2 py-0.5 rounded-full text-2xs font-black bg-amber-200 text-amber-900 uppercase">
                    Team Selection Locked
                  </span>
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Pending players must be verified by the admin before they are eligible to be assigned to any of the 8 teams.
                </p>
              </div>
            </div>

            <span className="text-2xs font-bold text-amber-900 bg-amber-200/60 px-3 py-1 rounded-lg">
              Verify to Enable Team Allocation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {pendingQueue.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-amber-200/90 p-3.5 shadow-2xs flex flex-col justify-between gap-2.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-slate-900 text-sm truncate">{p.fullName}</span>
                    {p.tshirtNumber ? (
                      <span className="font-mono text-2xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        #{p.tshirtNumber}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-teal-700 tracking-wider">
                      JERSEY: {p.tshirtName || '-'}
                    </span>
                    {p.tshirtNumber && (
                      <span className="font-mono text-xs font-bold text-slate-700">
                        #{p.tshirtNumber}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Size: {formatTshirtSizeWithNumber(p.tshirtSize)} • {p.mobile}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>Locked</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => onViewPlayerDetails(p)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/70 px-2.5 py-1 rounded-lg border border-teal-200 transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Verify</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. VERIFIED UNASSIGNED DRAFT POOL (ELIGIBLE TO SELECT TEAMS) */}
      {verifiedDraftPool.length > 0 && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-emerald-200/80">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <span>Verified Draft Pool ({verifiedDraftPool.length} Players Ready for Teams)</span>
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  These verified players are approved and ready to be assigned to any of the 8 tournament squads.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onAutoDistribute}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-200/80 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
              <span>Auto-Assign All ({verifiedDraftPool.length})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {verifiedDraftPool.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-emerald-200 p-3.5 shadow-2xs flex flex-col justify-between gap-2.5 hover:shadow-xs transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-slate-900 text-sm truncate">{p.fullName}</span>
                    {p.tshirtNumber ? (
                      <span className="font-mono text-2xs font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                        #{p.tshirtNumber}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-teal-700 tracking-wider">
                      JERSEY: {p.tshirtName || '-'}
                    </span>
                    {p.tshirtNumber && (
                      <span className="font-mono text-xs font-bold text-slate-700">
                        #{p.tshirtNumber}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Size: {formatTshirtSizeWithNumber(p.tshirtSize)} • {p.mobile}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-emerald-700">Verified</span>
                    {onUnverifyPlayer && (
                      <button
                        type="button"
                        onClick={() => onUnverifyPlayer(p.id)}
                        title="Unverify player and return to Pending queue"
                        className="inline-flex items-center gap-0.5 text-2xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-2.5 h-2.5 text-amber-700" />
                        <span>Unverify</span>
                      </button>
                    )}
                  </div>

                  {/* UI/UX Team Selection Trigger */}
                  <button
                    type="button"
                    onClick={() => handleOpenTeamPicker(p)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Select Team</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. 8 SQUADS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {teams.map((team, teamIndex) => {
          const squad = teamBuckets[team.id] || [];
          
          // Team size breakdown
          const teamSizes = {};
          squad.forEach((p) => {
            const sz = formatTshirtSizeWithNumber(p.tshirtSize);
            teamSizes[sz] = (teamSizes[sz] || 0) + 1;
          });

          return (
            <div 
              key={team.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between"
            >
              {/* Team Card Header Banner with dynamic team color */}
              <div 
                className="p-4 sm:p-4.5 text-white flex items-center justify-between gap-3 shadow-inner"
                style={{ backgroundColor: team.color }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-xs text-white border border-white/30 shadow-xs">
                    {team.shortName}
                  </div>
                  <div>
                    <h3 className="font-black text-base sm:text-lg leading-tight tracking-tight text-white drop-shadow-xs">
                      {teamIndex + 1}. {team.name}
                    </h3>
                    <div className="text-2xs text-white/90 font-medium">
                      Squad Size: <strong className="text-white font-bold">{squad.length} Players</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDownloadSingleTeamPDF(team)}
                  title={`Download official squad & jersey roster PDF for ${team.name}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-800" />
                  <span className="hidden sm:inline">Team PDF</span>
                </button>
              </div>

              {/* Squad Players Table / Roster */}
              <div className="p-3 sm:p-4 flex-1">
                {squad.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    <p className="font-semibold text-slate-600">No players assigned yet</p>
                    <p className="mt-0.5 text-slate-400">Select verified players from the draft pool or use Auto-Balance.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-100 font-bold uppercase text-[10px] tracking-wider">
                          <th className="py-2 px-2">#</th>
                          <th className="py-2 px-2">Jersey Name &amp; #</th>
                          <th className="py-2 px-2">Player</th>
                          <th className="py-2 px-2 text-center">Size</th>
                          <th className="py-2 px-2 text-center">Status</th>
                          <th className="py-2 px-2 text-right">Squad Team</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {squad.map((player, pIdx) => {
                          const isPlayerVerified = player.paymentStatus === 'verified';

                          return (
                            <tr key={player.id} className="hover:bg-slate-50/70 transition-colors">
                              {/* Number */}
                              <td className="py-2.5 px-2 text-slate-400 font-mono text-2xs">
                                {pIdx + 1}
                              </td>

                              {/* Jersey Name & Jersey # Prominent! */}
                              <td className="py-2.5 px-2">
                                <div className="flex items-center gap-1.5">
                                  <span 
                                    className="font-black text-xs tracking-wider uppercase"
                                    style={{ color: team.color }}
                                  >
                                    {player.tshirtName || '-'}
                                  </span>
                                  {player.tshirtNumber && (
                                    <span className="font-mono text-2xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                                      #{player.tshirtNumber}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Player Name */}
                              <td className="py-2.5 px-2">
                                <button
                                  type="button"
                                  onClick={() => onViewPlayerDetails(player)}
                                  className="font-bold text-slate-900 hover:text-teal-700 text-left cursor-pointer truncate max-w-[120px] block"
                                  title={`View details for ${player.fullName}`}
                                >
                                  {player.fullName}
                                </button>
                                <span className="text-[11px] text-slate-400 block font-mono">
                                  {player.mobile}
                                </span>
                              </td>

                              {/* Size (Chest) */}
                              <td className="py-2.5 px-2 text-center">
                                <span className="inline-flex px-1.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                  {formatTshirtSizeWithNumber(player.tshirtSize)}
                                </span>
                              </td>

                              {/* Status & Unverify */}
                              <td className="py-2.5 px-2 text-center">
                                <div className="flex flex-col items-center gap-0.5">
                                  {getStatusBadge(player.paymentStatus)}
                                  {onUnverifyPlayer && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (window.confirm(`Unverify ${player.fullName}?\n\nTournament rules require players to be verified to belong to a squad. Unverifying will remove them from ${team.name} and return them to the pending verification queue.`)) {
                                          onUnverifyPlayer(player.id);
                                        }
                                      }}
                                      title="Unverify player and remove from squad"
                                      className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-900 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 transition-colors cursor-pointer"
                                    >
                                      <RotateCcw className="w-2.5 h-2.5 text-amber-700" />
                                      <span>Unverify</span>
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* Move Team: Modern Visual Team Picker Button */}
                              <td className="py-2.5 px-2 text-right">
                                {isPlayerVerified ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenTeamPicker(player)}
                                    title="Click to change this player's team"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all hover:shadow-2xs cursor-pointer"
                                    style={{ 
                                      backgroundColor: `${team.color}15`, 
                                      color: team.color,
                                      borderColor: `${team.color}40` 
                                    }}
                                  >
                                    <span>{team.shortName}</span>
                                    <ArrowRightLeft className="w-3 h-3 opacity-70" />
                                  </button>
                                ) : (
                                  <span 
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-bold bg-amber-50 text-amber-800 border border-amber-200 cursor-not-allowed"
                                    title="Pending player - verify first to change squad"
                                  >
                                    <Lock className="w-3 h-3 text-amber-600" />
                                    <span>Locked</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Card Footer: Kit Sizes Breakdown */}
              <div className="bg-slate-50 border-t border-slate-100 p-3 px-4 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Shirt className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-slate-700">Jersey Sizes:</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {Object.keys(teamSizes).length === 0 ? (
                    <span className="text-slate-400 text-2xs">0 kits</span>
                  ) : (
                    Object.entries(teamSizes).map(([size, count]) => (
                      <span
                        key={size}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-white text-slate-700 border border-slate-200"
                      >
                        <span>{size}:</span>
                        <strong className="text-slate-900">{count}</strong>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. GLOBAL TOURNAMENT KIT LOGISTICS OVERVIEW */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shirt className="w-5 h-5 text-teal-400" />
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Tournament Kit &amp; Jersey Manufacturer Summary
              </h3>
            </div>
            <p className="text-xs text-teal-200 mt-1 max-w-xl">
              Use this count when ordering jersey kits from your printing vendor and packaging kits into the 8 separate team boxes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(globalSizes).map(([size, count]) => (
              <div 
                key={size} 
                className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xs text-center"
              >
                <div className="text-2xs text-teal-300 font-bold">{size}</div>
                <div className="text-sm font-black text-white">{count}</div>
              </div>
            ))}
            <div className="px-3.5 py-1.5 rounded-xl bg-teal-500/20 border border-teal-400/40 text-center">
              <div className="text-2xs text-amber-300 font-bold">TOTAL</div>
              <div className="text-sm font-black text-white">{players.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. TEAM SELECTION MODAL */}
      <TeamSelectModal
        isOpen={Boolean(playerForTeamModal)}
        onClose={() => setPlayerForTeamModal(null)}
        player={playerForTeamModal}
        teams={teams}
        players={players}
        onSelectTeam={handleSelectTeamFromModal}
        onVerifyPlayer={handleVerifyPlayerFromModal}
        onUnverifyPlayer={onUnverifyPlayer}
      />

    </div>
  );
}
