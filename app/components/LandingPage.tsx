
"use client";
import React from 'react';
import { useStateContext } from '@/app/lib/state';
import { navigateTo } from '@/app/lib/actions';
import { faqData } from './data';
import { Icon } from './Icon';

function SecurityBadges() {
    return (
        <div className="security-badges">
            <span><Icon name="lock" /> Secured by Stripe</span>
            <span>•</span>
            <span><Icon name="dashboard" /> Data Stored in Australia</span>
        </div>
    );
}

function TrustSignals() {
    return (
        <div className="trust-signals-section">
            <h2 className="trust-title">Trusted by Australian Businesses Like Yours</h2>
            <div className="trust-logos">
                <span className="logo-label">As Mentioned In</span>
                <span className="logo-text">SmartCompany</span>
                <span className="logo-text">Kochie's Business Builders</span>
                <span className="logo-text">Dynamic Business</span>
            </div>
            <div className="testimonials-grid">
                <div className="card testimonial-card">
                    <p className="testimonial-text">"Legally Legit AI helped me create an employment contract in 10 minutes that was quoted at $800 by a lawyer. A no-brainer for my cafe."</p>
                    <p className="testimonial-author">Sarah J., Owner, The Grumpy Barista, Melbourne</p>
                </div>
                <div className="card testimonial-card">
                    <p className="testimonial-text">"The legal health check was a real eye-opener. It pinpointed exactly where we were exposed. The subscription is worth every cent for the peace of mind."</p>
                    <p className="testimonial-author">David L., Director, BuildRight Constructions, Sydney</p>
                </div>
            </div>
            <p className="social-proof">Join 1,000+ Aussie businesses who have uncovered critical compliance gaps.</p>
        </div>
    );
}

export default function LandingPage() {
    const { dispatch } = useStateContext();
    const handleStartHealthCheck = () => navigateTo(dispatch, 'healthCheck');

    return (
        <div className="landing-container">
            <h1>Avoid Costly Fines. Get Your Free Legal Risk Score.</h1>
            <p className="subtitle">Is your business legally protected? Our AI-powered health check analyzes your top risks in under 5 minutes. No credit card required.</p>
            <button className="btn btn-primary" onClick={handleStartHealthCheck}>
                Start Free Health Check <Icon name="arrowRight" />
            </button>
            <SecurityBadges />
            <div className="flywheel" style={{ marginTop: '3rem' }}>
                <div className="flywheel-step">
                    <div className="flywheel-icon"><Icon name="diagnose" /></div>
                    <h3>1. Diagnose</h3>
                    <p>Take our quick 12-question quiz to instantly identify your business's key legal vulnerabilities.</p>
                </div>
                <div className="flywheel-step">
                    <div className="flywheel-icon"><Icon name="equip" /></div>
                    <h3>2. Equip</h3>
                    <p>Generate essential legal documents like contracts and policies, tailored to your needs.</p>
                </div>
                <div className="flywheel-step">
                    <div className="flywheel-icon"><Icon name="monitor" /></div>
                    <h3>3. Monitor</h3>
                    <p>Stay on top of critical compliance dates and legal updates with our smart calendar and alerts.</p>
                </div>
            </div>
            <TrustSignals />
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
