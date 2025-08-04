import { Risk } from '@/app/lib/types';

// ADDED: The missing 'questions' array for the Health Check.
export const questions = [
  {
    id: 'q1',
    text: 'Do you have written agreements with all your clients?',
    options: [
      { text: 'Yes, for all of them', value: 'yes_all' },
      { text: 'For some of them', value: 'yes_some' },
      { text: 'No, mostly verbal', value: 'no' },
    ],
  },
  {
    id: 'q2',
    text: 'How do you handle your website\'s privacy policy and terms of service?',
    options: [
      { text: 'We have custom lawyer-drafted ones', value: 'custom' },
      { text: 'We used a generic online template', value: 'template' },
      { text: 'We don\'t have them', value: 'none' },
    ],
  },
  // Add more questions as needed
];

export const templates = [
    { key: 'client-agreement', name: 'Client Service Agreement', description: 'Define the terms of your client relationships.' },
    { key: 'nda', name: 'Non-Disclosure Agreement', description: 'Protect your confidential information.' },
];

export const savedDocuments = [];

export const risks: Risk[] = [];