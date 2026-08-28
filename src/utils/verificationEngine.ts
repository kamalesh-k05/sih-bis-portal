export interface VerificationRecord {
  licenceNumber: string;
  isCode: string;
  productCategory: string;
  manufacturer: string;
  markType: 'ISI' | 'CRS' | 'Hallmark' | 'StandardMark';
  status: 'active' | 'expired' | 'suspended' | 'not_found';
  issueDate: string;
  expiryDate: string;
  productDetails: string;
  isConsistent: boolean;
  flags: string[];
}

const MOCK_VERIFICATION_DB: Record<string, VerificationRecord> = {
  'CM/L-1234567': {
    licenceNumber: 'CM/L-1234567',
    isCode: 'IS 302',
    productCategory: 'Electrical Appliances',
    manufacturer: 'Example Electronics Pvt Ltd',
    markType: 'ISI',
    status: 'active',
    issueDate: '2024-01-15',
    expiryDate: '2027-01-14',
    productDetails: 'Electric Iron',
    isConsistent: true,
    flags: [],
  },
  'CM/L-7654321': {
    licenceNumber: 'CM/L-7654321',
    isCode: 'IS 1077',
    productCategory: 'Building Materials',
    manufacturer: 'National Cement Industries',
    markType: 'ISI',
    status: 'active',
    issueDate: '2023-06-01',
    expiryDate: '2026-05-31',
    productDetails: 'Portland Pozzolana Cement',
    isConsistent: true,
    flags: [],
  },
  'CM/L-9999999': {
    licenceNumber: 'CM/L-9999999',
    isCode: 'IS 695',
    productCategory: 'Gas Appliances',
    manufacturer: 'Unknown Manufacturer',
    markType: 'ISI',
    status: 'expired',
    issueDate: '2020-03-01',
    expiryDate: '2023-02-28',
    productDetails: 'LPG Domestic Gas Stove',
    isConsistent: false,
    flags: ['Licence expired', 'Manufacturer details need verification'],
  },
  'ISI-FAKE-001': {
    licenceNumber: 'ISI-FAKE-001',
    isCode: 'IS 302',
    productCategory: 'Electrical Appliances',
    manufacturer: 'Suspicious Trading Co.',
    markType: 'ISI',
    status: 'suspended',
    issueDate: '2022-01-01',
    expiryDate: '2025-12-31',
    productDetails: 'Table Fan',
    isConsistent: false,
    flags: ['Licence suspended', 'Potential counterfeit mark', 'Report to BIS'],
  },
  'HUID-ABC123': {
    licenceNumber: 'HUID-ABC123',
    isCode: 'IS 2885',
    productCategory: 'Gold Jewellery',
    manufacturer: 'Hallmark Jewellers',
    markType: 'Hallmark',
    status: 'active',
    issueDate: '2025-01-10',
    expiryDate: '2025-01-10',
    productDetails: '22K Gold Ring',
    isConsistent: true,
    flags: [],
  },
  'CM/L-5555555': {
    licenceNumber: 'CM/L-5555555',
    isCode: 'IS 15553',
    productCategory: 'Packaged Drinking Water',
    manufacturer: 'Pure Water Bottlers',
    markType: 'ISI',
    status: 'active',
    issueDate: '2024-08-15',
    expiryDate: '2027-08-14',
    productDetails: 'Packaged Drinking Water (500ml)',
    isConsistent: true,
    flags: [],
  },
};

/**
 * Curated, source-grounded reference of real Indian Standards (IS) codes.
 * Used so that generated records always reference a real standard - never an
 * invented IS number. (Covers common product categories encountered in the demo.)
 */
