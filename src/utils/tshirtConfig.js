/**
 * Centralized T-Shirt / Jersey Size Definitions & Helper Mappings
 * Ensures consistent display across Registration Form, Admin Table, Player Details Modal, and Exported PDF.
 */

export const TSHIRT_OPTIONS = [
  { value: '', label: 'Select T-Shirt Size', disabled: true },
  { value: 'XXS', label: 'XXS (32)', chest: '32' },
  { value: 'XS', label: 'XS (34)', chest: '34' },
  { value: 'S', label: 'S (36)', chest: '36' },
  { value: 'M', label: 'M (38)', chest: '38' },
  { value: 'L', label: 'L (40)', chest: '40' },
  { value: 'XL', label: 'XL (42)', chest: '42' },
  { value: '2XL', label: '2XL (44)', chest: '44' },
  { value: '3XL', label: '3XL (46)', chest: '46' },
  { value: '4XL', label: '4XL (48)', chest: '48' },
  { value: '5XL', label: '5XL (50)', chest: '50' },
  { value: '6XL', label: '6XL (52)', chest: '52' },
];

export const TSHIRT_SIZE_MAP = {
  XXS: 'XXS (32)',
  XS: 'XS (34)',
  S: 'S (36)',
  M: 'M (38)',
  L: 'L (40)',
  XL: 'XL (42)',
  '2XL': '2XL (44)',
  '3XL': '3XL (46)',
  '4XL': '4XL (48)',
  '5XL': '5XL (50)',
  '6XL': '6XL (52)',
};

/**
 * Returns formatted size with chest number (e.g. "S (36)" or "Size M (38)")
 * If raw value is already formatted or unknown, handles gracefully.
 */
export function formatTshirtSizeWithNumber(rawSize) {
  if (!rawSize) return 'N/A';
  const clean = String(rawSize).trim();
  
  if (TSHIRT_SIZE_MAP[clean]) {
    return TSHIRT_SIZE_MAP[clean];
  }

  // Handle case where clean contains size code
  const upper = clean.toUpperCase();
  if (TSHIRT_SIZE_MAP[upper]) {
    return TSHIRT_SIZE_MAP[upper];
  }

  return clean;
}
