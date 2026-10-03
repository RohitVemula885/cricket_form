import React, { useState, useEffect } from 'react';
import { X, Trophy, RotateCcw, Check, Palette, Sparkles, Shirt } from 'lucide-react';
import { DEFAULT_TEAMS, PRESET_TEAM_COLORS, hexToRgb } from '../utils/teamsConfig';

export default function ManageTeamsModal({
  isOpen,
  onClose,
  teams = [],
  onSaveTeams,
  onResetTeams,
}) {
  const [formData, setFormData] = useState(() => {
    return teams.map((t) => ({ ...t }));
  });

  // Re-sync when teams or isOpen changes
  useEffect(() => {
    if (isOpen && teams.length === 8) {
      setFormData(teams.map((t) => ({ ...t })));
    }
  }, [isOpen, teams]);

  if (!isOpen) return null;

  const handleNameChange = (index, value) => {
    setFormData((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], name: value };
      return next;
    });
  };

  const handleShortNameChange = (index, value) => {
    setFormData((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], shortName: value.toUpperCase().slice(0, 4) };
      return next;
    });
  };

  const handleColorChange = (index, hexColor) => {
    setFormData((prev) => {
      const next = [...prev];
      next[index] = { 
        ...next[index], 
        color: hexColor,
        rgb: hexToRgb(hexColor),
      };
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveTeams(formData);
    onClose();
  };

  const handleReset = () => {
    if (window.confirm('Reset all 8 team names and brand colors to original tournament defaults?')) {
      const reset = onResetTeams();
      setFormData(reset.map((t) => ({ ...t })));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
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
              <h3 className="text-lg font-bold text-slate-900">Customize 8 Team Names &amp; Colors</h3>
              <p className="text-xs text-slate-500">Edit squad names, short codes, and choose custom colors for each team</p>
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

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          
          {/* Quick presets instructions */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Palette className="w-4 h-4 text-teal-600" />
              <span>Click any color swatch or use the custom color picker to select each team&apos;s jersey color.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.map((team, idx) => (
              <div 
                key={team.id}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3 hover:border-slate-300 transition-colors"
              >
                {/* Team Card Header & Live Preview */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    {/* Live mini jersey preview */}
                    <div 
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0 relative"
                      style={{ backgroundColor: team.color }}
                      title={`Jersey Color: ${team.color}`}
                    >
                      <Shirt className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-800 block leading-tight">
                        Team {idx + 1}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {team.color}
                      </span>
                    </div>
                  </div>

                  {/* Live Badge Preview */}
                  <span 
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-extrabold border shadow-2xs"
                    style={{ 
                      backgroundColor: `${team.color}15`, 
                      color: team.color, 
                      borderColor: `${team.color}40` 
                    }}
                  >
                    <span>{team.name || `Team ${idx + 1}`}</span>
                    <span className="opacity-80 font-mono">[{team.shortName || 'T' + (idx + 1)}]</span>
                  </span>
                </div>

                {/* Team Name and Code */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Team Name
                    </label>
                    <input
                      type="text"
                      required
                      value={team.name}
                      onChange={(e) => handleNameChange(idx, e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-teal-500 rounded-lg text-xs font-bold text-slate-900 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={team.shortName}
                      onChange={(e) => handleShortNameChange(idx, e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-teal-500 rounded-lg text-xs font-mono font-bold text-center text-slate-900 uppercase outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Team Color Picker & Quick Palettes */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                      <span>Team Brand Color:</span>
                      <strong className="font-mono text-2xs text-slate-800">{team.color}</strong>
                    </label>

                    {/* Native Hex Color Picker Input */}
                    <label className="relative inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-800 cursor-pointer">
                      <span>Custom Picker</span>
                      <input
                        type="color"
                        value={team.color}
                        onChange={(e) => handleColorChange(idx, e.target.value)}
                        className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                    </label>
                  </div>

                  {/* Preset Colors Grid */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {PRESET_TEAM_COLORS.map((preset) => {
                      const isSelected = team.color.toLowerCase() === preset.hex.toLowerCase();
                      return (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => handleColorChange(idx, preset.hex)}
                          title={`${preset.label} (${preset.hex})`}
                          className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                            isSelected 
                              ? 'scale-115 ring-2 ring-slate-900 ring-offset-1 border-white' 
                              : 'hover:scale-110 border-black/10'
                          }`}
                          style={{ backgroundColor: preset.hex }}
                        />
                      );
                    })}
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                id="btn-save-teams-and-colors"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Team Names &amp; Colors</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
