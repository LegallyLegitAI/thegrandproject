"use client";
import React from 'react';
import Image from 'next/image'; // Import the optimized Image component

export default function AboutPage() {
    return (
        <div className="card" style={{ maxWidth: '800px', textAlign: 'left' }}>
            <h2 className="trust-title" style={{ textAlign: 'center' }}>About Legally Legit AI</h2>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', margin: '2rem 0' }}>
                <Image
                    src="/Temeka-Sue-Tin.jpg" // This path now points to your public folder
                    width={150}
                    height={150}
                    style={{ borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--accent-teal)' }}
                    alt="Temeka Sue-Tin, Founder of Legally Legit AI"
                    priority // Add priority to load the image faster as it's important
                />
                <h3 style={{ margin: 0 }}>Temeka Sue-Tin</h3>
                <p className="subtle-text" style={{ margin:0 }}>Founder & Principal Lawyer</p>
            </div>
            <p>As a lawyer with over a decade of experience in corporate and commercial law, I've seen firsthand how small businesses and startups struggle with legal compliance. They often face a difficult choice: spend thousands on legal fees they can't afford, or "wing it" and hope for the best, exposing themselves to massive risks.</p>
            <p>I founded Legally Legit AI to bridge this gap. My mission is to democratize access to legal protection by combining my legal expertise with the power of artificial intelligence. We provide smart, affordable, and easy-to-use tools that empower business owners to understand their risks, generate the documents they need, and stay on top of their obligations.</p>
            <p style={{ fontWeight: 600, color: 'var(--primary-blue)' }}>We're not here to replace lawyers—we're here to make them more accessible and effective. By handling the foundational work, we help you go to your lawyer with better questions, saving you time and money.</p>
            <p>Thank you for trusting us to be your intelligent legal shield.</p>
        </div>
    );
}