"use client";

import { createContext, useReducer, useEffect, Dispatch, ReactNode, useContext } from 'react';
import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';
import { Page, Risk, AppState } from './types';

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
  | { type: 'SET_LEGAL_MODAL_VIEW'; payload: AppState['legalModalView'] }
  | { type: 'SET_UPGRADE_MODAL_VIEW'; payload: AppState['upgradeModalView'] }
  | { type: 'SET_PRICING_PERIOD'; payload: 'monthly' | 'annual' }
  | { type: 'SET_NAV_OPEN'; payload: boolean }
  | { type: 'ADD_TOAST'; payload: { message: string; type: 'success' | 'error' | 'info' } };

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
      return { ...state, healthCheck: { ...state.healthCheck, currentStep: action.payload, isTransitioning: false } };
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

export const initialState: AppState = {
  isAuthenticated: false,
  user: null,
  currentPage: 'landing',
  isLoading: false,
  healthCheck: {
    currentStep: 0,
    answers: {},
    isTransitioning: false,
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
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
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

  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
};