// components/RiskDashboard.tsx
export default function RiskDashboard({ score }: { score: number }) {
  return (
    <div className="card">
      <h2>Your Compliance Health Score</h2>
      <div className="score-circle">
        <span className="score-value">{score}</span>
        <span className="score-label">OUT OF 100</span>
      </div>
      
      <div className="risk-list">
        <RiskCard 
          title="Employment Contracts" 
          severity="High" 
          action="Upload signed contracts"
        />
        <RiskCard 
          title="Privacy Policy" 
          severity="Medium" 
          action="Update policy to meet 2023 requirements"
        />
      </div>
    </div>
  );
}