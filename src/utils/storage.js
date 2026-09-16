import { getSupabaseClient } from './supabaseClient.js';
import { compressImage } from './imageCompressor.js';

const STORAGE_KEY = 'cricket_match_registrations_v1';

// Sample realistic payment receipt placeholder images
const SAMPLE_RECEIPT_1 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="none"><rect width="600" height="800" rx="16" fill="%23FFFFFF"/><rect width="600" height="140" fill="%230F766E"/><text x="300" y="60" text-anchor="middle" fill="%23FFFFFF" font-family="sans-serif" font-weight="bold" font-size="24">UPI PAYMENT RECEIPT</text><text x="300" y="95" text-anchor="middle" fill="%2399F6E4" font-family="sans-serif" font-size="16">NextGen Cricket League 2026</text><circle cx="300" cy="180" r="35" fill="%23DCFCE7"/><path d="M288 180 L296 188 L314 170" stroke="%2316A34A" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><text x="300" y="245" text-anchor="middle" fill="%231E293B" font-family="sans-serif" font-weight="bold" font-size="28">₹600.00</text><text x="300" y="275" text-anchor="middle" fill="%2316A34A" font-family="sans-serif" font-weight="600" font-size="15">Payment Successful</text><line x1="40" y1="310" x2="560" y2="310" stroke="%23E2E8F0" stroke-width="2" stroke-dasharray="6 6"/><text x="60" y="360" fill="%2364748B" font-family="sans-serif" font-size="15">UPI Ref / UTR</text><text x="540" y="360" text-anchor="end" fill="%230F172A" font-family="monospace" font-weight="bold" font-size="15">629188402911</text><text x="60" y="410" fill="%2364748B" font-family="sans-serif" font-size="15">Paid to</text><text x="540" y="410" text-anchor="end" fill="%230F172A" font-family="sans-serif" font-weight="600" font-size="15">nextgen.cricket@okaxis</text><text x="60" y="460" fill="%2364748B" font-family="sans-serif" font-size="15">Match Category</text><text x="540" y="460" text-anchor="end" fill="%230F172A" font-family="sans-serif" font-size="15">Individual Player Entry</text><text x="60" y="510" fill="%2364748B" font-family="sans-serif" font-size="15">Time &amp; Date</text><text x="540" y="510" text-anchor="end" fill="%230F172A" font-family="sans-serif" font-size="15">25 Oct 2026, 09:30 AM</text></svg>`;

const SAMPLE_RECEIPT_2 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="none"><rect width="600" height="800" rx="16" fill="%23FFFFFF"/><rect width="600" height="140" fill="%231E293B"/><text x="300" y="60" text-anchor="middle" fill="%23FFFFFF" font-family="sans-serif" font-weight="bold" font-size="24">GOOGLE PAY TRANSFER</text><text x="300" y="95" text-anchor="middle" fill="%2394A3B8" font-family="sans-serif" font-size="16">Tournament Player Fee</text><circle cx="300" cy="180" r="35" fill="%23DCFCE7"/><path d="M288 180 L296 188 L314 170" stroke="%2316A34A" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><text x="300" y="245" text-anchor="middle" fill="%231E293B" font-family="sans-serif" font-weight="bold" font-size="28">₹600.00</text><text x="300" y="275" text-anchor="middle" fill="%2316A34A" font-family="sans-serif" font-weight="600" font-size="15">Completed</text><line x1="40" y1="310" x2="560" y2="310" stroke="%23E2E8F0" stroke-width="2" stroke-dasharray="6 6"/><text x="60" y="360" fill="%2364748B" font-family="sans-serif" font-size="15">Transaction ID</text><text x="540" y="360" text-anchor="end" fill="%230F172A" font-family="monospace" font-weight="bold" font-size="15">CICAgODm3899Kg</text><text x="60" y="410" fill="%2364748B" font-family="sans-serif" font-size="15">To</text><text x="540" y="410" text-anchor="end" fill="%230F172A" font-family="sans-serif" font-weight="600" font-size="15">NextGen Cricket Club</text><text x="60" y="460" fill="%2364748B" font-family="sans-serif" font-size="15">Date</text><text x="540" y="460" text-anchor="end" fill="%230F172A" font-family="sans-serif" font-size="15">25 Oct 2026, 10:15 AM</text></svg>`;

