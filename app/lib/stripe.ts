import { Stripe, loadStripe } from '@stripe/stripe-js';

// This variable will hold the Stripe object once it's loaded.
// We store it in a variable outside the function to prevent reloading it on every call.
let stripePromise: Promise<Stripe | null>;

/**
 * A singleton function to get the Stripe.js instance.
 * This pattern ensures that we only load Stripe.js once per page load,
 * which is a performance best practice.
 *
 * @returns A promise that resolves to the Stripe object.
 */
export const getStripe = () => {
  // If the stripePromise doesn't exist yet, we create it.
  if (!stripePromise) {
    // process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is the standard way to
    // store your public Stripe key in a Next.js application.
    // You must add this key to your .env.local file.
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      throw new Error('Stripe publishable key is not set in your environment variables.');
    }
    
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};