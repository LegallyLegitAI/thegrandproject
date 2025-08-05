// lib/state.ts
export type User = {
  id: string;
  email: string;
  businessName: string;
  subscriptionStatus: 'active' | 'trialing' | 'past_due' | 'canceled';
  riskScore: number;
};

export type State = {
  currentPage: string;
  user: User | null;
  onboardingStep: number;
  // ... other state
};

// Add auth actions to reducer
case 'LOGIN':
  return { ...state, user: action.payload };
case 'LOGOUT':
  return { ...state, user: null };