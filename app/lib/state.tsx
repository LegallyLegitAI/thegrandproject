
"use client";

import { createContext, useReducer, useEffect, Dispatch, ReactNode, useContext } from 'react';
import { calendarEvents } from '@/app/components/data';
import { AppState, Action } from './types';

export const initialState: AppState = {
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
    emailCapture: {
        firstName: '',
        email: '',
    },
    emailGateCompleted: false,
    results: null,
    disclaimerCheckboxChecked: false,
    legalModalView: null,
    upgradeModalView: null,
    userTier: 'free',
    docStudio: {
        view: 'templates',
        selectedTemplate: null,
        formData: {},
        generatedDoc: null,
        isSaved: false,
        isSaving: false,
        savedDocs: [],
        contractReviewText: '',
        contractReviewResults: null,
    },
    calendar: {
        events: [],
        isAdding: false,
        view: 'list'
    },
    blog: {
        currentPostId: null,
    },
    isNavOpen: false,
    pricingPeriod: 'monthly',
};

function stateReducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'SET_PAGE':
            return { ...state, currentPage: action.payload, isNavOpen: false };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_NAV_OPEN':
            return { ...state, isNavOpen: action.payload };
        case 'SET_HEALTH_CHECK_ANSWERS':
            return { ...state, healthCheck: { ...state.healthCheck, answers: action.payload } };
        case 'SET_HEALTH_CHECK_STEP':
            return { ...state, healthCheck: { ...state.healthCheck, currentStep: action.payload } };
        case 'SET_HEALTH_CHECK_TRANSITIONING':
            return { ...state, healthCheck: { ...state.healthCheck, isTransitioning: action.payload } };
        case 'SET_RESULTS':
            return { ...state, results: action.payload };
        case 'SET_EMAIL_GATE_COMPLETED':
            return { ...state, emailGateCompleted: true, emailCapture: action.payload };
        case 'SET_DOC_STUDIO_STATE':
            return { ...state, docStudio: { ...state.docStudio, ...action.payload } };
        case 'SET_BLOG_STATE':
            return { ...state, blog: { ...state.blog, ...action.payload } };
        case 'SET_PRICING_PERIOD':
            return { ...state, pricingPeriod: action.payload };
        case 'SET_LEGAL_MODAL':
            return { ...state, legalModalView: action.payload, disclaimerCheckboxChecked: false };
        case 'SET_DISCLAIMER_CHECKED':
            return { ...state, disclaimerCheckboxChecked: action.payload };
        case 'SET_UPGRADE_MODAL':
            return { ...state, upgradeModalView: action.payload };
        case 'ADD_TOAST':
            return { ...state, toasts: [...state.toasts, action.payload] };
        case 'REMOVE_TOAST':
            return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
        case 'SET_CURRENT_PROCESS':
            return { ...state, currentProcess: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_USER_TIER':
            return {...state, userTier: action.payload };
        case 'RESET_STATE':
            return { ...initialState, emailCapture: state.emailCapture, calendar: { ...initialState.calendar, events: calendarEvents }};
        case 'HYDRATE_STATE':
            return { ...state, ...action.payload };
        default:
            return state;
    }
}

export const StateContext = createContext<{ state: AppState; dispatch: Dispatch<Action> }>({
    state: initialState,
    dispatch: () => null,
});

export const useStateContext = () => useContext(StateContext);

export const StateProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(stateReducer, initialState);

    useEffect(() => {
        try {
            const savedState = localStorage.getItem('legallyLegitAiState');
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                dispatch({
                    type: 'HYDRATE_STATE', payload: {
                        ...parsedState,
                        isLoading: false,
                        error: null,
                        isNavOpen: false,
                        currentProcess: null,
                        toasts: [],
                        calendar: { ...initialState.calendar, events: calendarEvents },
                    }
                });
            } else {
                 dispatch({ type: 'HYDRATE_STATE', payload: { calendar: { ...initialState.calendar, events: calendarEvents } }});
            }
        } catch (e) {
            console.error("Could not load state from localStorage", e);
            localStorage.removeItem('legallyLegitAiState');
        }
    }, []);

    useEffect(() => {
        try {
            const transientState = {
                isLoading: undefined, 
                error: undefined, 
                isNavOpen: undefined, 
                currentProcess: undefined, 
                toasts: undefined 
            };
            const stateToSave = { ...state, ...transientState };
            localStorage.setItem('legallyLegitAiState', JSON.stringify(stateToSave));
        } catch (e) {
            console.error("Could not save state to localStorage", e);
        }
    }, [state]);
    
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment');
        const cancelStatus = urlParams.get('status');

        if (paymentStatus === 'success') {
            dispatch({ type: 'SET_PAGE', payload: 'dashboard' });
            dispatch({ type: 'SET_USER_TIER', payload: state.currentProcess === 'purchasing' ? state.userTier : 'essentials' });
            dispatch({ type: 'ADD_TOAST', payload: { id: Date.now(), message: 'Welcome! Your purchase was successful.', type: 'success' } });
            dispatch({ type: 'SET_CURRENT_PROCESS', payload: null });
            window.history.replaceState({}, '', window.location.pathname);
        } else if (cancelStatus === 'cancelled') {
            dispatch({ type: 'ADD_TOAST', payload: { id: Date.now(), message: 'Your purchase was cancelled.', type: 'info' } });
            dispatch({ type: 'SET_PAGE', payload: 'pricing' });
            dispatch({ type: 'SET_CURRENT_PROCESS', payload: null });
            window.history.replaceState({}, '', window.location.pathname);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <StateContext.Provider value={{ state, dispatch }}>
            {children}
        </StateContext.Provider>
    );
};
