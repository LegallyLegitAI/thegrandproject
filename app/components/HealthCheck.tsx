"use client";

import React from 'react';
import { useStateContext } from '@/app/lib/state';
import { healthCheckQuestions } from './data';
import { Icon } from './Icon';
import { handleAnswerQuestion } from '@/app/lib/actions';

export default function HealthCheck() {
  const { state, dispatch } = useStateContext();
  const { currentStep, answers, isTransitioning } = state.healthCheck;
  const question = healthCheckQuestions[currentStep];
  const progress = ((currentStep + 1) / healthCheckQuestions.length) * 100;

  const onAnswer = (questionId: string, answer: string) => {
    handleAnswerQuestion(dispatch, state, questionId, answer);
  };

  const handlePreviousQuestion = () => {
    if (currentStep > 0) {
      dispatch({ type: 'SET_HEALTH_CHECK_STEP', payload: currentStep - 1 });
    }
  };

  return (
    <div className="wizard-container card">
      <div className="wizard-header">
        <h2>Legal Health Check</h2>
        <p>{`Question ${currentStep + 1} of ${healthCheckQuestions.length}`}</p>
      </div>
      <div className="progress-bar">
        <div className="progress-bar-inner" style={{ width: `${progress}%` }} />
      </div>
      <div className={`question-content ${isTransitioning ? 'fade-out' : 'fade-in'}`} key={question.id}>
        <div className="section-header">
          <Icon name={question.icon as any} /> {question.section}
        </div>
        <h3 className="question-title">{question.question}</h3>
        <div className="options-grid">
          {question.options.map(option => (
            <label key={option.value} className="option-label">
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={answers[question.id] === option.value}
                onChange={() => onAnswer(question.id, option.value)}
              />
              <span className="option-text">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="wizard-navigation">
        <button
          className="btn btn-secondary"
          onClick={handlePreviousQuestion}
          disabled={currentStep === 0 || isTransitioning}
        >
          Previous
        </button>
        <div />
      </div>
    </div>
  );
}
