import { createClient } from '@supabase/supabase-js';

const STORAGE_CONFIG_KEY = 'cricket_custom_supabase_config_v1';

/**
 * Normalizes user-entered Supabase URL:
 * - If user entered dashboard URL (e.g. https://supabase.com/dashboard/project/xyz), converts to https://xyz.supabase.co
 * - If user entered only project reference ID (e.g. xyz123), converts to https://xyz123.supabase.co
 * - If user included trailing slashes or subpaths (/rest/v1), cleans to base origin https://xyz.supabase.co
 */
export function normalizeSupabaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let url = rawUrl.trim();

  // If user pasted a Supabase dashboard URL:
  // e.g. https://supabase.com/dashboard/project/abcdefghijk...
  const dashboardMatch = url.match(/project\/([a-z0-9_-]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // If user pasted just the project ID / ref code (e.g. 15-25 chars)
  if (/^[a-z0-9_-]{12,35}$/i.test(url)) {
    return `https://${url}.supabase.co`;
  }

  // Ensure https:// protocol
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);
    // Return base origin: https://xyz.supabase.co (strips /rest/v1, /api, trailing slashes)
    return parsed.origin;
  } catch (err) {
    return url.replace(/\/+$/, '');
  }
}

/**
 * Normalizes Supabase public API key (strips quotes and whitespace)
 */
export function normalizeSupabaseKey(rawKey) {
  if (!rawKey || typeof rawKey !== 'string') return '';
  return rawKey.trim().replace(/^['"]|['"]$/g, '');
}

/**
 * Get active Supabase configuration (from environment variables or local admin settings)
 */
export function getSupabaseConfig() {
  // 1. Check environment variables first (e.g. set in Vercel or .env)
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey && !envUrl.includes('placeholder') && envUrl.trim().length > 10) {
    const cleanUrl = normalizeSupabaseUrl(envUrl);
    const cleanKey = normalizeSupabaseKey(envKey);
    return {
      url: cleanUrl,
      anonKey: cleanKey,
      source: 'environment',
    };
  }

  // 2. Check localStorage for admin-saved credentials
  try {
    const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.url && parsed?.anonKey) {
        return {
          url: normalizeSupabaseUrl(parsed.url),
          anonKey: normalizeSupabaseKey(parsed.anonKey),
          source: 'dashboard',
        };
      }
    }
  } catch (err) {
    console.error('Error reading saved Supabase config:', err);
  }

  return {
    url: '',
    anonKey: '',
    source: 'none',
  };
}

/**
 * Save custom Supabase credentials from Admin UI
 */
export function saveSupabaseConfig(url, anonKey) {
  const cleanUrl = normalizeSupabaseUrl(url);
  const cleanKey = normalizeSupabaseKey(anonKey);

  if (!cleanUrl || !cleanKey) {
    localStorage.removeItem(STORAGE_CONFIG_KEY);
    clientInstance = null;
    return false;
  }

  localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify({ url: cleanUrl, anonKey: cleanKey }));
  clientInstance = null; // Reset cached instance
  return true;
}

/**
 * Clear custom Supabase credentials
 */
export function clearSupabaseConfig() {
  localStorage.removeItem(STORAGE_CONFIG_KEY);
  clientInstance = null;
}

let clientInstance = null;

/**
 * Returns an active Supabase client instance or null if not configured
 */
export function getSupabaseClient() {
  const config = getSupabaseConfig();

  if (!config.url || !config.anonKey) {
    return null;
  }

  if (!clientInstance) {
    try {
      clientInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } catch (err) {
      console.error('Failed to create Supabase client:', err);
      return null;
    }
  }

  return clientInstance;
}

/**
 * Check whether Supabase is configured and reachable
 */
export async function testSupabaseConnection(testUrl, testKey) {
  try {
    const url = normalizeSupabaseUrl(testUrl || getSupabaseConfig().url);
    const key = normalizeSupabaseKey(testKey || getSupabaseConfig().anonKey);

    if (!url || !key) {
      return { success: false, error: 'Supabase URL and Anon Public Key are required.' };
    }

    const testClient = createClient(url, key, {
      auth: { persistSession: false },
    });

    // Attempt a lightweight query to registrations table
    const { data, error } = await testClient
      .from('registrations')
      .select('id')
      .limit(1);

    if (error) {
      // If table doesn't exist yet, we get a specific error code
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return {
          success: false,
          tableMissing: true,
          error: 'Connected to Supabase, but the "registrations" table was not found. Please run the provided SQL script in your Supabase SQL Editor.',
        };
      }
      return { success: false, error: error.message || 'Database query error.' };
    }

    return { success: true, count: data?.length || 0, normalizedUrl: url };
  } catch (err) {
    return { success: false, error: err.message || 'Could not connect to Supabase.' };
  }
}
