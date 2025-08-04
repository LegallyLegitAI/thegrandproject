export type Page =
  | 'landing'
  | 'healthCheck'
  | 'results'
  | 'dashboard'
  | 'about'
  | 'pricing'
  | 'blog'
  | 'calendar'
  | 'terms'
  | 'privacy';

export interface Risk {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendation: string;
  relevantTemplates: string[];
}

// ADDED: The missing Doc type definition
export interface Doc {
    id: string;
    name: string;
    date: string;
    templateKey: string;
    content: any; // Or a more specific type for your document content
}

// ADDED: The missing CalendarEvent type definition
export interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    category: string;
    completed: boolean;
}

// This is now the single source of truth for your application's state.
export interface AppState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    fullName: string;
    companyName: string;
    tier: 'free' | 'essentials' | 'pro';
  } | null;
  currentPage: Page;
  isLoading: boolean;
  healthCheck: {
    currentStep: number;
    answers: Record<string, string>;
    isTransitioning: boolean;
  };
  results: { score: number; risks: Risk[] } | null;
  legalModalView: 'terms' | 'privacy' | 'generationDisclaimer' | 'lawyerReviewPurchase' | null;
  upgradeModalView: 'docLimit' | 'featureGate' | null;
  docStudio: {
    view: 'templates' | 'editor'; // Simplified from your original for clarity
    selectedTemplate: string | null;
    generatedDoc: any | null;
    savedDocs: Doc[];
    isSaved: boolean;
  };
  calendar: {
    events: CalendarEvent[];
  };
  blog: {
    currentPostId: string | null;
  };
  isNavOpen: boolean;
  pricingPeriod: 'monthly' | 'annual';
}