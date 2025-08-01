import React from 'react';
import { createRoot } from 'react-dom/client';
import { StateProvider } from './app/lib/state';
import AppClient from './app/components/AppClient';

// This file is the main entry point for the client-side rendered application.
// It sets up the React root and renders the main AppClient component,
// which manages the application's state and page routing.

const container = document.getElementById('root');

if (container) {
    const root = createRoot(container);
    root.render(
        <StateProvider>
            <AppClient />
        </StateProvider>
    );
} else {
    console.error('Fatal Error: The application could not start because the root element with id="root" was not found in the DOM.');
}
