// actions.ts
export const initiateCheckout = async (
  dispatch: Dispatch<Action>,
  priceId: string,
  mode: 'subscription' | 'payment',
  userEmail: string
) => {
  dispatch({ type: 'SET_CURRENT_PROCESS', payload: mode === 'subscription' ? 'subscribing' : 'purchasing' });

  try {
    const response = await fetch('/api/checkout-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, userEmail, mode }),
    });

    if (!response.ok) throw new Error(await response.text());

    const session = await response.json();

    window.location.href = session.url;  // Redirect to Stripe checkout
  } catch (error: any) {
    dispatch({ type: 'SET_CURRENT_PROCESS', payload: null });
    dispatch({ type: 'SET_ERROR', payload: { type: 'checkout', message: error.message } });
    showToast(dispatch, `Checkout Error: ${error.message}`, 'error');
  }
};
