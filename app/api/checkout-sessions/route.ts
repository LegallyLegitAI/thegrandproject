
import Stripe from 'stripe';
import { NextResponse } from 'next/server';

// Initialize Stripe with the API key from environment variables.
const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2025-06-30.basil',
});

// This is the URL of your application, which is needed by Stripe to redirect
// the user back to your site after payment.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// This function handles POST requests to the /api/checkout-sessions endpoint.
export async function POST(req: Request) {
  try {
    const { priceId, userEmail, mode } = await req.json();

    if (!priceId || !userEmail) {
      return new NextResponse('Missing priceId or userEmail', { status: 400 });
    }

    // Create a new checkout session with Stripe.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      // The mode can be 'subscription' for recurring plans or 'payment' for one-off purchases.
      mode: mode || 'subscription',
      customer_email: userEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Define the URLs for successful and canceled payments.
      success_url: `${siteUrl}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}?status=cancelled`,
    });

    // Return the session URL to the client. The client will then redirect the user.
    return NextResponse.json({ url: session.url });

  } catch (err: any) {
    console.error('Error creating Stripe checkout session:', err);
    return new NextResponse(`Internal Server Error: ${err.message}`, { status: 500 });
  }
}
