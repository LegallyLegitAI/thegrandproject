"use client";

import { createContext, useReducer, useEffect, Dispatch, ReactNode, useContext } from 'react';
import { supabase } from './supabase'; // ✅ Uses the configured client
import { User } from '@supabase/supabase-js';

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
  currentProcess: 'subscribing' | 'purchasing' | null;
  isLoading: boolean;
  error: { type: string; message: string } | null;
  toasts: { id: number; message: string; type: 'success' | 'info' | 'error' }[];

  healthCheck: {
    currentStep: number;
    answers: Record<string, string>;
    isTransitioning: boolean;
    savedResults?: any;
  };

  results: { score: number; risks: Risk[] } | null;
  disclaimerCheckboxChecked: boolean;
  legalModalView: string | null;
  upgradeModalView: string | null;
  docStudio: any;
  calendar: any;
  blog: any;
  isNavOpen: boolean;
  pricingPeriod: 'monthly' | 'annual';
}

export type Action =
  | { type: 'SET_AUTH_STATE'; payload: { isAuthenticated: boolean; user: AppState['user'] } }
  | { type: 'LOGOUT' }
  | { type: 'SET_PAGE'; payload: Page }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RESULTS'; payload: { score: number; risks: Risk[] } }
  | { type: 'HYDRATE_STATE'; payload: Partial<AppState> };

function stateReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_AUTH_STATE':
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        user: action.payload.user
      };
    case 'LOGOUT':
      return {
        ...initialState,
        pricingPeriod: state.pricingPeriod
      };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_RESULTS':
      return { ...state, results: action.payload };
    case 'HYDRATE_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

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
    isTransitioning: false
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
    savedDocs: [],
    contractReviewText: '',
    contractReviewResults: null
  },
  calendar: {
    events: [],
    isAdding: false,
    view: 'list'
  },
  blog: {
    currentPostId: null
  },
  isNavOpen: false,
  pricingPeriod: 'monthly'
};

export const StateContext = createContext<{
  state: AppState;
  dispatch: Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null
});

export const useStateContext = () => useContext(StateContext);

export const StateProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(stateReducer, initialState);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkUser();
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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

        await loadUserData(user.id);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      const { data: events } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      const { data: healthCheck } = await supabase
        .from('health_checks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      dispatch({
        type: 'HYDRATE_STATE',
        payload: {
          docStudio: {
            ...state.docStudio,
            savedDocs: documents?.map(doc => ({
              id: doc.id,
              templateKey: doc.template_key,
              name: doc.name,
              date: new Date(doc.created_at).toLocaleDateString('en-AU'),
              content: doc.content
            })) || []
          },
          calendar: {
            ...state.calendar,
            events: events?.map(e => ({
              id: e.id,
              title: e.title,
              date: e.date,
              category: e.category,
              completed: e.completed
            })) || []
          }
        }
      });

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

  useEffect(() => {
    const prefs = {
      pricingPeriod: state.pricingPeriod,
      currentPage: state.currentPage
    };
    localStorage.setItem('legallyLegitPrefs', JSON.stringify(prefs));
  }, [state.pricingPeriod, state.currentPage]);

  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
};
