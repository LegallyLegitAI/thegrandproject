
"use client";
import React from 'react';
import { useStateContext } from '@/app/lib/state';
import { navigateTo } from '@/app/lib/actions';
import { contentCalendar } from './data';

function BlogIndex() {
    const { dispatch } = useStateContext();
    const handlePostClick = (postId: string) => {
        navigateTo(dispatch, 'blogPost', { blog: { currentPostId: postId } });
    };

    return (
        <div style={{ width: '100%' }}>
            <div className="dashboard-header">
                <h2>The Legally Legit Blog</h2>
                <p className="subtle-text">Practical legal insights for Australian small business owners.</p>
            </div>
            <div className="template-grid">
                {contentCalendar.map(post => (
                    <div key={post.id} className="card template-card" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => handlePostClick(post.id)}>
                        <h3 style={{ color: 'var(--primary-blue)' }}>{post.title}</h3>
                        <p className="subtle-text" style={{ marginBottom: '1rem' }}>{`By ${post.author} on ${post.date}`}</p>
                        <p>{post.description}</p>
                        <button onClick={(e) => {e.stopPropagation(); handlePostClick(post.id)}} className="btn-widget-link" style={{ textAlign: 'left', padding: '1rem 0 0 0' }}>Read More →</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BlogPost() {
    const { state, dispatch } = useStateContext();
    const post = contentCalendar.find(p => p.id === state.blog.currentPostId);

    if (!post) {
        return (
            <div>
                <p>Post not found.</p>
                <button onClick={() => navigateTo(dispatch, 'blogIndex')}>Back to blog</button>
            </div>
        );
    }
    
    return (
        <div className="card" style={{ maxWidth: '800px', textAlign: 'left' }}>
            <button className="btn btn-secondary" style={{ marginBottom: '2rem' }} onClick={() => navigateTo(dispatch, 'blogIndex')}>← Back to All Articles</button>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{post.title}</h2>
            <p className="subtle-text" style={{ marginBottom: '2rem' }}>{`By ${post.author} on ${post.date}`}</p>
            <div className="generated-doc" dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
    );
}

export default function BlogPage() {
    const { state } = useStateContext();
    return state.blog.currentPostId ? <BlogPost /> : <BlogIndex />;
}
