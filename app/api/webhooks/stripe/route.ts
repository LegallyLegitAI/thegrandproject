
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const ADDON_PRICE_ID_MAP: Record<string, string> = {
  'price_1PgUCTBEDy5Vv4C77p8C78Ga': 'lawyerReview'
};

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          status: Stripe.Subscription.Status | null;
          price_id: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          current_period_end: string | null;
        };
        Insert: {
          id?: string
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          status: Stripe.Subscription.Status | null;
          price_id?: string | null;
          current_period_end?: string | null;
        };
        Update: {
          status?: Stripe.Subscription.Status | null;
          price_id?: string | null;
          current_period_end?: string | null;
        };
        Relationships: []
      };
      purchases: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          product_id: string | null;
          price_id: string | null;
          purchase_date: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id: string | null;
          product_id?: string | null;
          price_id?: string | null;
          purchase_date?: string | null;
        };
        Update: {};
        Relationships: []
      };
    };
    Views: { [_: string]: never };
    Functions: { [_: string]: never };
    Enums: { [_: string]: never };
    CompositeTypes: { [_: string]: never };
  };
};

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function findOrCreateUser(supabase: any, email: string): Promise<string> {
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;
    
    const existingUser = users.find(u => u.email === email);
    if (existingUser) return existingUser.id;

    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: `password-${randomUUID()}`,
        email_confirm: true, 
    });
    if (createError) throw createError;
    if (!user) throw new Error("Supabase user creation failed.");
    return user.id;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('Stripe-Signature') as string;

  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      if (!session.customer_details?.email || !session.customer) {
        return new NextResponse('Webhook Error: Missing required session data.', { status: 400 });
      }

      const customerEmail = session.customer_details.email;
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
      
      try {
        const userId = await findOrCreateUser(supabase, customerEmail);

        if (session.mode === 'subscription') {
            const stripeSubscriptionId = session.subscription as string;
            if (!stripeSubscriptionId) return new NextResponse('Webhook Error: Subscription mode missing subscription ID.', { status: 400 });
            
            const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

            const { error } = await supabase.from('subscriptions').insert({
                user_id: userId,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscription.id,
                status: subscription.status,
                price_id: subscription.items.data[0]?.price.id ?? null,
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            });
            if (error) throw error;
            console.log(`✅ Subscription created for user ${userId}`);

        } else if (session.mode === 'payment') {
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
            const priceId = lineItems.data[0]?.price?.id;
            const productId = priceId ? ADDON_PRICE_ID_MAP[priceId] || 'unknown_product' : 'unknown_product';

            const { error } = await supabase.from('purchases').insert({
                user_id: userId,
                stripe_customer_id: customerId,
                product_id: productId,
                price_id: priceId ?? null,
                purchase_date: new Date().toISOString()
            });
            if (error) throw error;
            console.log(`✅ One-time purchase recorded for user ${userId}`);
        }
      } catch (err: any) {
        console.error('Webhook handler failed for checkout.session.completed:', err.message);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            price_id: subscription.items.data[0]?.price.id ?? null,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
      if (error) {
        console.error(`Webhook subscription update failed: ${error.message}`);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
      }
      console.log(`✅ Subscription updated: ${subscription.id}`);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
       const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id);
      if (error) {
        console.error(`Webhook subscription deletion failed: ${error.message}`);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
      }
      console.log(`✅ Subscription deleted: ${subscription.id}`);
      break;
    }
  }

  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
}
