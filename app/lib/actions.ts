
"use client";

import { Dispatch } from "react";
import { Action, AppState, Page } from "./types";
import { healthCheckQuestions } from "@/app/components/data";
import jspdf from 'jspdf';
import html2canvas from 'html2canvas';

export const showToast = (dispatch: Dispatch<Action>, message: string, type: 'success' | 'info' | 'error' = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } });
    setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: id });
    }, duration);
};

export const navigateTo = (dispatch: Dispatch<Action>, page: Page, options: { blog?: { currentPostId: string | null } } = {}) => {
    dispatch({ type: 'SET_PAGE', payload: page });
    if (options.blog) {
        dispatch({ type: 'SET_BLOG_STATE', payload: options.blog });
    }
    window.scrollTo(0, 0);
};

export const handleAnswerQuestion = (dispatch: Dispatch<Action>, state: AppState, questionId: string, answer: string) => {
    if (state.healthCheck.isTransitioning) return;
    
    const newAnswers = { ...state.healthCheck.answers, [questionId]: answer };
    dispatch({ type: 'SET_HEALTH_CHECK_ANSWERS', payload: newAnswers });
    dispatch({ type: 'SET_HEALTH_CHECK_TRANSITIONING', payload: true });

    setTimeout(() => {
        const currentStep = state.healthCheck.currentStep;
        if (currentStep < healthCheckQuestions.length - 1) {
            dispatch({ type: 'SET_HEALTH_CHECK_STEP', payload: currentStep + 1 });
        } else {
             // Go to email capture page before showing results
            navigateTo(dispatch, 'results');
        }
        dispatch({ type: 'SET_HEALTH_CHECK_TRANSITIONING', payload: false });
    }, 400);
};

export const handleGetRiskAnalysis = async (dispatch: Dispatch<Action>, answers: Record<string, string>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'riskAnalysis', payload: { answers } })
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.error || 'Failed to get risk analysis');
        }

        const jsonResponse = await response.json();
        dispatch({ type: 'SET_RESULTS', payload: jsonResponse });
        
    } catch (e: any) {
        dispatch({ type: 'SET_ERROR', payload: { type: 'api', message: e.message } });
    } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
    }
};

export const initiateCheckout = async (dispatch: Dispatch<Action>, priceId: string, mode: 'subscription' | 'payment', userEmail: string) => {
    dispatch({ type: 'SET_CURRENT_PROCESS', payload: mode === 'subscription' ? 'subscribing' : 'purchasing' });

    try {
        const response = await fetch('/api/checkout-sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priceId, userEmail, mode }),
        });

        if (!response.ok) throw new Error(await response.text());

        const session = await response.json();
        window.location.href = session.url;

    } catch (error: any) {
        dispatch({ type: 'SET_CURRENT_PROCESS', payload: null });
        dispatch({ type: 'SET_ERROR', payload: { type: 'checkout', message: error.message } });
        showToast(dispatch, `Checkout Error: ${error.message}`, 'error');
    }
};

export const handleGenerateDocument = async (dispatch: Dispatch<Action>, state: AppState) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'docGeneration',
                payload: { 
                    templateKey: state.docStudio.selectedTemplate,
                    formData: state.docStudio.formData 
                }
            })
        });

        if (!response.ok) throw new Error(await response.text());
        
        const { generatedDoc } = await response.json();
        dispatch({
            type: 'SET_DOC_STUDIO_STATE',
            payload: { generatedDoc, view: 'preview', isSaved: false }
        });

    } catch (e: any) {
        showToast(dispatch, `Error: ${e.message}`, 'error');
    } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
    }
};

export const handleDownloadPdf = async (dispatch: Dispatch<Action>) => {
    const element = document.getElementById('doc-preview-content');
    if (!element) return;
    
    showToast(dispatch, 'Preparing your PDF...', 'info');

    element.classList.add('pdf-capture');
    
    try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        const pdfImgHeight = pdfWidth / ratio;
        let heightLeft = pdfImgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();

        while (heightLeft > 0) {
            position -= pdf.internal.pageSize.getHeight();
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImgHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
        }
        
        pdf.save('Legally-Legit-Document.pdf');
        showToast(dispatch, 'Your PDF has been downloaded!', 'success');
    } catch(e) {
        console.error(e);
        showToast(dispatch, 'Could not generate PDF.', 'error');
    } finally {
        element.classList.remove('pdf-capture');
    }
};
