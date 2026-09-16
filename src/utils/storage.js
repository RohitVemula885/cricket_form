/**
 * Data Storage Utility (Temporary localStorage Implementation)
 * 
 * NOTE ON SUPABASE INTEGRATION:
 * All registration data currently persists in the browser's localStorage.
 * When integrating Supabase:
 * 
 * 1. SUPABASE STORAGE (for payment screenshots):
 *    - Upload image file directly to Supabase bucket:
 *      const { data, error } = await supabase.storage
 *        .from('payment-proofs')
 *        .upload(`${Date.now()}_${file.name}`, file);
 *      const { publicUrl } = supabase.storage
 *        .from('payment-proofs')
 *        .getPublicUrl(data.path);
 * 
 * 2. SUPABASE DATABASE (for player records):
 *    - getRegistrations:
 *      const { data, error } = await supabase.from('registrations').select('*').order('created_at', { ascending: false });
 *    - addRegistration:
 *      const { data, error } = await supabase.from('registrations').insert([newPlayer]).select();
 *    - updateRegistration:
 *      const { data, error } = await supabase.from('registrations').update(updates).eq('id', id);
 *    - deleteRegistration:
 *      const { error } = await supabase.from('registrations').delete().eq('id', id);
 */

const STORAGE_KEY = 'cricket_match_registrations_v1';

// Sample realistic payment receipt placeholder image (SVG Data URL)
const SAMPLE_RECEIPT_1 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="none"><rect width="600" height="800" rx="16" fill="%23FFFFFF"/><rect width="600" height="140" fill="%230F766E"/><text x="300" y="60" text-anchor="middle" fill="%23FFFFFF" font-family="sans-serif" font-weight="bold" font-size="24">UPI PAYMENT RECEIPT</text><text x="300" y="95" text-anchor="middle" fill="%2399F6E4" font-family="sans-serif" font-size="16">Premier Cricket League 2026</text><circle cx="300" cy="180" r="35" fill="%23DCFCE7"/><path d="M288 180 L296 188 L314 170" stroke="%2316A34A" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><text x="300" y="245" text-anchor="middle" fill="%231E293B" font-family="sans-serif" font-weight="bold" font-size="28">₹1,500.00</text><text x="300" y="275" text-anchor="middle" fill="%2316A34A" font-family="sans-serif" font-weight="600" font-size="15">Payment Successful</text><line x1="40" y1="310" x2="560" y2="310" stroke="%23E2E8F0" stroke-width="2" stroke-dasharray="6 6"/><text x="60" y="360" fill="%2364748B" font-family="sans-serif" font-size="15">UPI Ref / UTR</text><text x="540" y="360" text-anchor="end" fill="%230F172A" font-family="monospace" font-weight="bold" font-size="15">629188402911</text><text x="60" y="410" fill="%2364748B" font-family="sans-serif" font-size="15">Paid to</text><text x="540" y="410" text-anchor="end" fill="%230F172A" font-family="sans-serif" font-weight="600" font-size="15">cricket.organizer@okhdfcbank</text><text x="60" y="460" fill="%2364748B" font-family="sans-serif" font-size="15">Registration Category</text><text x="540" y="460" text-anchor="end" fill="%230F172A" font-family="sans-serif" font-size="15">All-Rounder / Team A</text><text x="60" y="510" fill="%2364748B" font-family="sans-serif" font-size="15">Time &amp; Date</text><text x="540" y="510" text-anchor="end" fill="%230F172A" font-family="sans-serif" font-size="15">14 Sep 2026, 04:32 PM</text><rect x="60" y="560" width="480" height="150" rx="12" fill="%23F8FAFC" stroke="%23E2E8F0"/><text x="80" y="600" fill="%23334155" font-family="sans-serif" font-weight="bold" font-size="15">Payment Verification Note</text><text x="80" y="635" fill="%2364748B" font-family="sans-serif" font-size="13">Verified against bank merchant statement.</text><text x="80" y="665" fill="%2364748B" font-family="sans-serif" font-size="13">Player entry ticket allocated upon verification.</text></svg>`;

const SAMPLE_RECEIPT_2 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="none"><rect width="600" height="800" rx="16" fill="%23FFFFFF"/><rect width="600" height="140" fill="%231E293B"/><text x="300" y="60" text-anchor="middle" fill="%23FFFFFF" font-family="sans-serif" font-weight="bold" font-size="24">GOOGLE PAY TRANSFER</text><text x="300" y="95" text-anchor="middle" fill="%2394A3B8" font-family="sans-serif" font-size="16">Match Registration Fee</text><circle cx="300" cy="180" r="35" fill="%23DCFCE7"/><path d="M288 180 L296 188 L314 170" stroke="%2316A34A" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><text x="300" y="245" text-anchor="middle" fill="%231E293B" font-family="sans-serif" font-weight="bold" font-size="28">₹1,500.00</text><text x="300" y="275" text-anchor="middle" fill="%2316A34A" font-family="sans-serif" font-weight="600" font-size="15">Completed</text><line x1="40" y1="310" x2="560" y2="310" stroke="%23E2E8F0" stroke-width="2" stroke-dasharray="6 6"/><text x="60" y="360" fill="%2364748B" font-family="sans-serif" font-size="15">Transaction ID</text><text x="540" y="360" text-anchor="end" fill="%230F172A" font-family="monospace" font-weight="bold" font-size="15">CICAgODm3899Kg</text><text x="60" y="410" fill="%2364748B" font-family="sans-serif" font-size="15">To</text><text x="540" y="410" text-anchor="end" fill="%230F172A" font-family="sans-serif" font-weight="600" font-size="15">Premier Trophy Sports Club</text><text x="60" y="460" fill="%2364748B" font-family="sans-serif" font-size="15">Date</text><text x="540" y="460" text-anchor="end" fill="%230F172A" font-family="sans-serif" font-size="15">15 Sep 2026, 11:15 AM</text></svg>`;

