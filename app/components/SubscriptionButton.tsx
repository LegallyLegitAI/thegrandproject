// components/SubscriptionButton.tsx
export default function SubscriptionButton() {
  const createCheckoutSession = async () => {
    const { data } = await supabase.auth.getSession();
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: data.session?.user.id })
    });
    
    const { sessionId } = await res.json();
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);
    await stripe?.redirectToCheckout({ sessionId });
  };

  return (
    <button onClick={createCheckoutSession} className="btn btn-primary">
      Subscribe Now - $49/month AUD
    </button>
  );
}