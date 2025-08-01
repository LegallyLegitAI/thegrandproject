
"use client";

import React from 'react';
import { useStateContext } from '@/app/lib/state';
import { handleGenerateDocument } from '@/app/lib/actions';
import { LEGAL_TERMS_CONTENT_HTML, LEGAL_PRIVACY_CONTENT_HTML } from './data';
import { Icon } from './Icon';

export function LegalModal() {
    const { state, dispatch } = useStateContext();
    const { legalModalView, disclaimerCheckboxChecked } = state;

    if (!legalModalView) return null;

    const closeLegalModal = () => dispatch({ type: 'SET_LEGAL_MODAL', payload: null });

    const handleAcceptGenerationDisclaimer = (e: React.MouseEvent) => {
        e.preventDefault();
        closeLegalModal();
        handleGenerateDocument(dispatch, state);
    };

    let title, content, footer;

    switch(legalModalView) {
        case 'generationDisclaimer':
            title = 'Important Disclaimer';
            content = (
                <div>
                    <h5>AI-Generated Documents Require Review</h5>
                    <p>The document you are about to generate is created by AI based on a template. It is for informational purposes only and is not a substitute for legal advice.</p>
                    <p><strong>You MUST have this document reviewed by a qualified, independent lawyer before you use it.</strong></p>
                    <p>By continuing, you acknowledge that Legally Legit AI is a technology service, not a law firm, and you agree to our full Terms and Conditions.</p>
                </div>
            );
            footer = (
                <div className="generation-disclaimer-footer">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={disclaimerCheckboxChecked}
                            onChange={(e) => dispatch({ type: 'SET_DISCLAIMER_CHECKED', payload: e.target.checked })}
                        />
                        <span>I have read and agree to the disclaimer and the Terms and Conditions.</span>
                    </label>
                    <div className="modal-btn-group">
                        <button className="btn btn-secondary" onClick={closeLegalModal}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleAcceptGenerationDisclaimer} disabled={!disclaimerCheckboxChecked}>
                            Agree & Generate Document
                        </button>
                    </div>
                </div>
            );
            break;
    }
    
    // Fallback for any other modal views if they were to exist
    if (!title) return null;

    return (
        <div className="legal-modal-overlay" onClick={closeLegalModal}>
            <div className="card legal-modal-content" onClick={e => e.stopPropagation()}>
                <div className="legal-modal-header">
                    <h3>{title}</h3>
                    <button className="close-btn" onClick={closeLegalModal} aria-label="Close modal">×</button>
                </div>
                <div className="legal-modal-body">{content}</div>
                <div className="legal-modal-footer">{footer}</div>
            </div>
        </div>
    );
}

export function UpgradeModal() {
    const { state, dispatch } = useStateContext();
    const { upgradeModalView } = state;
    if (!upgradeModalView) return null;

    const closeUpgradeModal = () => dispatch({ type: 'SET_UPGRADE_MODAL', payload: null });
    
    const navigateToPricing = () => {
        closeUpgradeModal();
        dispatch({ type: 'SET_PAGE', payload: 'pricing' });
    };

    let title, message, ctaText;

    if (upgradeModalView === 'docLimit') {
        title = 'Document Limit Reached';
        message = 'You\'ve reached your limit of 5 documents per month on the Essentials plan. Upgrade to the Pro plan for unlimited document generation.';
        ctaText = 'Upgrade to Pro';
    } else { // 'featureGate'
        title = 'Upgrade to Access This Feature';
        message = 'This powerful feature is only available on our premium plans. Upgrade your account to unlock this and get the ultimate legal protection.';
        ctaText = 'View Plans & Upgrade';
    }

    return (
        <div className="legal-modal-overlay" onClick={closeUpgradeModal}>
            <div className="card legal-modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                <div className="legal-modal-header">
                    <h3>{title}</h3>
                    <button className="close-btn" onClick={closeUpgradeModal} aria-label="Close modal">×</button>
                </div>
                <div className="legal-modal-body" style={{ textAlign: 'center', padding: '2rem 0' }}>
                     <Icon name="upgrade" className="text-4xl text-accent-teal" />
                     <p style={{ marginTop: '1rem' }}>{message}</p>
                </div>
                <div className="legal-modal-footer" style={{textAlign: "center"}}>
                    <div className="modal-btn-group" style={{justifyContent: 'center'}}>
                         <button className="btn btn-secondary" onClick={closeUpgradeModal}>Maybe Later</button>
                         <button className="btn btn-primary" onClick={navigateToPricing}>{ctaText}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