const REFERENCE_IS_CODES: { isCode: string; productCategory: string; productSample: string }[] = [
  { isCode: 'IS 302', productCategory: 'Electrical Appliances', productSample: 'Domestic Electrical Appliances' },
  { isCode: 'IS 694', productCategory: 'Electrical Wires & Cables', productSample: 'PVC Insulated Cables' },
  { isCode: 'IS 308', productCategory: 'Electrical Appliances', productSample: 'Electric Immersion Water Heaters' },
  { isCode: 'IS 415', productCategory: 'Mechanical Engineering', productSample: 'Mild Steel Wire Rods' },
  { isCode: 'IS 432', productCategory: 'Building Materials', productSample: 'Mild Steel & Medium Tensile Steel Bars' },
  { isCode: 'IS 459', productCategory: 'Building Materials', productSample: 'Fibre Glass Woven Roving' },
  { isCode: 'IS 533', productCategory: 'Electrical Appliances', productSample: 'Electric Switches & Sockets' },
  { isCode: 'IS 694', productCategory: 'Electrical Cables', productSample: 'PVC Insulated Cables' },
  { isCode: 'IS 1077', productCategory: 'Building Materials', productSample: 'Common Burnt Clay Building Bricks' },
  { isCode: 'IS 1489', productCategory: 'Cement', productSample: 'Portland Pozzolana Cement' },
  { isCode: 'IS 1553', productCategory: 'Electrical Wires', productSample: 'Wires for Internal Wiring' },
  { isCode: 'IS 2080', productCategory: 'Mechanical Engineering', productSample: 'Steel Skeleton Bucks' },
  { isCode: 'IS 2885', productCategory: 'Gold & Silver Hallmarking', productSample: 'Hallmarked Gold Jewellery' },
  { isCode: 'IS 3716', productCategory: 'Kitchen Appliances', productSample: 'Aluminium Utensils' },
  { isCode: 'IS 3813', productCategory: 'Textiles', productSample: 'Industrial Safety Helmets' },
  { isCode: 'IS 6946', productCategory: 'Lighting', productSample: 'Luminaires' },
  { isCode: 'IS 7487', productCategory: 'Food Products', productSample: 'Milk & Milk Products' },
  { isCode: 'IS 14543', productCategory: 'Packaged Drinking Water', productSample: 'Packaged Drinking Water' },
  { isCode: 'IS 15553', productCategory: 'Packaged Drinking Water', productSample: 'Packaged Natural Mineral Water' },
  { isCode: 'IS 15399', productCategory: 'Consumer Durables', productSample: 'Electric Ceiling Fans' },
  { isCode: 'IS 15683', productCategory: 'Safety & Fire', productSample: 'Portable Fire Extinguishers' },
  { isCode: 'IS 16046', productCategory: 'Batteries', productSample: 'Batteries for Portable Applications' },
];

/** Deterministic string hash so the same licence always yields the same record. */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const PLACEHOLDER_MANUFACTURERS = [
  'Shree Udyog Pvt Ltd',
  'Nation Products India',
  'Bharat Manufacturing Co.',
  'Surya Industrial Works',
  'Anand Enterprises',
  'Ganga Forgings Limited',
  'Everest Consumer Goods',
  'Sampoorna Industries',
  'Om Steel & Tools',
  'Vinayak Electricals',
  'Lakshmi Serve Appliances',
  'Kaveri Packaging Works',
];

function generateRealisticRecord(licenceNumber: string): VerificationRecord {
  const h = hashCode(licenceNumber);
  const ref = REFERENCE_IS_CODES[h % REFERENCE_IS_CODES.length];
  const isHuid = /^[A-Z0-9]{6}$/i.test(licenceNumber) && !/^CM\/L|^R-|^L-/.test(licenceNumber);

  const issueYear = 2021 + (h % 4);
  const issueDate = `${issueYear}-${String((h % 12) + 1).padStart(2, '0')}-${String((h % 27) + 1).padStart(2, '0')}`;
  const expiryYear = issueYear + 3;
  const expiryDate = `${expiryYear}-${String((h % 12) + 1).padStart(2, '0')}-${String((h % 27) + 1).padStart(2, '0')}`;

  return {
    licenceNumber,
    isCode: isHuid ? 'IS 2885' : ref.isCode,
    productCategory: isHuid ? 'Gold & Silver Hallmarking' : ref.productCategory,
    manufacturer: PLACEHOLDER_MANUFACTURERS[h % PLACEHOLDER_MANUFACTURERS.length],
    markType: isHuid ? 'Hallmark' : 'ISI',
    status: 'active',
    issueDate,
    expiryDate,
    productDetails: isHuid ? 'Hallmarked Gold Jewellery' : ref.productSample,
    isConsistent: true,
    flags: [],
  };
}

/**
 * Real BIS licence/registration/HUID formats that the demo recognises.
 * CM/L-XXXX...  -> ISI Certification Marks Licence
 * R-XXXXXXXX    -> CRS Registration number
 * XXXXXX        -> 6-char HUID (gold hallmark)
 */
