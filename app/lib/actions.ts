
import { AppState, Page, Risk } from './types';
import { Dispatch } from 'react';
import { getStripe } from './stripe';
import { Action } from './state';

export const navigateTo = (dispatch: Dispatch<Action>, page: Page) => {
  dispatch({ type: 'SET_PAGE', payload: page });
};

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
      await stripe.redirectToCheckout({ sessionId });
    } else {
      throw new Error('Stripe.js has not loaded yet.');
    }
  } catch (error) {
    console.error('Checkout initiation failed:', error);
  }
};

// --- ADDED MISSING FUNCTIONS ---

export const showToast = (dispatch: Dispatch<Action>, message: string, type: 'success' | 'error' | 'info' = 'info') => {
  // In a real app, you would dispatch an action to add a toast to the state.
  console.log(`TOAST: [${type}] ${message}`);
  alert(`TOAST: [${type}] ${message}`);
};

export const handleDownloadPdf = () => {
  console.log('Placeholder for PDF download logic.');
  alert('Downloading PDF...');
};

export const handleGenerateDocument = () => {
  console.log('Placeholder for document generation logic.');
  alert('Generating document...');
};

export const handleGetRiskAnalysis = () => {
    console.log('Placeholder for risk analysis logic.');
    alert('Getting risk analysis...');
};