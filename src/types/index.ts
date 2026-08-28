export type UserType = 'business' | 'consumer' | null;

export type Language =
  | 'en'   // English
  | 'hi'   // Hindi
  | 'ta'   // Tamil
  | 'te'   // Telugu
  | 'bn'   // Bengali
  | 'mr'   // Marathi
  | 'gu'   // Gujarati
  | 'kn'   // Kannada
  | 'ml'   // Malayalam
  | 'pa'   // Punjabi
  | 'or'   // Odia
  | 'as'   // Assamese
  | 'ur'   // Urdu
  | 'sa';  // Sanskrit

export interface UserProfile {
  type: UserType;
  name?: string;
  products: SavedProduct[];
  checks: ProductCheck[];
  complaints: Complaint[];
}

export interface SavedProduct {
  id: string;
  name: string;
  category: string;
  standards: string[];
  certificationStatus: 'not_started' | 'in_progress' | 'certified' | 'expired';
  dateAdded: string;
}

export interface ProductCheck {
  id: string;
  productName: string;
  licenceNumber?: string;
  isCode?: string;
  checkDate: string;
  result: 'verified' | 'warning' | 'error' | 'not_found';
}

export interface Complaint {
  id: string;
  type: 'quality' | 'fake_mark' | 'safety' | 'damaged' | 'other';
  description: string;
  productName: string;
  dateSubmitted: string;
  status: 'draft' | 'submitted' | 'in_review' | 'resolved';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    standards?: string[];
    confidence?: 'high' | 'medium' | 'low';
    sources?: string[];
    isWhitelistValid?: boolean;
  };
}

export interface WizardStep {
  id: number;
  title: string;
  description: string;
  isComplete: boolean;
  isActive: boolean;
}

export interface VerificationResult {
  status: 'verified' | 'warning' | 'error' | 'not_found';
  licenceNumber: string;
  isCode: string;
  productCategory: string;
  manufacturer: string;
  message: string;
  details: Record<string, string>;
}

export interface JudgeMetrics {
  hitAt3: number;
  mrrAt5: number;
  avgLatency: number;
  totalIndexed: number;
  verifiedCodes: number;
  hallucinationGuardStatus: 'active' | 'inactive';
  searchResults: {
    query: string;
    retrieved: string[];
    ranking: number[];
    evidence: string[];
    latency: number;
    whitelistValidated: boolean;
  }[];
}

export interface NavItem {
  label: string;
  path: string;
  icon?: string;
}
