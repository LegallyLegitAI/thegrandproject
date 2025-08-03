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
  | { type: 'SET_HEALTH_CHECK_STEP'; payload: number };


// --- MISSING FUNCTIONS ---

/**
 * Dispatches an action to change the current page in the application state.
 * This is used for client-side navigation without a full page reload.
 * @param dispatch - The dispatch function from your state context.
 * @param page - The name of the page to navigate to.
 */
export const navigateTo = (dispatch: Dispatch<Action>, page: Page) => {
  dispatch({ type: 'SET_PAGE', payload: page });
};

/**
 * Initiates the Stripe checkout process.
 * This function calls a server-side route to create a Stripe checkout session
 * and then redirects the user to the Stripe payment page.
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
        // You could show an error message to the user here.
      }
    } else {
        throw new Error('Stripe.js has not loaded yet.');
    }

  } catch (error) {
    console.error('Checkout initiation failed:', error);
    // Handle the error, e.g., show a notification to the user.
  }
};
