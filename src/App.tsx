import React, { useState } from 'react';
import './App.css';
import SimulationForm from './components/SimulationForm';
import SimulationResults from './components/SimulationResults';
import { runMonteCarloSimulation } from './utils/monteCarloSimulation';

// Define a proper interface for simulation results
interface SimulationResult {
  probabilityUpper: number;
  probabilityLower: number;
  probabilityCombined: number;
  paths: number[][];
  successPathsUpper: number;
  successPathsLower: number;
  successPathsCombined: number;
  totalPaths: number;
  daysToTargetUpper: number[];
  daysToTargetLower: number[];
  upperBound: number;
  lowerBound: number;
}

function App() {
  const [simulationParams, setSimulationParams] = useState({
    currentPrice: 0,
    atr: 0,
    rangePrice: 0,
    days: 0,
    iterations: 0,
  });

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulationSubmit = (params: {
    currentPrice: number;
    atr: number;
    rangePrice: number;
    days: number;
    iterations: number;
  }) => {
    setIsLoading(true);
    setSimulationParams(params);

    // Use setTimeout to prevent UI from freezing during calculation
    setTimeout(() => {
      const result = runMonteCarloSimulation(params);
      setSimulationResult(result);
      setIsLoading(false);
    }, 0);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Montecarlo Simulated ATR Price Calculator</h1>
        <p className="App-description">
          Estimate the price probability of hitting either side of a range using Monte Carlo
          simulation.
        </p>
      </header>

      <main className="App-main">
        <div className="form-section">
          <SimulationForm onSubmit={handleSimulationSubmit} isLoading={isLoading} />
        </div>

        {simulationResult && (
          <div className="results-section">
            <SimulationResults
              result={simulationResult}
              currentPrice={simulationParams.currentPrice}
              rangePrice={simulationParams.rangePrice}
              days={simulationParams.days}
            />
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>
          <a href="https://github.com/awhipp/atr-montecarlo" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
