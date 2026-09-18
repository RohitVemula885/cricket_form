/**
 * Authentication Utility (Temporary Demo Auth)
 * 
 * NOTE ON SUPABASE INTEGRATION:
 * This frontend-only authentication system uses localStorage and simulated delays for demo purposes.
 * Frontend-only authentication is NOT secure for production applications.
 * 
 * In the next version with Supabase:
 * - Replace this with Supabase Authentication:
 *   const { data, error } = await supabase.auth.signInWithPassword({ email, password });
 * - User sessions and JWT tokens will be managed securely by Supabase.
 * - Protect tables using Supabase Row Level Security (RLS) policies so only authenticated
 *   admins can read, update, or delete player registrations.
 */

const AUTH_STORAGE_KEY = 'cricket_admin_session';
const ADMIN_CONFIG_STORAGE_KEY = 'cricket_admin_credentials_v1';

// Default administrator credentials
export const DEFAULT_ADMIN_CREDENTIALS = {
  email: 'Karan@0409',
  password: 'Karan04',
  name: 'Match Organizer',
  role: 'Tournament Director',
};

/**
 * Retrieve current active admin credentials (custom or default)
 * @returns {{email: string, password: string, name: string, role: string}}
 */
export function getAdminCredentials() {
  try {
    const saved = localStorage.getItem(ADMIN_CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.email && parsed.password) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading custom admin credentials:', error);
  }
  return DEFAULT_ADMIN_CREDENTIALS;
}

/**
 * Update the administrator username/email and password
 * @param {object} newCredentials
 * @returns {object}
 */
export function updateAdminCredentials({ email, password, name }) {
  const current = getAdminCredentials();
  const updated = {
    ...current,
    email: email ? email.trim() : current.email,
    password: password !== undefined ? password : current.password,
    name: name ? name.trim() : current.name,
  };
  localStorage.setItem(ADMIN_CONFIG_STORAGE_KEY, JSON.stringify(updated));

  // If currently logged in, sync current session as well
  const currentSession = getAdminUser();
  if (currentSession) {
    const updatedSession = {
      ...currentSession,
      email: updated.email,
      name: updated.name,
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedSession));
  }

  return updated;
}

/**
 * Reset credentials back to default
 */
export function resetAdminCredentials() {
  localStorage.removeItem(ADMIN_CONFIG_STORAGE_KEY);
  return DEFAULT_ADMIN_CREDENTIALS;
}

export const DEMO_ADMIN_CREDENTIALS = DEFAULT_ADMIN_CREDENTIALS;

/**
 * Check if admin is currently authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  try {
    const session = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!session) return false;
    const parsed = JSON.parse(session);
    return Boolean(parsed && parsed.email);
  } catch (error) {
    console.error('Error checking auth state:', error);
    return false;
  }
}

/**
 * Get current admin session details
 * @returns {object|null}
 */
export function getAdminUser() {
  try {
    const session = localStorage.getItem(AUTH_STORAGE_KEY);
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error('Error retrieving admin session:', error);
    return null;
  }
}

/**
 * Authenticate admin with username/email and password
 * (Simulates network latency and authenticates against admin credentials)
 * 
 * Future Supabase implementation:
 * return await supabase.auth.signInWithPassword({ email, password });
 * 
 * @param {string} usernameOrEmail 
 * @param {string} password 
 * @returns {Promise<{success: boolean, error?: string, user?: object}>}
 */
export async function login(usernameOrEmail, password) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  const activeCreds = getAdminCredentials();
  const inputIdentifier = (usernameOrEmail || '').trim().toLowerCase();

  const isDefaultMatch =
    inputIdentifier === DEFAULT_ADMIN_CREDENTIALS.email.toLowerCase() &&
    password === DEFAULT_ADMIN_CREDENTIALS.password;

  const isActiveMatch =
    inputIdentifier === activeCreds.email.toLowerCase() &&
    password === activeCreds.password;

  if (isDefaultMatch || isActiveMatch) {
    const matchedCreds = isDefaultMatch ? DEFAULT_ADMIN_CREDENTIALS : activeCreds;
    const userSession = {
      email: matchedCreds.email,
      name: matchedCreds.name,
      role: matchedCreds.role,
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userSession));
    return { success: true, user: userSession };
  }

  return {
    success: false,
    error: 'Access denied: Invalid admin username or password.',
  };
}

/**
 * Log out admin and clear session
 * 
 * Future Supabase implementation:
 * await supabase.auth.signOut();
 */
export function logout() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
