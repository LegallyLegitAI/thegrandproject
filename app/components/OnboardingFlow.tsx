// components/OnboardingFlow.tsx
export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  
  return (
    <div className="card">
      {step === 1 && <BusinessDetails onNext={() => setStep(2)} />}
      {step === 2 && <LegalDisclaimer onAccept={() => setStep(3)} />}
      {step === 3 && <RiskAssessment onComplete={() => setStep(4)} />}
      {step === 4 && <Dashboard />}
    </div>
  );
}