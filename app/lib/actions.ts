import { AppState, Page, Risk } from './types';
import { Dispatch } from 'react';
import { getStripe } from './stripe';

// This is the type definition for all possible actions in your app's state.
export type Action =
  | { type: 'SET_AUTH_STATE'; payload: { isAuthenticated: boolean; user: AppState['user'] } }
  | { type: 'LOGOUT' }
  | { type: 'SET_PAGE'; payload: Page }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RESULTS'; payload: { score: number; risks: Risk[] } }
  | { type: 'HYDRATE_STATE'; payload: Partial<AppState> }
  | { type: 'ANSWER_QUESTION'; payload: { questionId: string; answer: string } }
  | { type: 'SET_HEALTH_CHECK_STEP'; payload: number }
  | { type: 'SET_DOC_STUDIO_STATE'; payload: Partial<AppState['docStudio']> }; // <-- ADDED THIS LINE


// --- ACTION FUNCTIONS ---

/**
 * Dispatches an action to change the current page in the application state.
 * @param dispatch - The dispatch function from your state context.
 * @param page - The name of the page to navigate to.
 */
export const navigateTo = (dispatch: Dispatch<Action>, page: Page) => {
  dispatch({ type: 'SET_PAGE', payload: page });
};

/**
 * Handles the logic for answering a question in the health check.
 * It records the answer and advances the user to the next step or the results page.
 * @param dispatch - The dispatch function from your state context.
 * @param state - The current application state.
 * @param questionId - The ID of the question being answered.
 * @param answer - The user's selected answer.
 * @param questions - The full array of questions.
 */
export const handleAnswerQuestion = (dispatch: Dispatch<Action>, state: AppState, questionId: string, answer: string, questions: any[]) => {
    // Dispatch the action to save the answer
    dispatch({ type: 'ANSWER_QUESTION', payload: { questionId, answer } });

    // Logic to advance to the next question or finish
    const currentStep = state.healthCheckStep;
    const totalQuestions = questions.length;

    if (currentStep < totalQuestions - 1) {
        // Go to the next question
        dispatch({ type: 'SET_HEALTH_CHECK_STEP', payload: currentStep + 1 });
    } else {
        // All questions answered, go to results page
        navigateTo(dispatch, 'results');
    }
};


/**
 * Initiates the Stripe checkout process.
 * @param planId - The ID of the pricing plan the user is purchasing.
 * @param userEmail - The email of the user for the checkout session.
 */
export const initiateCheckout = async (planId: string, userEmail: string) => {
  try {
    const response = await fetch('/checkout-sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ planId, userEmail }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session.');
    }

    const { sessionId } = await response.json();
    const stripe = await getStripe();
    
    if (stripe) {
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        console.error('Stripe redirect error:', error.message);
      }
    } else {
        throw new Error('Stripe.js has not loaded yet.');
    }

  } catch (error) {
    console.error('Checkout initiation failed:', error);
  }
};