export const INITIAL_SAMPLE_PLAYERS = [
  {
    id: 'REG-2026-001',
    fullName: 'Rohit Vemula',
    mobile: '9876543210',
    email: 'rohitvemula154@gmail.com',
    tshirtSize: 'L',
    tshirtName: 'ROHIT',
    tshirtNumber: '7',
    paymentScreenshot: SAMPLE_RECEIPT_1,
    paymentStatus: 'pending',
    createdAt: '2026-09-15T09:40:00.000Z',
    notes: 'Submitted via portal. Awaiting organizer manual reconciliation.',
  },
  {
    id: 'REG-2026-002',
    fullName: 'Virat K. Sharma',
    mobile: '9823456781',
    email: 'virat.sharma@example.com',
    tshirtSize: 'M',
    tshirtName: 'VIRAT',
    tshirtNumber: '18',
    paymentScreenshot: SAMPLE_RECEIPT_2,
    paymentStatus: 'verified',
    createdAt: '2026-09-14T14:22:00.000Z',
    notes: 'Payment confirmed in tournament bank account.',
  },
  {
    id: 'REG-2026-003',
    fullName: 'Shreyas Iyer',
    mobile: '9711223344',
    email: 'shreyas.cricket@example.com',
    tshirtSize: 'XL',
    tshirtName: 'SHREYAS',
    tshirtNumber: '96',
    paymentScreenshot: SAMPLE_RECEIPT_1,
    paymentStatus: 'verified',
    createdAt: '2026-09-14T16:05:00.000Z',
    notes: 'Payment verified with match treasurer.',
  },
  {
    id: 'REG-2026-004',
    fullName: 'Jasprit Bumrah',
    mobile: '9899887766',
    email: 'j.bumrah@example.com',
    tshirtSize: 'M',
    tshirtName: 'BOOM BOOM',
    tshirtNumber: '93',
    paymentScreenshot: SAMPLE_RECEIPT_2,
    paymentStatus: 'pending',
    createdAt: '2026-09-15T11:12:00.000Z',
    notes: 'Transaction under review.',
  },
  {
    id: 'REG-2026-005',
    fullName: 'Kishan Patel',
    mobile: '9123456789',
    email: 'kishan.p@example.com',
    tshirtSize: 'S',
    tshirtName: 'KISHAN',
    tshirtNumber: '32',
    paymentScreenshot: SAMPLE_RECEIPT_1,
    paymentStatus: 'rejected',
    createdAt: '2026-09-13T10:15:00.000Z',
    notes: 'Screenshot blurred and UTR number could not be validated.',
  },
];

/**
 * Helper: Map database row (snake_case) to client model (camelCase)
 */
