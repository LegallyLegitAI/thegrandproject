"use client";

import { createContext, useReducer, useEffect, Dispatch, ReactNode, useContext } from 'react';
import { supabase } from './supabase';
import { Page, Risk, AppState, Doc, CalendarEvent } from './types';

// CORRECTED: Added all necessary action types your components were trying to use.
export type Action =
  | { type: 'SET_AUTH_STATE'; payload: { isAuthenticated: boolean; user: AppState['user'] } }
  | { type: 'LOGOUT' }
  | { type: 'SET_PAGE'; payload: Page }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RESULTS'; payload: { score: number; risks: Risk[] } }
  | { type: 'HYDRATE_STATE'; payload: Partial<AppState> }
  | { type: 'ANSWER_QUESTION'; payload: { questionId: string; answer: string } }
  | { type: 'SET_HEALTH_CHECK_STEP'; payload: number }
  | { type: 'SET_DOC_STUDIO_STATE'; payload: Partial<AppState['docStudio']> }
  | { type: 'SET_LEGAL_MODAL_VIEW'; payload: string | null }
  | { type: 'SET_UPGRADE_MODAL_VIEW'; payload: string | null }
  | { type: 'SET_PRICING_PERIOD'; payload: 'monthly' | 'annual' }
  | { type: 'SET_NAV_OPEN'; payload: boolean };

// The reducer function handles all state changes.
function stateReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_AUTH_STATE':
      return { ...state, isAuthenticated: action.payload.isAuthenticated, user: action.payload.user };
    case 'LOGOUT':
      return { ...initialState, pricingPeriod: state.pricingPeriod };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_RESULTS':
      return { ...state, results: action.payload };
    case 'HYDRATE_STATE':
        return { ...state, ...action.payload };
    case 'ANSWER_QUESTION':
      return { ...state, healthCheck: { ...state.healthCheck, answers: { ...state.healthCheck.answers, [action.payload.questionId]: action.payload.answer } } };
    case 'SET_HEALTH_CHECK_STEP':
      return { ...state, healthCheck: { ...state.healthCheck, currentStep: action.payload } };
    // ADDED: Reducer cases for the new actions.
    case 'SET_DOC_STUDIO_STATE':
        return { ...state, docStudio: { ...state.docStudio, ...action.payload } };
    case 'SET_LEGAL_MODAL_VIEW':
        return { ...state, legalModalView: action.payload };
    case 'SET_UPGRADE_MODAL_VIEW':
        return { ...state, upgradeModalView: action.payload };
    case 'SET_PRICING_PERIOD':
        return { ...state, pricingPeriod: action.payload };
    case 'SET_NAV_OPEN':
        return { ...state, isNavOpen: action.payload };
    default:
      return state;
  }
}

// CORRECTED: Ensured the initial state matches the AppState type exactly.
export const initialState: AppState = {
  isAuthenticated: false,
  user: null,
  currentPage: 'landing',
  isLoading: false,
  healthCheck: {
    currentStep: 0, // This is the fix for the "Loading..." issue.
    answers: {},
  },
  results: null,
  legalModalView: null,
  upgradeModalView: null,
  docStudio: {
    view: 'templates',
    selectedTemplate: null,
    generatedDoc: null,
    savedDocs: [],
    isSaved: false,
  },
  calendar: {
    events: [],
  },
  blog: {
    currentPostId: null,
  },
  isNavOpen: false,
  pricingPeriod: 'monthly',
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
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();

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
          // Load other user data here if needed
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        dispatch({ type: 'LOGOUT' });
      } else {
        checkUser();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
};
```typescript
// FILE 2: app/lib/actions.ts
// This file contains the functions that components call to change the state.
// I have added all the missing functions your components were trying to use.

import { AppState, Page, Risk } from './types';
import { Dispatch } from 'react';
import { getStripe } from './stripe';

// NOTE: The Action type is now defined in state.tsx, so we import it.
import { Action } from './state';

/**
 * Dispatches an action to change the current page in the application state.
 */
export const navigateTo = (dispatch: Dispatch<Action>, page: Page) => {
  dispatch({ type: 'SET_PAGE', payload: page });
};

/**
 * Handles the logic for answering a question in the health check.
 */
export const handleAnswerQuestion = (dispatch: Dispatch<Action>, state: AppState, questionId: string, answer: string, questions: any[]) => {
    dispatch({ type: 'ANSWER_QUESTION', payload: { questionId, answer } });

    const currentStep = state.healthCheck.currentStep;
    const totalQuestions = questions.length;

    if (currentStep < totalQuestions - 1) {
        dispatch({ type: 'SET_HEALTH_CHECK_STEP', payload: currentStep + 1 });
    } else {
        navigateTo(dispatch, 'results');
    }
};

/**
 * Initiates the Stripe checkout process.
 */
export const initiateCheckout = async (planId: string, userEmail: string) => {
  try {
    const response = await fetch('/checkout-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, userEmail }),
    });

    if (!response.ok) throw new Error('Failed to create checkout session.');

    const { sessionId } = await response.json();
    const stripe = await getStripe();
    
    if (stripe) {
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) console.error('Stripe redirect error:', error.message);
    } else {
      throw new Error('Stripe.js has not loaded yet.');
    }
  } catch (error) {
    console.error('Checkout initiation failed:', error);
  }
}
  