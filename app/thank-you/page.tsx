// /app/thank-you/page.tsx
export default function ThankYou() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Thank you for your purchase!</h1>
      <p>Your subscription is active. You can now access all features.</p>
      <a href="/" style={{ color: '#0070f3', textDecoration: 'underline' }}>
        Go to Dashboard
      </a>
    </div>
  );
}
