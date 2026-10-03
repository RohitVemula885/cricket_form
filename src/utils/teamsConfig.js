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
    color: '#dc2626', // Red
    rgb: [220, 38, 38],
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    headerClass: 'from-red-600 to-rose-700',
  },
  {
    id: 'team-2',
    name: 'Mumbai Titans',
    shortName: 'MT',
    color: '#2563eb', // Blue
    rgb: [37, 99, 235],
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    headerClass: 'from-blue-600 to-indigo-700',
  },
  {
    id: 'team-3',
    name: 'Super Kings',
    shortName: 'SK',
    color: '#d97706', // Amber / Gold
    rgb: [217, 119, 6],
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
    headerClass: 'from-amber-500 to-yellow-600',
  },
  {
    id: 'team-4',
    name: 'Sunrisers',
    shortName: 'SR',
    color: '#ea580c', // Orange
    rgb: [234, 88, 12],
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
    headerClass: 'from-orange-500 to-red-600',
  },
  {
    id: 'team-5',
    name: 'Knight Riders',
    shortName: 'KR',
    color: '#7c3aed', // Purple
    rgb: [124, 58, 237],
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    headerClass: 'from-purple-600 to-violet-800',
  },
  {
    id: 'team-6',
    name: 'Delhi Capitals',
    shortName: 'DC',
    color: '#0284c7', // Sky Blue / Navy
    rgb: [2, 132, 199],
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    headerClass: 'from-sky-600 to-cyan-700',
  },
  {
    id: 'team-7',
    name: 'Rajasthan Warriors',
    shortName: 'RW',
    color: '#db2777', // Pink
    rgb: [219, 39, 119],
    badgeClass: 'bg-pink-50 text-pink-700 border-pink-200',
    headerClass: 'from-pink-600 to-rose-700',
  },
  {
    id: 'team-8',
    name: 'Gujarat Giants',
    shortName: 'GG',
    color: '#0d9488', // Teal
    rgb: [13, 148, 136],
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    headerClass: 'from-teal-600 to-emerald-700',
  },
];

const TEAMS_STORAGE_KEY = 'cricket_tournament_teams_v2';

/**
 * Get active 8 teams list from storage (or defaults)
 */
export function getStoredTeams() {
  try {
    const raw = localStorage.getItem(TEAMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 8) {
        return parsed.map((t, idx) => ({
          ...DEFAULT_TEAMS[idx],
          ...t,
          rgb: t.rgb || hexToRgb(t.color || DEFAULT_TEAMS[idx].color),
        }));
      }
    }
  } catch (err) {
    console.error('Error reading teams from storage:', err);
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
