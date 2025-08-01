
"use client";
import React from 'react';
import { useStateContext } from '@/app/lib/state';
import { navigateTo } from '@/app/lib/actions';

export default function Footer() {
    const { dispatch } = useStateContext();

    const handleNav = (e: React.MouseEvent, page: any) => {
        e.preventDefault();
        navigateTo(dispatch, page);
    };

    const handleShowLegal = (e: React.MouseEvent, modal: 'terms' | 'privacy') => {
        e.preventDefault();
        dispatch({ type: 'SET_PAGE', payload: modal });
    }

    return (
        <footer className="app-footer">
            <div className="footer-main">
                <div className="footer-contact">
                    <p><strong>Legally Legit AI Pty Ltd</strong></p>
                    <p>Brisbane QLD 4000</p>
                    <p><a href="mailto:admin@legallylegitai.com.au">admin@legallylegitai.com.au</a></p>
                </div>
                <nav>
                    <a href="#" onClick={(e) => handleNav(e, 'about')}>About</a>
                    <a href="#" onClick={(e) => handleNav(e, 'blogIndex')}>Blog</a>
                    <a href="#" onClick={(e) => handleNav(e, 'pricing')}>Pricing</a>
                    <a href="#" onClick={(e) => handleShowLegal(e, 'terms')}>Terms of Service</a>
                    <a href="#" onClick={(e) => handleShowLegal(e, 'privacy')}>Privacy Policy</a>
                </nav>
            </div>
            <div className="footer-disclaimer">
                 <p>© {new Date().getFullYear()} Legally Legit AI Pty Ltd. All Rights Reserved. Built for Australian businesses.</p>
                 <p style={{ marginTop: '1rem'}}><strong>Disclaimer:</strong> Legally Legit AI is a legal information service, not a law firm. We do not provide legal advice and no solicitor-client relationship is created. Our AI-powered tools are for informational purposes only, may contain errors, and are not a substitute for professional legal advice. You must consult a qualified lawyer before making any decision or taking any action based on information from this service. See our full <a href="#" onClick={(e) => handleShowLegal(e, 'terms')}>Terms and Conditions</a>.</p>
            </div>
        </footer>
    );
}
