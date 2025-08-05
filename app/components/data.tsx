import { Risk } from '@/app/lib/types';

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

// ADDED: The missing 'faqData' array for the Landing Page.
export const faqData = [
    {
        question: 'Are these documents legally binding in Australia?',
        answer: 'Yes. Every document is drafted by qualified Australian lawyers and is compliant with current national and state legislation. They are designed to be robust and legally enforceable.'
    },
    {
        question: 'What if a law changes after I buy a document?',
        answer: 'Our "Legal Shield" subscription provides automatic updates. When a law changes that affects a document you use, we update the template and notify you, ensuring you always stay compliant.'
    },
    {
        question: 'Is this a replacement for a lawyer?',
        answer: 'We are not a law firm and do not provide legal advice. Our service provides high-quality, compliant legal documents and tools. For complex situations or specific legal advice, we always recommend consulting with a qualified lawyer.'
    },
    {
        question: 'What format do the documents come in?',
        answer: 'All our documents are available for immediate download in both Microsoft Word (.docx) and PDF formats, allowing for easy editing and universal compatibility.'
    }
];


export const templates = [
    { key: 'client-agreement', name: 'Client Service Agreement', description: 'Define the terms of your client relationships.' },
    { key: 'nda', name: 'Non-Disclosure Agreement', description: 'Protect your confidential information.' },
];

export const savedDocuments = [];

export const risks: Risk[] = [];