
"use client";
import React, { useEffect } from 'react';
import { useStateContext } from '@/app/lib/state';
import { navigateTo, handleGetRiskAnalysis } from '@/app/lib/actions';
import { Icon } from './Icon';

export function EmailCapture() {
    const { state, dispatch } = useStateContext();

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'SET_EMAIL_GATE_COMPLETED', payload: state.emailCapture });
        handleGetRiskAnalysis(dispatch, state.healthCheck.answers);
    };
    
    return (
        <div className="card email-capture-container">
            <div className="wizard-header">
                <h2>Almost There!</h2>
                <p>Enter your details to unlock your full, personalized risk report and action plan.</p>
            </div>
            <form className="email-capture-form" onSubmit={handleEmailSubmit}>
                <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input type="text" id="firstName" name="firstName" required value={state.emailCapture.firstName} onChange={(e) => dispatch({ type: 'HYDRATE_STATE', payload: { emailCapture: { ...state.emailCapture, firstName: e.target.value } } })} />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input type="email" id="email" name="email" required value={state.emailCapture.email} onChange={(e) => dispatch({ type: 'HYDRATE_STATE', payload: { emailCapture: { ...state.emailCapture, email: e.target.value } } })} />
                </div>
                <button className="btn btn-primary" type="submit">Unlock My Full Report <Icon name="lock" /></button>
                <p className="privacy-note">We respect your privacy. Read our <a href="#" onClick={(e) => { e.preventDefault(); navigateTo(dispatch, 'privacy') }}>Privacy Policy</a>.</p>
            </form>
        </div>
    );
}

function LoadingScreen({ message = 'Loading...', subtext = null }: { message?: string, subtext?: string | null }) {
    return (
        <div className="loading-container" aria-live="polite">
            <div className="spinner" />
            <p className="loading-text">{message}</p>
            {subtext && <p className="subtle-text">{subtext}</p>}
        </div>
    );
}

export default function ResultsPage() {
    const { state, dispatch } = useStateContext();

    const handleStartHealthCheck = () => navigateTo(dispatch, 'healthCheck');
    const handleSelectTemplate = (templateKey: string) => {
        dispatch({ type: 'SET_DOC_STUDIO_STATE', payload: { view: 'form', selectedTemplate: templateKey } });
        navigateTo(dispatch, 'docStudio');
    };
    
    // Redirect to health check if there are no answers to generate results from.
    useEffect(() => {
        if (Object.keys(state.healthCheck.answers).length === 0 && !state.results) {
            navigateTo(dispatch, 'healthCheck');
        }
    }, [state.healthCheck.answers, state.results, dispatch]);


    if (state.isLoading) {
        return <LoadingScreen message="Analyzing your risks..." subtext="Our AI is reviewing your answers to create your personalized report." />;
    }
    
    if (state.error && state.error.type === 'api') {
        return (
            <div className="card error-message">
                <h2>API Error</h2>
                <p>{`There was an issue generating your report: ${state.error.message}`}</p>
                <button className="btn btn-secondary" onClick={handleStartHealthCheck}>Try Again</button>
            </div>
        );
    }
    
    if (!state.results) {
         return <LoadingScreen message="Preparing results..." />;
    }

    const { score, risks } = state.results;

    return (
        <div className="results-container">
            <div className="results-header card">
                <div className="score-circle" style={{ background: `linear-gradient(145deg, ${score > 70 ? 'var(--success-color)' : score > 40 ? 'var(--accent-gold)' : 'var(--error-color)'}, ${score > 70 ? '#388e3c' : score > 40 ? '#f59e0b' : '#c62828'})` }}>
                    <span className="score-value">{score}</span>
                    <span className="score-label">Risk Score</span>
                </div>
                <h2>Your Personalized Risk Report</h2>
                <p className="results-summary">
                    Here are the key legal risks we identified for your business, prioritized by severity. Use this as a guide to start strengthening your legal foundations.
                </p>
            </div>
            <ul className="risk-list">
                {risks.map((risk, index) => (
                    <li key={index} className="card risk-card stagger-fade-in" style={{ animationDelay: `${index * 100}ms` }} data-severity={risk.severity}>
                        <div className="risk-card-header">
                            <h4>{risk.title}</h4>
                            <span className="severity-badge" data-severity={risk.severity}>{risk.severity}</span>
                        </div>
                        <p>{risk.description}</p>
                        {risk.areaForReview && (
                            <div className="risk-actions">
                                <p><strong>Area for Review: </strong>{risk.areaForReview}</p>
                                {risk.suggestedTemplate && <button className="btn btn-secondary btn-small no-full-width" onClick={() => handleSelectTemplate(risk.suggestedTemplate!)}>Fix This <Icon name="arrowRight" /></button>}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
            <div className="card unlock-cta-container" style={{marginTop: '2rem'}}>
                <h3>Ready to Take Action?</h3>
                <p>Use your report as a guide and head to the Document Studio to create the contracts and policies you need.</p>
                <button className="btn btn-primary" onClick={() => navigateTo(dispatch, 'docStudio')}>Go to Document Studio <Icon name="arrowRight" /></button>
            </div>
        </div>
    );
}
