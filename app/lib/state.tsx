// app/lib/state.tsx
"use client";

import { createContext, useReducer, useEffect, Dispatch, ReactNode, useContext } from 'react';
import { createClient } from '@/app/lib/supabase';
import { User } from '@supabase/supabase-js';

// Update your AppState type to include auth
export interface AppState {
  // Auth state
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    fullName: string;
    companyName: string;
    tier: 'free' | 'essentials' | 'pro';
  } | null;
  
  // Keep your existing state properties
  currentPage: Page;
  currentProcess: 'subscribing' | 'purchasing' | null;
  isLoading: boolean;
  error: { type: string; message: string } | null;
  toasts: { id: number; message: string; type: 'success' | 'info' | 'error' }[];
  
  // Update these to work with database
  healthCheck: {
    currentStep: number;
    answers: Record<string, string>;
    isTransitioning: boolean;
    savedResults?: any; // From database
  };
  
  // Remove emailGateCompleted - use isAuthenticated instead
  results: { score: number; risks: Risk[] } | null;
  
  // Keep rest of your state...
  disclaimerCheckboxChecked: boolean;
  legalModalView: string | null;
  upgradeModalView: string | null;
  docStudio: any;
  calendar: any;
  blog: any;
  isNavOpen: boolean;
  pricingPeriod: 'monthly' | 'annual';
}

// Add auth action types
export type Action = 
  | { type: 'SET_AUTH_STATE'; payload: { isAuthenticated: boolean; user: AppState['user'] } }
  | { type: 'LOGOUT' }
  // ... your existing actions
  | { type: 'SET_PAGE'; payload: Page }
  | { type: 'SET_LOADING'; payload: boolean }
  // etc...

// Updated reducer
function stateReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_AUTH_STATE':
      return { 
        ...state, 
        isAuthenticated: action.payload.isAuthenticated,
        user: action.payload.user 
      };
      
    case 'LOGOUT':
      // Clear sensitive data but keep preferences
      return { 
        ...initialState,
        pricingPeriod: state.pricingPeriod 
      };
      
    // Your existing cases...
    default:
      return state;
  }
}

// Initial state
export const initialState: AppState = {
  isAuthenticated: false,
  user: null,
  currentPage: 'landing',
  currentProcess: null,
  isLoading: false,
  error: null,
  toasts: [],
  healthCheck: {
    currentStep: 0,
    answers: {},
    isTransitioning: false,
  },
  results: null,
  disclaimerCheckboxChecked: false,
  legalModalView: null,
  upgradeModalView: null,
  docStudio: {
    view: 'templates',
    selectedTemplate: null,
    formData: {},
    generatedDoc: null,
    savedDocs: [], // Will load from database
    contractReviewText: '',
    contractReviewResults: null,
  },
  calendar: {
    events: [], // Will load from database
    isAdding: false,
    view: 'list'
  },
  blog: {
    currentPostId: null,
  },
  isNavOpen: false,
  pricingPeriod: 'monthly',
};

export const StateContext = createContext<{ 
  state: AppState; 
  dispatch: Dispatch<Action> 
}>({
  state: initialState,
  dispatch: () => null,
});

export const useStateContext = () => useContext(StateContext);

// Enhanced State Provider with Auth
export const StateProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(stateReducer, initialState);
  const supabase = createClient();

  // Check auth on mount
  useEffect(() => {
    checkUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkUser();
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user data from database
  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get full user profile from database
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          dispatch({
            type: 'SET_AUTH_STATE',
            payload: {
              isAuthenticated: true,
              user: {
                id: user.id,
                email: user.email!,
                fullName: profile.full_name || '',
                companyName: profile.company_name || '',
                tier: profile.subscription_tier || 'free'
              }
            }
          });
          
          // Load user's saved data
          loadUserData(user.id);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  // Load user data from database
  const loadUserData = async (userId: string) => {
    try {
      // Load saved documents
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (documents) {
        dispatch({
          type: 'HYDRATE_STATE',
          payload: {
            docStudio: {
              ...state.docStudio,
              savedDocs: documents.map(doc => ({
                id: doc.id,
                templateKey: doc.template_key,
                name: doc.name,
                date: new Date(doc.created_at).toLocaleDateString('en-AU'),
                content: doc.content
              }))
            }
          }
        });
      }
      
      // Load calendar events
      const { data: events } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });
        
      if (events) {
        dispatch({
          type: 'HYDRATE_STATE',
          payload: {
            calendar: {
              ...state.calendar,
              events: events.map(e => ({
                id: e.id,
                title: e.title,
                date: e.date,
                category: e.category,
                completed: e.completed
              }))
            }
          }
        });
      }
      
      // Load latest health check
      const { data: healthCheck } = await supabase
        .from('health_checks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (healthCheck) {
        dispatch({
          type: 'SET_RESULTS',
          payload: {
            score: healthCheck.score,
            risks: healthCheck.risks
          }
        });
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Don't save auth state to localStorage
  useEffect(() => {
    // Only save non-sensitive preferences
    const prefsToSave = {
      pricingPeriod: state.pricingPeriod,
      currentPage: state.currentPage,
    };
    
    localStorage.setItem('legallyLegitPrefs', JSON.stringify(prefsToSave));
  }, [state.pricingPeriod, state.currentPage]);

  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
};