// Realistic initial dataset for initial preview
const INITIAL_SAMPLE_PLAYERS = [
  {
    id: 'REG-2026-001',
    fullName: 'Rohit Vemula',
    mobile: '9876543210',
    email: 'rohitvemula154@gmail.com',
    tshirtSize: 'L',
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
    paymentScreenshot: SAMPLE_RECEIPT_1,
    paymentStatus: 'rejected',
    createdAt: '2026-09-13T10:15:00.000Z',
    notes: 'Screenshot blurred and UTR number could not be validated.',
  },
  {
    id: 'REG-2026-006',
    fullName: 'Hardik Singh',
    mobile: '9833445566',
    email: 'hardik.singh@example.com',
    tshirtSize: 'XXL',
    paymentScreenshot: SAMPLE_RECEIPT_2,
    paymentStatus: 'verified',
    createdAt: '2026-09-12T18:45:00.000Z',
    notes: 'Full amount ₹1,500 received.',
  },
];

/**
 * Initialize storage with default mock records if none exist
 */
function initStorage() {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_PLAYERS));
    }
  } catch (error) {
    console.error('Failed to initialize local storage:', error);
  }
}

// Call initialization
initStorage();

/**
 * Fetch all registrations
 * 
 * Future Supabase replacement:
 * const { data, error } = await supabase
 *   .from('registrations')
 *   .select('*')
 *   .order('createdAt', { ascending: false });
 * return data || [];
 * 
 * @returns {Array<object>}
 */
export function getRegistrations() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_PLAYERS));
      return [...INITIAL_SAMPLE_PLAYERS];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return [];
  }
}

/**
 * Fetch a single registration by ID
 * 
 * Future Supabase replacement:
 * const { data, error } = await supabase
 *   .from('registrations')
 *   .select('*')
 *   .eq('id', id)
 *   .single();
 * return data;
 * 
 * @param {string} id 
 * @returns {object|null}
 */
export function getRegistrationById(id) {
  const all = getRegistrations();
  return all.find((item) => item.id === id) || null;
}

/**
 * Add a new player registration
 * 
 * Future Supabase replacement:
 * 1. Upload file to Supabase storage:
 *    const { data: uploadData } = await supabase.storage.from('proofs').upload(...);
 * 2. Insert record:
 *    const { data, error } = await supabase.from('registrations').insert([payload]);
 * 
 * @param {object} player 
 * @returns {Promise<object>}
 */
export async function addRegistration(player) {
  // Simulate network roundtrip latency (600ms)
  await new Promise((res) => setTimeout(res, 600));

  const all = getRegistrations();
  const newRegistration = {
    id: `REG-${new Date().getFullYear()}-${String(all.length + 1).padStart(3, '0')}-${Math.floor(100 + Math.random() * 900)}`,
    fullName: player.fullName.trim(),
    mobile: player.mobile.trim(),
    email: player.email.trim().toLowerCase(),
    tshirtSize: player.tshirtSize,
    paymentScreenshot: player.paymentScreenshot,
    paymentStatus: 'pending', // default status
    createdAt: new Date().toISOString(),
    notes: player.notes || 'Submitted by player via registration portal.',
  };

  const updatedList = [newRegistration, ...all];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

  return newRegistration;
}

/**
 * Update an existing player registration (e.g. change status to verified/rejected)
 * 
 * Future Supabase replacement:
 * const { data, error } = await supabase
 *   .from('registrations')
 *   .update(updates)
 *   .eq('id', id);
 * 
 * @param {string} id 
 * @param {object} updates 
 * @returns {Promise<object|null>}
 */
export async function updateRegistration(id, updates) {
  await new Promise((res) => setTimeout(res, 300));

  const all = getRegistrations();
  const index = all.findIndex((item) => item.id === id);

  if (index === -1) return null;

  all[index] = {
    ...all[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all[index];
}

/**
 * Delete a registration by ID
 * 
 * Future Supabase replacement:
 * const { error } = await supabase
 *   .from('registrations')
 *   .delete()
 *   .eq('id', id);
 * 
 * @param {string} id 
 * @returns {Promise<boolean>}
 */
export async function deleteRegistration(id) {
  await new Promise((res) => setTimeout(res, 300));

  const all = getRegistrations();
  const filtered = all.filter((item) => item.id !== id);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Helper to reset localStorage back to sample records
 */
export function resetToSampleData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_PLAYERS));
  return [...INITIAL_SAMPLE_PLAYERS];
}
