
"use client";

import React from 'react';
import { useStateContext } from '@/app/lib/state';

export function ToastContainer() {
  const { state } = useStateContext();

  return (
    <div className="toast-container">
      {state.toasts.map(toast => (
        <div key={toast.id} className={`toast-item ${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
