
"use client";
import React from 'react';
import { useStateContext } from '@/app/lib/state';
import { navigateTo, handleDownloadPdf, showToast } from '@/app/lib/actions';
import { documentTemplates } from './data';
import { Icon } from './Icon';

export default function DocStudio() {
    const { state, dispatch } = useStateContext();
    const { view, selectedTemplate, formData, generatedDoc, isSaved, isSaving, contractReviewText, contractReviewResults } = state.docStudio;

    const setDocStudioState = (payload: any) => dispatch({ type: 'SET_DOC_STUDIO_STATE', payload });

    const handleSelectTemplate = (key: string) => {
        setDocStudioState({ view: 'form', selectedTemplate: key, formData: {}, generatedDoc: null, isSaved: false });
    };

    const handleSaveDocument = () => {
        if (isSaved) return;
        setDocStudioState({ isSaving: true });
        
        const newDoc = {
            id: Date.now(),
            templateKey: selectedTemplate!,
            name: documentTemplates[selectedTemplate!].name,
            date: new Date().toLocaleDateString('en-AU'),
            content: generatedDoc!
        };

        setTimeout(() => { // Simulate API call to a DB
            const updatedDocs = [...state.docStudio.savedDocs, newDoc];
            dispatch({ type: 'HYDRATE_STATE', payload: { docStudio: { ...state.docStudio, savedDocs: updatedDocs, isSaving: false, isSaved: true } } });
            showToast(dispatch, 'Document saved to your dashboard!', 'success');
        }, 500);
    };
    
    const handleContractReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (state.userTier !== 'pro') {
            dispatch({ type: 'SET_UPGRADE_MODAL', payload: 'featureGate' });
            return;
        }
        dispatch({ type: 'SET_LOADING', payload: true });
        setDocStudioState({ contractReviewResults: null });

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'contractReview', payload: { contractText: contractReviewText } }),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error (err.error || "An unknown error occurred.");
            }
            const results = await response.json();
            setDocStudioState({ contractReviewResults: results });
        } catch (error: any) {
            showToast(dispatch, `Error: ${error.message}`, 'error');
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };
    
    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'SET_LEGAL_MODAL', payload: 'generationDisclaimer' });
    };

    const renderTemplateView = () => (
        <div>
            <div className="dashboard-header">
                <h2>Document Studio</h2>
                <p className="subtle-text">Select a template to start generating your legal document.</p>
            </div>
            <div className="template-grid">
                {Object.entries(documentTemplates).map(([key, template]) => (
                    <div key={key} className="card template-card" onClick={() => handleSelectTemplate(key)}>
                        <h3>{template.name}</h3>
                        <p>{template.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
    
    const renderFormView = () => {
        if (!selectedTemplate) return null;
        const template = documentTemplates[selectedTemplate];
        
        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setDocStudioState({ formData: { ...formData, [e.target.name]: e.target.value }});
        };

        return (
            <div>
                <div className="wizard-header">
                    <h2>{`Create: ${template.name}`}</h2>
                    <p className="subtle-text">{template.description}</p>
                </div>
                <form onSubmit={handleGenerate} className="card">
                    <div className="doc-studio-form-layout">
                        <div className="form-panel">
                            {template.formFields.map(field => (
                                <div key={field} className="form-group">
                                    <label htmlFor={field}>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                                    <input type="text" id={field} name={field} required value={formData[field] || ''} onInput={handleInputChange} />
                                </div>
                            ))}
                        </div>
                        <div className="live-preview-panel">
                            <h3>Live Preview</h3>
                            <div className="generated-doc">
                                {template.formFields.map(field => (
                                    <p key={field} className="preview-value">
                                        <strong>{`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: `}</strong>
                                        {formData[field] || <em>...</em>}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="doc-studio-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setDocStudioState({ view: 'templates' })}>Back to Templates</button>
                        <button type="submit" className="btn btn-primary" disabled={state.isLoading}>
                            {state.isLoading ? <div className="spinner small"/> : <Icon name="gold" />} Generate Document
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    const renderPreviewView = () => {
        if (!generatedDoc || !selectedTemplate) return null;
        const canDownload = state.userTier === 'essentials' || state.userTier === 'pro';
        
        return (
             <div className="preview-container">
                <div className="generation-success">
                    <h3>{`${documentTemplates[selectedTemplate].name} Generated!`}</h3>
                    <p className="subtle-text">Review your document below. You can save it to your dashboard or download it.</p>
                </div>
                <div className="info-box">
                    <p><strong>Disclaimer:</strong> This is an AI-generated document and is not a substitute for legal advice. <strong>You must have this document reviewed by a qualified lawyer before use.</strong></p>
                </div>
                <div id="doc-preview-content" className={`generated-doc ${!canDownload ? 'blurred-watermarked' : ''}`} dangerouslySetInnerHTML={{ __html: generatedDoc }} />
                
                 <div className="preview-actions">
                    {!canDownload && <div className="upgrade-prompt">Upgrade to the <a href="#" onClick={(e) => { e.preventDefault(); navigateTo(dispatch, 'pricing')}}>Essentials Plan</a> or higher to download.</div>}
                    <div className="btn-group">
                        <button className="btn btn-primary" onClick={() => handleDownloadPdf(dispatch)} disabled={!canDownload}><Icon name="download"/> Download PDF</button>
                        <button className="btn btn-secondary" onClick={handleSaveDocument} disabled={isSaving || isSaved || !canDownload}>
                            {isSaving ? <div className="spinner small"/> : <Icon name={isSaved ? 'checkmark' : 'save'}/>} {isSaved ? 'Saved' : 'Save to Dashboard'}
                        </button>
                    </div>
                     <button className="btn-back-to-templates" onClick={() => handleSelectTemplate(selectedTemplate)}>Edit Details or Start Over</button>
                </div>
            </div>
        )
    };
    
    const renderReviewView = () => (
        <div className="contract-review-container">
            <div className="dashboard-header">
                <h2>AI Contract Review</h2>
                <p className="subtle-text">Paste a contract you've received and our AI will spot potential risks for an Australian small business owner.</p>
            </div>
            {state.userTier !== 'pro' ? (
                <div className="card">
                     <div className="upgrade-cta-box">
                        <Icon name="upgrade"/>
                        <div className="upgrade-cta-content">
                            <h3>Unlock AI Contract Review</h3>
                            <p>This powerful feature is exclusive to our Pro plan.</p>
                        </div>
                        <button className="btn" onClick={() => navigateTo(dispatch, 'pricing')}>Upgrade to Pro</button>
                     </div>
                </div>
            ) : (
                <form className="card" onSubmit={handleContractReviewSubmit}>
                    <textarea
                        className="contract-textarea"
                        placeholder="Paste your contract text here..."
                        value={contractReviewText}
                        onChange={(e) => setDocStudioState({ contractReviewText: e.target.value })}
                        aria-label="Contract Text Input"
                    />
                    <button className="btn btn-primary" type="submit" disabled={state.isLoading || !contractReviewText}>
                        {state.isLoading ? <div className="spinner small"/> : <Icon name="diagnose" />} {state.isLoading ? 'Analyzing...' : 'Analyze for Issues'}
                    </button>
                </form>
            )}
            {state.isLoading && view === 'review' && contractReviewText && <div className="spinner" style={{ margin: '2rem auto' }}/>}
            {contractReviewResults && (
                <div className="review-results-container">
                    <h3>Analysis Complete: Potential Issues Found</h3>
                    {contractReviewResults.length > 0 ? (
                        <ul className="risk-issue-list">
                            {contractReviewResults.map((issue, index) => (
                                <li key={index} className="card risk-issue-card stagger-fade-in" data-severity={issue.riskLevel} style={{ animationDelay: `${index * 100}ms` }}>
                                    <div className="risk-card-header">
                                        <h4>{issue.title}</h4>
                                        <span className="severity-badge" data-severity={issue.riskLevel}>{issue.riskLevel}</span>
                                    </div>
                                    <p>{issue.explanation}</p>
                                    <strong>Suggestion:</strong>
                                    <p>{issue.suggestion}</p>
                                </li>
                            ))}
                        </ul>
                    ) : <div className="card info-box"><p>Our AI didn't find any major red flags, but this is not a substitute for a professional review.</p></div>}
                </div>
            )}
        </div>
    );

    const renderTabs = () => (
        <nav className="doc-studio-nav">
            <button className={`nav-tab ${view !== 'review' ? 'active' : ''}`} onClick={() => setDocStudioState({ view: 'templates', contractReviewResults: null })}>
                <Icon name="studio" /> Document Templates
            </button>
            <button className={`nav-tab ${view === 'review' ? 'active' : ''}`} onClick={() => setDocStudioState({ view: 'review' })}>
                <Icon name="diagnose" /> AI Contract Review
            </button>
        </nav>
    );

    let content;
    if (view === 'form') content = renderFormView();
    else if (view === 'preview') content = renderPreviewView();
    else if (view === 'review') content = renderReviewView();
    else content = renderTemplateView();

    return (
        <div className="doc-studio-container">
            {renderTabs()}
            {content}
        </div>
    );
}
