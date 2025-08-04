'use client';

import { useStateContext } from '@/app/lib/state';
import DocStudio from './DocStudio';
import { templates, savedDocuments } from './data';
import { Doc } from '@/app/lib/types';

export default function Dashboard() {
  const { state, dispatch } = useStateContext();
  const { docStudio } = state;

  const handleSelectTemplate = (templateKey: string) => {
    dispatch({
      type: 'SET_DOC_STUDIO_STATE',
      payload: { view: 'editor', selectedTemplate: templateKey },
    });
  };

  const handleSaveDocument = (generatedDoc: any) => {
    // In a real app, this would save to the database via a server action
    dispatch({
      type: 'SET_DOC_STUDIO_STATE',
      payload: {
        view: 'templates',
        selectedTemplate: null,
        generatedDoc: null,
        isSaved: true,
      },
    });
    // Here you would also update the savedDocs list
  };

  if (docStudio.view === 'editor') {
    return <DocStudio templateKey={docStudio.selectedTemplate!} onSave={handleSaveDocument} />;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Welcome back, {state.user?.fullName || 'User'}</h1>
      
      <div className="dashboard-section">
        <h2 className="section-title">Create a New Document</h2>
        <div className="templates-grid">
          {templates.map((template) => (
            <div
              key={template.key}
              className="template-card"
              onClick={() => handleSelectTemplate(template.key)}
            >
              <h3 className="template-name">{template.name}</h3>
              <p className="template-description">{template.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">My Saved Documents</h2>
        <div className="saved-docs-list">
          {docStudio.savedDocs.length > 0 ? (
            docStudio.savedDocs.map((doc: Doc) => ( // CORRECTED: Added explicit type for 'doc'
              <div key={doc.id} className="saved-doc-item">
                <span className="doc-name">{doc.name}</span>
                <span className="doc-date">{doc.date}</span>
              </div>
            ))
          ) : (
            <p className="empty-state-text">You have no saved documents yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}