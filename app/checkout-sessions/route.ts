// /pages/api/checkout-sessions.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { priceId, userEmail, mode } = req.body;

  if (!priceId || !userEmail || !mode) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const YOUR_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: mode, // 'subscription' or 'payment'
      customer_email: userEmail,
      success_url: `${YOUR_BASE_URL}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_BASE_URL}/pricing`,
    });

    res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ error: error.message });
  }
}
