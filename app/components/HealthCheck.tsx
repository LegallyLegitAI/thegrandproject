'use client';

import { useStateContext } from '@/app/lib/state';
import { handleAnswerQuestion } from '@/app/lib/actions';
import { questions } from './data';
import { Button, Progress } from './common';

export default function HealthCheck() {
  const { state, dispatch } = useStateContext();
  const { healthCheckStep } = state;
  // Use optional chaining for safety in case `questions` is not yet loaded.
  const currentQuestion = questions?.[healthCheckStep];

  const onAnswer = (questionId: string, answer: string) => {
    handleAnswerQuestion(dispatch, state, questionId, answer, questions);
  };

  const handlePreviousQuestion = () => {
    if (healthCheckStep > 0) {
      dispatch({ type: 'SET_HEALTH_CHECK_STEP', payload: healthCheckStep - 1 });
    }
  };

  // Guard Clause: If there's no current question, show a loading state.
  // This prevents the component from crashing if the data is not ready.
  if (!currentQuestion) {
    return <div className="health-check-container">Loading...</div>;
  }

  const progress = ((healthCheckStep + 1) / questions.length) * 100;

  return (
    <div className="health-check-container">
      <Progress value={progress} />
      <div className="question-card">
        <h2 className="question-title">{currentQuestion.text}</h2>
        <div className="options-grid">
          {currentQuestion.options.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              onClick={() => onAnswer(currentQuestion.id, option.value)}
            >
              {option.text}
            </Button>
          ))}
        </div>
      </div>
      <div className="navigation-buttons">
        {healthCheckStep > 0 && (
          <Button variant="ghost" onClick={handlePreviousQuestion}>
            Previous
          </Button>
        )}
      </div>
    </div>
  );
}
