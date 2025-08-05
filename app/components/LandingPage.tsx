"use client";

import { useStateContext } from '@/app/lib/state';
import { navigateTo } from '@/app/lib/actions';
import { Button } from './common';
import { faqData } from './data'; // <-- ADDED THIS IMPORT

export default function LandingPage() {
    const { dispatch } = useStateContext();
    const handleStartHealthCheck = () => navigateTo(dispatch, 'healthCheck');

    return (
        <div className="landing-container">
            <header className="hero-section">
                <h1 className="hero-title">Stop Guessing. Start Complying.</h1>
                <p className="hero-subtitle">The intelligent legal shield for Australian businesses. Answer a few questions and get a free, instant analysis of your legal risks.</p>
                <Button onClick={handleStartHealthCheck} variant="primary">
                    Start My Free Health Check
                </Button>
            </header>

            <section className="trust-bar">
                <h2 className="trust-title">Trusted by Australian Founders & Entrepreneurs</h2>
                {/* You can add logos of partners or testimonials here */}
            </section>

            <section className="features-section">
                <div className="feature-card">
                    <h3>Identify Risks</h3>
                    <p>Our intelligent health check pinpoints your specific legal vulnerabilities based on your business type and stage.</p>
                </div>
                <div className="feature-card">
                    <h3>Generate Documents</h3>
                    <p>Create lawyer-vetted, compliant legal documents in minutes with our AI-powered document studio.</p>
                </div>
                <div className="feature-card">
                    <h3>Stay Compliant</h3>
                    <p>Receive automated alerts and updates when laws change that affect your business and your documents.</p>
                </div>
            </section>

            <div className="card" style={{ marginTop: '3rem' }}>
                <h2 className="trust-title">Frequently Asked Questions</h2>
                {faqData.map((faq, index) => (
                    <details key={index} className="faq-item">
                        <summary>{faq.question}</summary>
                        <p>{faq.answer}</p>
                    </details>
                ))}
            </div>
        </div>
    );
}