function mapFromDb(row) {
  if (!row) return null;
  let tshirtName = row.tshirt_name || row.tshirtName || '';
  let tshirtNumber = row.tshirt_number || row.tshirtNumber || '';

  // Fallback: parse from notes if stored in notes due to older table schema
  if (!tshirtName && row.notes && row.notes.includes('Jersey Name:')) {
    const match = row.notes.match(/Jersey Name:\s*([^,|]+)/i);
    if (match) tshirtName = match[1].trim();
  }
  if (!tshirtNumber && row.notes && row.notes.includes('Jersey #:')) {
    const match = row.notes.match(/Jersey #:\s*([^,|]+)/i);
    if (match) tshirtNumber = match[1].trim();
  }

  return {
    id: row.id,
    fullName: row.full_name || row.fullName || '',
    mobile: row.mobile || '',
    email: row.email || '',
    tshirtSize: row.tshirt_size || row.tshirtSize || '',
    tshirtName,
    tshirtNumber,
    paymentScreenshot: row.payment_screenshot || row.paymentScreenshot || '',
    paymentStatus: row.payment_status || row.paymentStatus || 'pending',
    notes: row.notes || '',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

/**
 * Helper: Map client model (camelCase) to database row (snake_case)
 */
function mapToDb(player) {
  return {
    id: player.id,
    full_name: player.fullName,
    mobile: player.mobile,
    email: player.email,
    tshirt_size: player.tshirtSize,
    tshirt_name: player.tshirtName || '',
    tshirt_number: player.tshirtNumber || '',
    payment_screenshot: player.paymentScreenshot || '',
    payment_status: player.paymentStatus || 'pending',
    notes: player.notes || '',
    created_at: player.createdAt || new Date().toISOString(),
  };
}

/**
 * Read registrations synchronously from local storage cache
 */
export function getLocalRegistrations() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_PLAYERS));
      return [...INITIAL_SAMPLE_PLAYERS];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading local registrations:', error);
    return [];
  }
}

/**
 * Save registrations to local storage cache
 */
export function setLocalRegistrations(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (error) {
    console.error('Error writing local registrations:', error);
  }
}

/**
 * Fetch all registrations.
 * If Supabase is configured, fetches live registrations across all devices!
 * If not, falls back to local storage.
 * 
 * @returns {Promise<Array<object>>}
 */
export async function getRegistrations() {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped = data.map(mapFromDb);
        // Cache to localStorage for offline resilience
        setLocalRegistrations(mapped);
        return mapped;
      }

      if (error) {
        console.warn('Supabase fetch failed, falling back to local cache:', error.message);
      }
    } catch (err) {
      console.warn('Supabase connection error:', err);
    }
  }

  // Fallback to local storage
  return getLocalRegistrations();
}

/**
 * Fetch a single registration by ID
 * @param {string} id 
 * @returns {Promise<object|null>}
 */
export async function getRegistrationById(id) {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return mapFromDb(data);
      }
    } catch (err) {
      console.warn('Supabase getById error:', err);
    }
  }

  const all = getLocalRegistrations();
  return all.find((item) => item.id === id) || null;
}

/**
 * Add a new player registration.
 * Works seamlessly from any mobile phone or browser.
 * 
 * @param {object} player 
 * @returns {Promise<object>}
 */
