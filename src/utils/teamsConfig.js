/**
 * 8 Official Tournament Teams Configuration
 * Allows customizable team names, short names, brand colors, and jersey badges.
 */

export const PRESET_TEAM_COLORS = [
  { label: 'Crimson Red', hex: '#dc2626' },
  { label: 'Royal Blue', hex: '#2563eb' },
  { label: 'Gold Amber', hex: '#d97706' },
  { label: 'Blaze Orange', hex: '#ea580c' },
  { label: 'Electric Purple', hex: '#7c3aed' },
  { label: 'Capitals Cyan', hex: '#0284c7' },
  { label: 'Rajasthan Pink', hex: '#db2777' },
  { label: 'Giants Teal', hex: '#0d9488' },
  { label: 'Emerald Green', hex: '#16a34a' },
  { label: 'Midnight Navy', hex: '#1e3a8a' },
  { label: 'Vibrant Indigo', hex: '#4f46e5' },
  { label: 'Ruby Rose', hex: '#e11d48' },
  { label: 'Neon Lime', hex: '#65a30d' },
  { label: 'Sunset Coral', hex: '#f97316' },
  { label: 'Deep Violet', hex: '#9333ea' },
  { label: 'Carbon Black', hex: '#18181b' },
];

/**
 * Converts hex color (#rrggbb or #rgb) to [r, g, b] array for jsPDF
 */
export function hexToRgb(hex) {
  if (!hex) return [15, 118, 110];
  let clean = String(hex).replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length !== 6) {
    return [15, 118, 110];
  }
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export const DEFAULT_TEAMS = [
  {
    id: 'team-1',
    name: 'Royal Strikers',
    shortName: 'RS',
    color: '#dc2626', // Crimson Red
    rgb: [220, 38, 38],
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    headerClass: 'from-red-600 to-rose-700',
  },
  {
    id: 'team-2',
    name: 'Garuda Warriors',
    shortName: 'GW',
    color: '#2563eb', // Royal Blue
    rgb: [37, 99, 235],
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    headerClass: 'from-blue-600 to-indigo-700',
  },
  {
    id: 'team-3',
    name: 'Hitman 11',
    shortName: 'H11',
    color: '#ea580c', // Blaze Orange
    rgb: [234, 88, 12],
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
    headerClass: 'from-orange-500 to-red-600',
  },
  {
    id: 'team-4',
    name: 'Ozel Prime Strikers',
    shortName: 'OPS',
    color: '#7c3aed', // Purple
    rgb: [124, 58, 237],
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    headerClass: 'from-purple-600 to-violet-800',
  },
  {
    id: 'team-5',
    name: 'Supreme Strikers',
    shortName: 'SS',
    color: '#16a34a', // Emerald Green
    rgb: [22, 163, 74],
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    headerClass: 'from-emerald-600 to-teal-700',
  },
  {
    id: 'team-6',
    name: 'Invincibles',
    shortName: 'INV',
    color: '#0284c7', // Sky Blue / Cyan
    rgb: [2, 132, 199],
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    headerClass: 'from-sky-600 to-cyan-700',
  },
  {
    id: 'team-7',
    name: 'Pathan Tigers',
    shortName: 'PT',
    color: '#d97706', // Gold / Amber
    rgb: [217, 119, 6],
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
    headerClass: 'from-amber-500 to-yellow-600',
  },
  {
    id: 'team-8',
    name: 'Pitchside',
    shortName: 'PS',
    color: '#0d9488', // Teal
    rgb: [13, 148, 136],
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    headerClass: 'from-teal-600 to-emerald-700',
  },
];

const TEAMS_STORAGE_KEY = 'cricket_tournament_teams_v4';

/**
 * Get active 8 teams list from storage (or defaults)
 */
export function getStoredTeams() {
  try {
    const raw = localStorage.getItem(TEAMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 8) {
        // Check if outdated names exist (e.g., 'Mumbai Titans', 'Super Kings')
        const hasOldNames = parsed.some(
          (t) => t.name === 'Mumbai Titans' || t.name === 'Super Kings' || t.name === 'Knight Riders'
        );
        if (!hasOldNames) {
          return parsed.map((t, idx) => ({
            ...DEFAULT_TEAMS[idx],
            ...t,
            rgb: t.rgb || hexToRgb(t.color || DEFAULT_TEAMS[idx].color),
          }));
        }
      }
    }
  } catch (err) {
    console.error('Error reading teams from storage:', err);
  }
  // Save default updated teams to storage immediately
  try {
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(DEFAULT_TEAMS));
  } catch {
    // ignore
  }
  return DEFAULT_TEAMS;
}

/**
 * Save updated 8 teams to localStorage
 */
export function saveStoredTeams(teams) {
  try {
    const sanitized = teams.map((t) => ({
      ...t,
      color: t.color || '#0f766e',
      rgb: t.rgb || hexToRgb(t.color || '#0f766e'),
    }));
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(sanitized));
  } catch (err) {
    console.error('Error saving teams to storage:', err);
  }
}

/**
 * Reset teams to default 8 teams
 */
export function resetStoredTeams() {
  try {
    localStorage.removeItem(TEAMS_STORAGE_KEY);
  } catch (err) {
    console.error('Error resetting teams:', err);
  }
  return DEFAULT_TEAMS;
}

/**
 * Find team by id or fallback to unassigned info
 */
export function getTeamById(teamId, teamsList = DEFAULT_TEAMS) {
  if (!teamId) {
    return {
      id: '',
      name: 'Unassigned',
      shortName: 'UN',
      color: '#64748b',
      rgb: [100, 116, 139],
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      headerClass: 'from-slate-600 to-slate-800',
    };
  }

  const found = teamsList.find((t) => t.id === teamId || t.name.toLowerCase() === String(teamId).toLowerCase());
  if (found) {
    return {
      ...found,
      rgb: found.rgb || hexToRgb(found.color),
    };
  }

  return {
    id: teamId,
    name: teamId,
    shortName: String(teamId).slice(0, 2).toUpperCase(),
    color: '#0f766e',
    rgb: [15, 118, 110],
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    headerClass: 'from-teal-600 to-teal-800',
  };
}
