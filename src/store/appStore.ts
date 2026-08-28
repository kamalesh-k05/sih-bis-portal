import { create } from 'zustand';
import type { UserType, Language, ChatMessage } from '../types';

interface AppState {
  // User state
  userType: UserType;
  setUserType: (type: UserType) => void;
  
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  
  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  
  // Wizard
  wizardStep: number;
  setWizardStep: (step: number) => void;
  productDescription: string;
  setProductDescription: (desc: string) => void;
  
  // Search results
  isSearching: boolean;
  setIsSearching: (v: boolean) => void;
  searchResults: any[];
  setSearchResults: (results: any[]) => void;
  
  // Verification
  verificationResult: any;
  setVerificationResult: (result: any) => void;
  
  // UI
  showAssistant: boolean;
  toggleAssistant: () => void;
  showJudgeDemo: boolean;
  toggleJudgeDemo: () => void;
  
  // Checklist
  checklist: Record<string, boolean>;
  toggleChecklistItem: (id: string) => void;
  resetChecklist: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // User
  userType: null,
  setUserType: (type) => set({ userType: type }),
  
  // Language
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  
  // Chat
  chatMessages: [],
  addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  clearChat: () => set({ chatMessages: [] }),
  
  // Wizard
  wizardStep: 0,
  setWizardStep: (step) => set({ wizardStep: step }),
  productDescription: '',
  setProductDescription: (desc) => set({ productDescription: desc }),
  
  // Search
  isSearching: false,
  setIsSearching: (v) => set({ isSearching: v }),
  searchResults: [],
  setSearchResults: (results) => set({ searchResults: results }),
  
  // Verification
  verificationResult: null,
  setVerificationResult: (result) => set({ verificationResult: result }),
  
  // UI
  showAssistant: false,
  toggleAssistant: () => set((state) => ({ showAssistant: !state.showAssistant })),
  showJudgeDemo: false,
  toggleJudgeDemo: () => set((state) => ({ showJudgeDemo: !state.showJudgeDemo })),
  
  // Checklist
  checklist: {},
  toggleChecklistItem: (id) => set((state) => ({
    checklist: { ...state.checklist, [id]: !state.checklist[id] }
  })),
  resetChecklist: () => set({ checklist: {} }),
}));
