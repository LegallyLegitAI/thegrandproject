
"use client";
import React from 'react';
import { useStateContext } from '@/app/lib/state';
import { LEGAL_TERMS_CONTENT_HTML, LEGAL_PRIVACY_CONTENT_HTML } from './data';
import { navigateTo } from '@/app/lib/actions';

export function TermsPage() {
    const { dispatch, state } = useStateContext();
    const backDestination = state.emailGateCompleted ? 'dashboard' : 'landing';
    return (
        <div className="card" style={{ maxWidth: '800px', textAlign: 'left' }}>
            <button className="btn btn-secondary" style={{ marginBottom: '2rem' }} onClick={() => navigateTo(dispatch, backDestination)}>← Back</button>
            <div className="legal-modal-body" dangerouslySetInnerHTML={{ __html: LEGAL_TERMS_CONTENT_HTML }} />
        </div>
    );
}

export function PrivacyPage() {
     const { dispatch, state } = useStateContext();
     const backDestination = state.emailGateCompleted ? 'dashboard' : 'landing';
    return (
        <div className="card" style={{ maxWidth: '800px', textAlign: 'left' }}>
             <button className="btn btn-secondary" style={{ marginBottom: '2rem' }} onClick={() => navigateTo(dispatch, backDestination)}>← Back</button>
            <div className="legal-modal-body" dangerouslySetInnerHTML={{ __html: LEGAL_PRIVACY_CONTENT_HTML }} />
        </div>
    );
}
