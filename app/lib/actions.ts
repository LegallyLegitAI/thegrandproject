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
};