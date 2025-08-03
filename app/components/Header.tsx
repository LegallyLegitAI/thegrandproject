{/* Desktop Navigation (hide on mobile) */}
{!state.isNavOpen && (
  <nav className="app-nav desktop-nav">
    {navLinks.map(link => (
      <NavLink key={link.page} page={link.page} label={link.label} currentPage={state.currentPage} dispatch={dispatch} />
    ))}
  </nav>
)}

{/* Mobile Slide-out Navigation (only show if nav open) */}
{state.isNavOpen && (
  <nav className="app-nav mobile-nav mobile-active">
    {isLoggedIn && (
      <>
        <NavLink page="dashboard" label="Dashboard" currentPage={state.currentPage} dispatch={dispatch} />
        <NavLink page="docStudio" label="Studio" currentPage={state.currentPage} dispatch={dispatch} />
        <NavLink page="calendar" label="Calendar" currentPage={state.currentPage} dispatch={dispatch} />
        <NavLink page="results" label="Risks" currentPage={state.currentPage} dispatch={dispatch} />
      </>
    )}
    {navLinks.map(link => (
      <NavLink key={link.page} page={link.page} label={link.label} currentPage={state.currentPage} dispatch={dispatch} />
    ))}
    {isLoggedIn && <a href="#" onClick={handleLogout}>Logout</a>}
  </nav>
)}
"use client";
import React from 'react';
import { useStateContext } from '@/app/lib/state';
import { LOGO_DATA_URI } from './data';
import { navigateTo, showToast } from '@/app/lib/actions';
import { Icon } from './Icon';
import { Page } from '../lib/types';

function NavLink({ page, label, currentPage, dispatch }: { page: Page, label: string, currentPage: Page, dispatch: any }) {
    const handleNavClick = (e: React.MouseEvent) => {
        e.preventDefault();
        navigateTo(dispatch, page);
    };
    return (
        <a href="#" onClick={handleNavClick} className={currentPage === page || (currentPage === 'blogPost' && page === 'blogIndex') ? 'active' : ''}>
            {label}
        </a>
    );
}

export default function Header() {
    const { state, dispatch } = useStateContext();
    const isLoggedIn = state.isAuthenticated; // switched from emailGateCompleted to isAuthenticated
    const userTier = state.user?.tier || 'free';

    const handleLogoClick = (e: React.MouseEvent) => {
        e.preventDefault();
        navigateTo(dispatch, isLoggedIn ? 'dashboard' : 'landing');
    };
    
    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        localStorage.removeItem('legallyLegitPrefs'); // clear your saved prefs
        dispatch({ type: 'LOGOUT' });
        showToast(dispatch, "You have been logged out.", "info");
    };

    const toggleNav = () => {
        dispatch({ type: 'SET_NAV_OPEN', payload: !state.isNavOpen });
    };

    const navLinks = [
        { page: 'pricing' as Page, label: 'Pricing' },
        { page: 'blogIndex' as Page, label: 'Blog' },
        { page: 'about' as Page, label: 'About' },
    ];

    return (
        <header className={`app-header ${state.isNavOpen ? 'nav-open' : ''}`}>
            <a href="#" onClick={handleLogoClick} className="logo">
                <img src={LOGO_DATA_URI} alt="Legally Legit AI Logo" className="logo-img" />
                <h1 className="main-title">Legally Legit AI</h1>
            </a>
            
            {/* Desktop Navigation */}
            <nav className="app-nav desktop-nav">
                {navLinks.map(link => (
                    <NavLink key={link.page} page={link.page} label={link.label} currentPage={state.currentPage} dispatch={dispatch} />
                ))}
                {isLoggedIn && (
                    <>
                        <NavLink page="dashboard" label="Dashboard" currentPage={state.currentPage} dispatch={dispatch} />
                        <NavLink page="docStudio" label="Studio" currentPage={state.currentPage} dispatch={dispatch} />
                        <NavLink page="calendar" label="Calendar" currentPage={state.currentPage} dispatch={dispatch} />
                        <NavLink page="results" label="Risks" currentPage={state.currentPage} dispatch={dispatch} />
                        <a href="#" onClick={handleLogout} className="logout-link">Logout</a>
                    </>
                )}
            </nav>

            {/* Mobile Slide-out Navigation */}
            <nav className={`app-nav mobile-nav ${state.isNavOpen ? 'mobile-active' : ''}`}>
                {navLinks.map(link => (
                    <NavLink key={link.page} page={link.page} label={link.label} currentPage={state.currentPage} dispatch={dispatch} />
                ))}
                {isLoggedIn && (
                    <>
                        <NavLink page="dashboard" label="Dashboard" currentPage={state.currentPage} dispatch={dispatch} />
                        <NavLink page="docStudio" label="Studio" currentPage={state.currentPage} dispatch={dispatch} />
                        <NavLink page="calendar" label="Calendar" currentPage={state.currentPage} dispatch={dispatch} />
                        <NavLink page="results" label="Risks" currentPage={state.currentPage} dispatch={dispatch} />
                        <a href="#" onClick={handleLogout} className="logout-link">Logout</a>
                    </>
                )}
            </nav>

            <div className="header-actions">
                {isLoggedIn ? (
                    <div className="user-status">
                        <span className="plan-badge">{userTier}</span>
                        <a href="#" onClick={handleLogout} className="subtle-text logout-btn" style={{ textDecoration: 'none' }}>Logout</a>
                    </div>
                ) : (
                    <button className="btn btn-primary" onClick={() => navigateTo(dispatch, 'healthCheck')}>
                        Get Free Score
                    </button>
                )}
                <button className="mobile-nav-toggle" aria-label="Toggle menu" onClick={toggleNav}>
                    <div className="hamburger-line"></div>
                    <div className="hamburger-line"></div>
                    <div className="hamburger-line"></div>
                </button>
            </div>

            {isLoggedIn && <BottomNav />}
        </header>
    );
}

function BottomNav() {
    const { state, dispatch } = useStateContext();
    
    const navItems = [
        { page: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
        { page: 'docStudio', icon: 'studio', label: 'Studio' },
        { page: 'calendar', icon: 'calendar', label: 'Calendar' },
        { page: 'results', icon: 'risks', label: 'Risks' }
    ];

    return (
        <nav className="bottom-nav">
            {navItems.map(item =>
                <button
                    key={item.page}
                    className={`bottom-nav-item ${state.currentPage === item.page ? 'active' : ''}`}
                    onClick={() => navigateTo(dispatch, item.page as any)}
                    aria-label={item.label}
                >
                    <Icon name={item.icon as any} />
                    <span className="bottom-nav-label">{item.label}</span>
                </button>
            )}
        </nav>
    );
}
