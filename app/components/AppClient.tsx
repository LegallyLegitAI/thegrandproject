"use client";

import React, { useEffect } from 'react';
import { useStateContext } from '@/app/lib/state';
import Header from './Header';
import Footer from './Footer';
import LandingPage from './LandingPage';
import HealthCheck from './HealthCheck';
import ResultsPage, { EmailCapture } from './ResultsPage';
import DocStudio from './DocStudio';
import Dashboard from './Dashboard';
import PricingPage from '../Pricing';
import CalendarPage from './CalendarPage';
import AboutPage from './AboutPage';
import BlogPage from './BlogPage';
import { LegalModal, UpgradeModal } from './Modal';
import { ToastContainer } from './Toast';
import { TermsPage, PrivacyPage } from './LegalPages';
import { contentCalendar } from './data';

export default function AppClient({ children }: { children?: React.ReactNode }) {
    const { state, dispatch } = useStateContext();

    useEffect(() => {
        const pageTitles: { [key: string]: string } = {
            landing: "AI Legal Tools for Australian Small Business | Legally Legit AI",
            pricing: "Pricing | Legally Legit AI",
            about: "About Us | Legally Legit AI",
            blogIndex: "Blog | Legally Legit AI",
            docStudio: "Document Studio | Legally Legit AI",
            dashboard: "Dashboard | Legally Legit AI",
            results: "Your Risk Report | Legally Legit AI",
            healthCheck: "Free Legal Health Check | Legally Legit AI",
            terms: "Terms & Conditions | Legally Legit AI",
            privacy: "Privacy Policy | Legally Legit AI",
        };
        
        let title = pageTitles[state.currentPage] || "Legally Legit AI";
        if (state.currentPage === 'blogPost' && state.blog.currentPostId) {
            const post = contentCalendar.find(p => p.id === state.blog.currentPostId);
            if (post) title = `${post.title} | Legally Legit AI`;
        }
        document.title = title;
    }, [state.currentPage, state.blog.currentPostId]);

    const renderPage = () => {
        const { currentPage, emailGateCompleted, results } = state;

        if (!emailGateCompleted) {
             switch (currentPage) {
                case 'healthCheck': return <HealthCheck />;
                case 'results': return <EmailCapture />; // Gate the results page
                case 'pricing': return <PricingPage />;
                case 'about': return <AboutPage />;
                case 'blogIndex': return <BlogPage />;
                case 'blogPost': return <BlogPage />;
                case 'terms': return <TermsPage />;
                case 'privacy': return <PrivacyPage />;
                default: return <LandingPage />;
            }
        }
        
        // Logged-in user routing
        switch (currentPage) {
            case 'dashboard': return <Dashboard />;
            case 'docStudio': return <DocStudio />;
            case 'calendar': return <CalendarPage />;
            case 'results': return <ResultsPage />;
            case 'pricing': return <PricingPage />;
            case 'about': return <AboutPage />;
            case 'blogIndex': return <BlogPage />;
            case 'blogPost': return <BlogPage />;
            case 'terms': return <TermsPage />;
            case 'privacy': return <PrivacyPage />;
            case 'healthCheck': return <HealthCheck />; // Allow re-taking
            default: return <Dashboard />; // Default to dashboard if logged in
        }
    };

    return (
        <div id="app" className={state.isNavOpen ? 'nav-open' : ''}>
            <Header />
            <main className="page-container">
                {renderPage()}
            </main>
            <Footer />
            <LegalModal />
            <UpgradeModal />
            <ToastContainer />
            {state.isNavOpen && <div className="page-overlay" onClick={() => dispatch({type: 'SET_NAV_OPEN', payload: false})} />}
        </div>
    );
}