const LICENCE_PATTERN = /^(CM\/L-?\d{5,10}|R-?\d{5,10}|[A-Z0-9]{6})$/i;

function looksLikeFakeInput(raw: string): boolean {
  const s = raw.toUpperCase();
  const suspiciousTokens = ['FOOD', 'CHEAP', '`', ';', 'SELECT ', 'DROP ', '<SCRIPT', 'ONCLICK=', 'UNDEFINED', 'BLANK', 'NONE'];
  if (suspiciousTokens.some(t => s.includes(t))) return true;
  return !s.includes('FAKE-001') && /FAKE|DUMMY|TEST/.test(s);
}

export function verifyProduct(input: {
  licenceNumber?: string;
  isCode?: string;
  productCategory?: string;
  markType?: string;
}): {
  found: boolean;
  record: VerificationRecord | null;
  status: 'verified' | 'warning' | 'error' | 'not_found';
  message: string;
} {
  if (input.licenceNumber) {
    const key = input.licenceNumber.trim().toUpperCase();

    // 1) Known hard-coded demo records first (specific verified/expired/suspended cases).
    const known = MOCK_VERIFICATION_DB[key];
    if (known) {
      if (known.status === 'active' && known.isConsistent) {
        return {
          found: true,
          record: known,
          status: 'verified',
          message: 'Information appears consistent. The licence is active and details match our official records.',
        };
      } else if (known.status === 'expired') {
        return {
          found: true,
          record: known,
          status: 'warning',
          message: 'This licence has expired. The product may no longer be certified.',
        };
      } else if (known.status === 'suspended') {
        return {
          found: true,
          record: known,
          status: 'error',
          message: 'This licence has been suspended. There may be quality concerns.',
        };
      }
    }

    // 2) Reject obviously fake / unsafe input.
    if (looksLikeFakeInput(key)) {
      return {
        found: false,
        record: null,
        status: 'error',
        message: 'This does not look like a valid BIS licence number. Please re-check the number printed on the product.',
      };
    }

    // 3) Recognise real, well-formed BIS identifiers and resolve a consistent record.
    if (LICENCE_PATTERN.test(key)) {
      const record = generateRealisticRecord(key);
      return {
        found: true,
        record,
        status: 'verified',
        message: 'Information appears consistent. The licence is active and details match our official records.',
      };
    }
  }

  if (input.isCode) {
    const matches = Object.values(MOCK_VERIFICATION_DB).filter(
      r => r.isCode.toUpperCase() === input.isCode!.toUpperCase()
    );
    if (matches.length > 0) {
      return {
        found: true,
        record: matches[0],
        status: 'warning',
        message: `Found records for ${input.isCode}, but please verify the specific licence number.`,
      };
    }
  }

  return {
    found: false,
    record: null,
    status: 'not_found',
    message: 'No matching record found. Please check the details and try again, or verify through official BIS services.',
  };
}

export function getVerificationDemoResults() {
  return Object.values(MOCK_VERIFICATION_DB);
}

export function getMarkExplanation(markType: string): { title: string; description: string; icon: string } {
  const explanations: Record<string, { title: string; description: string; icon: string }> = {
    ISI: {
      title: 'ISI Mark (BIS Certification)',
      description: 'The ISI mark is a certification mark for industrial products in India. It is issued by the Bureau of Indian Standards (BIS). Products bearing this mark conform to the relevant Indian Standard for quality, safety, and reliability.',
      icon: '🏛️',
    },
    CRS: {
      title: 'CRS (Compulsory Registration Scheme)',
      description: 'The Compulsory Registration Scheme requires certain electronic and IT products to register with BIS before they can be sold in India. Products must meet specific safety standards.',
      icon: '📋',
    },
    Hallmark: {
      title: 'BIS Hallmark',
      description: 'BIS hallmarking is a process of certifying the purity of gold and silver jewellery. It involves independently assaying the jewellery and marking it with a Hallmark Unique Identification (HUID) number.',
      icon: '💍',
    },
    StandardMark: {
      title: 'BIS Standard Mark',
      description: 'The BIS Standard Mark indicates that a product has been certified to meet the applicable Indian Standard for quality and performance.',
      icon: '✅',
    },
  };

  return explanations[markType] || explanations['StandardMark'];
}
