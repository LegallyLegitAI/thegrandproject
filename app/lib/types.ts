
export type Page = 'landing' | 'healthCheck' | 'emailCapture' | 'results' | 'docStudio' | 'dashboard' | 'pricing' | 'calendar' | 'paymentSuccess' | 'about' | 'blogIndex' | 'blogPost' | 'terms' | 'privacy';

export type UserTier = 'free' | 'essentials' | 'pro';

export type Risk = {
  title: string;
  severity: 'High' | 'Medium' | 'Low' | 'Info';
  description: string;
  areaForReview: string;
  suggestedTemplate: string | null;
};

export type AppState = {
  currentPage: Page;
  currentProcess: 'subscribing' | 'purchasing' | null;
  isLoading: boolean;
  error: { type: string; message: string } | null;
  toasts: { id: number; message: string; type: 'success' | 'info' | 'error' }[];
  healthCheck: {
    currentStep: number;
    answers: Record<string, string>;
    isTransitioning: boolean;
  };
  emailCapture: {
    firstName: string;
    email: string;
  };
  emailGateCompleted: boolean;
  results: { score: number; risks: Risk[] } | null;
  disclaimerCheckboxChecked: boolean;
  legalModalView: 'terms' | 'privacy' | 'generationDisclaimer' | 'lawyerReviewPurchase' | null;
  upgradeModalView: 'docLimit' | 'featureGate' | null;
  userTier: UserTier;
  docStudio: {
    view: 'templates' | 'form' | 'preview' | 'review';
    selectedTemplate: string | null;
    formData: Record<string, string>;
    generatedDoc: string | null;
    isSaved: boolean;
    isSaving: boolean;
    savedDocs: { id: number; templateKey: string; name: string; date: string; content: string }[];
    contractReviewText: string;
    contractReviewResults: any[] | null;
  };
  calendar: {
    events: any[];
    isAdding: boolean;
    view: 'list' | 'month';
  };
  blog: {
    currentPostId: string | null;
  };
  isNavOpen: boolean;
  pricingPeriod: 'monthly' | 'annual';
};

export type Action =
  | { type: 'SET_PAGE'; payload: Page }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_NAV_OPEN'; payload: boolean }
  | { type: 'SET_HEALTH_CHECK_ANSWERS'; payload: Record<string, string> }
  | { type: 'SET_HEALTH_CHECK_STEP'; payload: number }
  | { type: 'SET_HEALTH_CHECK_TRANSITIONING'; payload: boolean }
  | { type: 'SET_RESULTS'; payload: AppState['results'] }
  | { type: 'SET_EMAIL_GATE_COMPLETED'; payload: AppState['emailCapture'] }
  | { type: 'SET_DOC_STUDIO_STATE'; payload: Partial<AppState['docStudio']> }
  | { type: 'SET_BLOG_STATE'; payload: Partial<AppState['blog']> }
  | { type: 'SET_PRICING_PERIOD'; payload: 'monthly' | 'annual' }
  | { type: 'SET_LEGAL_MODAL'; payload: AppState['legalModalView'] }
  | { type: 'SET_DISCLAIMER_CHECKED'; payload: boolean }
  | { type: 'SET_UPGRADE_MODAL'; payload: AppState['upgradeModalView'] }
  | { type: 'ADD_TOAST'; payload: AppState['toasts'][0] }
  | { type: 'REMOVE_TOAST'; payload: number }
  | { type: 'SET_CURRENT_PROCESS'; payload: AppState['currentProcess'] }
  | { type: 'SET_ERROR'; payload: AppState['error'] }
  | { type: 'SET_USER_TIER'; payload: UserTier }
  | { type: 'RESET_STATE' }
  | { type: 'HYDRATE_STATE'; payload: Partial<AppState> };
