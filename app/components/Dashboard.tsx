
"use client";
import React from 'react';
import { useStateContext } from '@/app/lib/state';
import { navigateTo } from '@/app/lib/actions';
import { Icon } from './Icon';

export default function Dashboard() {
    const { state, dispatch } = useStateContext();

    const handleSelectTemplate = (templateKey: string) => {
        dispatch({ type: 'SET_DOC_STUDIO_STATE', payload: { view: 'form', selectedTemplate: templateKey } });
        navigateTo(dispatch, 'docStudio');
    };

    const viewSavedDoc = (docId: number) => {
        const doc = state.docStudio.savedDocs.find(d => d.id === docId);
        if (doc) {
            dispatch({
                type: 'SET_DOC_STUDIO_STATE',
                payload: {
                    view: 'preview',
                    selectedTemplate: doc.templateKey,
                    generatedDoc: doc.content,
                    isSaved: true
                }
            });
            navigateTo(dispatch, 'docStudio');
        }
    };

    const highPriorityRisks = state.results ? state.results.risks.filter(r => r.severity === 'High') : [];
    
    return (
        <div className="dashboard-container" style={{width: '100%'}}>
            <div className="dashboard-header">
                <h2>{`Welcome back, ${state.emailCapture.firstName || 'User'}`}</h2>
                <p className="subtle-text">Here's a summary of your legal standing and upcoming compliance tasks.</p>
            </div>
            <div className="dashboard-grid">
                <div className="dashboard-widget card">
                    <div className="widget-title"><Icon name="risks" /> Your Current Risk Score</div>
                    {state.results ? (
                        <div className="score-circle-small" style={{ background: `linear-gradient(145deg, ${state.results.score > 70 ? 'var(--success-color)' : state.results.score > 40 ? 'var(--accent-gold)' : 'var(--error-color)'}, ${state.results.score > 70 ? '#388e3c' : state.results.score > 40 ? '#f59e0b' : '#c62828'})` }}>
                            <span className="score-value-small">{state.results.score}</span>
                        </div>
                    ) : <p className='subtle-text' style={{textAlign: 'center'}}>Complete the health check to get your score.</p>}
                    <button className="btn-widget-link" onClick={() => navigateTo(dispatch, 'results')}>View Full Risk Report →</button>
                </div>
                
                <div className="dashboard-widget card">
                    <div className="widget-title"><Icon name="calendar" /> Upcoming Deadlines</div>
                     {state.calendar.events.length > 0 ? (
                        <div className="event-list-widget">
                            {[...state.calendar.events]
                                .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                .slice(0, 3).map(event => (
                                <div key={event.id} className="event-item-widget" data-category={event.category}>
                                    <div>
                                        <h4>{event.title}</h4>
                                        <p className="subtle-text">{`Due: ${new Date(event.date).toLocaleDateString('en-AU', {day: 'numeric', month: 'long'})}`}</p>
                                    </div>
                                    <span className="event-category-badge" data-category={event.category}>{event.category}</span>
                                </div>
                            ))}
                        </div>
                    ) : <p className='subtle-text'>No upcoming deadlines.</p>}
                    <button className="btn-widget-link" onClick={() => navigateTo(dispatch, 'calendar')}>Go to Full Calendar →</button>
                </div>

                <div className="dashboard-widget card widget-risks">
                    <div className="widget-title"><Icon name="risks" /> Top Priority Risks</div>
                    {highPriorityRisks.length > 0 ? (
                        <div className="risk-list-widget">
                            {highPriorityRisks.slice(0, 3).map(risk => (
                                <div key={risk.title} className="risk-item-widget" data-severity={risk.severity}>
                                    <div>
                                        <h4>{risk.title}</h4>
                                        <p>{risk.areaForReview}</p>
                                    </div>
                                    {risk.suggestedTemplate && <button className="btn btn-secondary btn-small no-full-width" onClick={() => handleSelectTemplate(risk.suggestedTemplate!)}>Fix This</button>}
                                </div>
                            ))}
                        </div>
                    ) : <p className='subtle-text'>No high-priority risks found, or health check not completed.</p>}
                    <button className="btn-widget-link" onClick={() => navigateTo(dispatch, 'results')}>View All Risks →</button>
                </div>

                <div className="dashboard-widget card">
                    <div className="widget-title"><Icon name="studio" /> Saved Documents</div>
                    {state.docStudio.savedDocs.length > 0 ? (
                        <ul className="saved-doc-list">
                            {state.docStudio.savedDocs.map(doc => (
                                <li key={doc.id} className="saved-doc-item" onClick={() => viewSavedDoc(doc.id)}>
                                    <div>
                                        <p className="doc-name">{doc.name}</p>
                                        <p className="doc-date">{`Saved on ${doc.date}`}</p>
                                    </div>
                                    <span className="view-arrow"><Icon name="arrowRight" /></span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="empty-state">
                            <Icon name="studio" />
                            <p>No saved documents yet.</p>
                            <p className="subtle-text">Generated documents will appear here.</p>
                        </div>
                    )}
                    <button className="btn-widget-link" onClick={() => navigateTo(dispatch, 'docStudio')}>Go to Document Studio →</button>
                </div>
            </div>
        </div>
    );
}