export async function addRegistration(player) {
  const localList = getLocalRegistrations();
  const regId = `REG-2026-${String(localList.length + 1).padStart(3, '0')}-${Math.floor(100 + Math.random() * 900)}`;

  // Automatically optimize and compress screenshot for lightning fast transmission
  let optimizedScreenshot = player.paymentScreenshot || '';
  if (optimizedScreenshot) {
    try {
      optimizedScreenshot = await compressImage(optimizedScreenshot, 1200, 0.8);
    } catch (compErr) {
      console.warn('Screenshot compression skipped:', compErr);
    }
  }

  const newRegistration = {
    id: regId,
    fullName: (player.fullName || '').trim(),
    mobile: (player.mobile || '').trim(),
    email: (player.email || '').trim().toLowerCase(),
    tshirtSize: player.tshirtSize || 'M',
    tshirtName: (player.tshirtName || '').trim().toUpperCase(),
    tshirtNumber: (player.tshirtNumber || '').trim(),
    paymentScreenshot: optimizedScreenshot,
    paymentStatus: 'pending',
    createdAt: new Date().toISOString(),
    notes: player.notes || 'Submitted by player via registration portal.',
  };

  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const rowToInsert = mapToDb(newRegistration);
      let { data, error } = await supabase
        .from('registrations')
        .insert([rowToInsert])
        .select();

      // Graceful schema compatibility: if user hasn't added the new columns yet to Supabase,
      // fallback to inserting without them and append the jersey details into notes!
      if (error && (error.message?.includes('column') || error.message?.includes('schema'))) {
        console.warn('Supabase column not found, inserting with jersey details in notes:', error.message);
        const fallbackRow = { ...rowToInsert };
        delete fallbackRow.tshirt_name;
        delete fallbackRow.tshirt_number;
        fallbackRow.notes = `${fallbackRow.notes || ''} | Jersey Name: ${newRegistration.tshirtName || 'N/A'}, Jersey #: ${newRegistration.tshirtNumber || 'N/A'}`;
        
        const fallbackRes = await supabase
          .from('registrations')
          .insert([fallbackRow])
          .select();
        
        data = fallbackRes.data;
        error = fallbackRes.error;
      }

      if (error) {
        console.error('Failed to insert into Supabase:', error.message);
        throw new Error(error.message);
      }

      if (data && data[0]) {
        const savedPlayer = mapFromDb(data[0]);
        // Guarantee jersey name and number in returned object
        if (!savedPlayer.tshirtName && newRegistration.tshirtName) {
          savedPlayer.tshirtName = newRegistration.tshirtName;
        }
        if (!savedPlayer.tshirtNumber && newRegistration.tshirtNumber) {
          savedPlayer.tshirtNumber = newRegistration.tshirtNumber;
        }
        // Update local cache
        setLocalRegistrations([savedPlayer, ...localList]);
        return savedPlayer;
      }
    } catch (err) {
      console.error('Supabase insert failed, saving to local cache:', err);
      // If error, persist locally as fallback
      setLocalRegistrations([newRegistration, ...localList]);
      return newRegistration;
    }
  }

  // Local storage mode
  setLocalRegistrations([newRegistration, ...localList]);
  return newRegistration;
}

/**
 * Update an existing player registration
 * @param {string} id 
 * @param {object} updates 
 * @returns {Promise<object|null>}
 */
export async function updateRegistration(id, updates) {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const dbUpdates = {};
      if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
      if (updates.mobile !== undefined) dbUpdates.mobile = updates.mobile;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.tshirtSize !== undefined) dbUpdates.tshirt_size = updates.tshirtSize;

      const { data, error } = await supabase
        .from('registrations')
        .update(dbUpdates)
        .eq('id', id)
        .select();

      if (!error && data && data[0]) {
        const updated = mapFromDb(data[0]);
        // Update local cache
        const all = getLocalRegistrations();
        const idx = all.findIndex((p) => p.id === id);
        if (idx !== -1) {
          all[idx] = updated;
          setLocalRegistrations(all);
        }
        return updated;
      }
    } catch (err) {
      console.error('Supabase update error:', err);
    }
  }

  // Local storage fallback
  const all = getLocalRegistrations();
  const index = all.findIndex((item) => item.id === id);
  if (index === -1) return null;

  all[index] = {
    ...all[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  setLocalRegistrations(all);
  return all[index];
}

/**
 * Delete a registration by ID
 * @param {string} id 
 * @returns {Promise<boolean>}
 */
export async function deleteRegistration(id) {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error.message);
      }
    } catch (err) {
      console.error('Supabase delete exception:', err);
    }
  }

  const all = getLocalRegistrations();
  const filtered = all.filter((item) => item.id !== id);
  setLocalRegistrations(filtered);
  return true;
}

/**
 * Reset local cache to sample records (or seed Supabase if empty)
 */
export async function resetToSampleData() {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      // Optional: seed sample records into Supabase if desired
      const rows = INITIAL_SAMPLE_PLAYERS.map(mapToDb);
      await supabase.from('registrations').upsert(rows);
    } catch (err) {
      console.warn('Could not seed Supabase:', err);
    }
  }

  setLocalRegistrations(INITIAL_SAMPLE_PLAYERS);
  return [...INITIAL_SAMPLE_PLAYERS];
}
