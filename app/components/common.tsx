
import { addOns, LEGAL_TERMS_CONTENT_HTML, LEGAL_PRIVACY_CONTENT_HTML } from './data';
import { icons } from './data';

// --- RENDER HELPERS ---
export function h(tag, props, ...children) {
    const el = document.createElement(tag);
    if (props) {
        for (const [key, value] of Object.entries(props)) {
            if (key.startsWith('on') && typeof value === 'function') {
                el.addEventListener(key.substring(2).toLowerCase(), value);
            } else if (key === 'class') {
                 if (Array.isArray(value)) {
                    el.className = value.filter(Boolean).join(' ');
                } else {
                    el.className = value;
                }
            } else if (key === 'innerHTML') {
                el.innerHTML = value;
            } else if (typeof value === 'boolean') {
                if (value) el.setAttribute(key, '');
            } else if (value != null) {
                el.setAttribute(key, value);
            }
        }
    }
    
    const appendChild = (child) => {
        if (child === null || child === undefined || child === false) return;
        if (Array.isArray(child)) {
            child.forEach(appendChild);
        } else if (child instanceof Node) {
            el.appendChild(child);
        } else {
            el.appendChild(document.createTextNode(String(child)));
        }
    };

    children.forEach(appendChild);
    return el;
}

export function Icon(iconName) {
    const span = document.createElement('span');
    span.className = `icon ${iconName}`;
    if (icons[iconName]) {
        span.innerHTML = icons[iconName];
    }
    return span;
}

export function renderLegalModal({ state, setState, closeLegalModal, handleAcceptGenerationDisclaimer, handlePurchaseAddOn, showLegalModal }) {
    const { legalModalView } = state;
    if (!legalModalView) return null;

    let title, content, footer;
    const acceptDisclaimerButton = h('button', {
        class: 'btn btn-primary',
        onclick: handleAcceptGenerationDisclaimer
    }, 'Agree & Generate Document');

    const purchaseLawyerReviewButton = h('button', {
        class: 'btn btn-primary',
        onclick: () => handlePurchaseAddOn('lawyerReview')
    }, `Purchase Review for $${addOns.lawyerReview.price}`);
    
    switch(legalModalView) {
        case 'terms':
            title = 'Terms & Conditions';
            content = h('div', { innerHTML: LEGAL_TERMS_CONTENT_HTML });
            footer = h('button', { class: 'btn btn-primary', onclick: closeLegalModal }, 'Close');
            break;
        case 'privacy':
            title = 'Privacy Policy';
            content = h('div', { innerHTML: LEGAL_PRIVACY_CONTENT_HTML });
            footer = h('button', { class: 'btn btn-primary', onclick: closeLegalModal }, 'Close');
            break;
        case 'generationDisclaimer':
            title = 'Important Disclaimer';
            content = h('div', {},
                h('h5', {}, 'AI-Generated Documents Require Review'),
                h('p', {}, 'The document you are about to generate is created by AI based on a template. It is for informational purposes only and is not a substitute for legal advice.'),
                h('p', {}, h('strong', {}, 'You MUST have this document reviewed by a qualified, independent lawyer before you use it.')),
                h('p', {}, 'By continuing, you acknowledge that Legally Legit AI is a technology service, not a law firm, and you agree to our full Terms and Conditions.')
            );
            footer = h('div', { class: 'generation-disclaimer-footer'},
                h('label', { class: 'checkbox-label' },
                    h('input', {
                        type: 'checkbox',
                        class: 'generation-disclaimer-checkbox',
                        checked: state.disclaimerCheckboxChecked,
                        onchange: (e) => setState({ disclaimerCheckboxChecked: (e.target as HTMLInputElement).checked })
                    }),
                    'I have read and agree to the disclaimer and the Terms and Conditions.'
                ),
                h('div', { class: 'modal-btn-group' },
                    h('button', { class: 'btn btn-secondary', onclick: closeLegalModal }, 'Cancel'),
                    acceptDisclaimerButton,
                    h('button', { class: 'btn btn-secondary', onclick: () => showLegalModal('lawyerReviewPurchase') }, 'Purchase Lawyer Review')
                )
            );
            break;
        case 'lawyerReviewPurchase':
            title = 'Purchase a Lawyer Review';
            content = h('div', {},
                h('h5', {}, 'Bridge the Gap Between AI and Advice'),
                h('p', {}, 'For ultimate peace of mind, have your generated document reviewed by a qualified, independent Australian lawyer from our partner panel.'),
                h('p', {}, h('strong', {}, `For a one-time fee of $${addOns.lawyerReview.price}, a lawyer will review your document within 2 business days and provide feedback.`)),
                h('p', { class: 'subtle-text' }, 'This is a separate service provided by a third-party law firm. A solicitor-client relationship will be formed with them, not Legally Legit AI.')
            );
            footer = h('div', { class: 'modal-btn-group' },
                h('button', { class: 'btn btn-secondary', onclick: () => showLegalModal('generationDisclaimer') }, 'Back'),
                purchaseLawyerReviewButton
            );
            break;
    }
    
    return h('div', { class: 'legal-modal-overlay', onclick: closeLegalModal },
        h('div', { class: 'card legal-modal-content', onclick: e => e.stopPropagation() },
            h('div', { class: 'legal-modal-header' },
                h('h3', {}, title),
                h('button', { class: 'close-btn', onclick: closeLegalModal, 'aria-label': 'Close modal' }, '×')
            ),
            h('div', { class: 'legal-modal-body' }, content),
            h('div', { class: 'legal-modal-footer' }, footer)
        )
    );
}

export function renderUpgradeModal({ state, navigateTo, closeUpgradeModal }) {
    const { upgradeModalView } = state;
    if (!upgradeModalView) return null;

    let title, message, ctaText, ctaAction;

    if (upgradeModalView === 'docLimit') {
        title = 'Document Limit Reached';
        message = 'You\'ve reached your limit of 5 documents per month on the Essentials plan. Upgrade to the Pro plan for unlimited document generation.';
        ctaText = 'Upgrade to Pro';
        ctaAction = () => navigateTo('pricing');
    } else { // 'featureGate'
        title = 'Upgrade to Access This Feature';
        message = 'This powerful feature is only available on our premium plans. Upgrade your account to unlock this and get the ultimate legal protection.';
        ctaText = 'View Plans & Upgrade';
        ctaAction = () => navigateTo('pricing');
    }

    return h('div', { class: 'legal-modal-overlay', onclick: closeUpgradeModal },
        h('div', { class: 'card legal-modal-content', style: 'max-width: 500px;', onclick: e => e.stopPropagation() },
            h('div', { class: 'legal-modal-header' },
                h('h3', {}, title),
                h('button', { class: 'close-btn', onclick: closeUpgradeModal, 'aria-label': 'Close modal' }, '×')
            ),
            h('div', { class: 'legal-modal-body', style: 'text-align: center; padding: 2rem 0;' },
                 Icon('upgrade'),
                 h('p', { style: 'margin-top: 1rem;'}, message)
            ),
            h('div', { class: 'legal-modal-footer' },
                h('button', { class: 'btn btn-secondary', onclick: closeUpgradeModal }, 'Maybe Later'),
                h('button', { class: 'btn btn-primary', onclick: ctaAction }, ctaText)
            )
        )
    );
}
