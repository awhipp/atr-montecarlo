import React, { useState } from 'react';

interface SimulationFormProps {
  onSubmit: (params: {
    currentPrice: number;
    atr: number;
    rangePrice: number;
    days: number;
    iterations: number;
  }) => void;
  isLoading: boolean;
}

const SimulationForm: React.FC<SimulationFormProps> = ({ onSubmit, isLoading }) => {
  const [currentPrice, setCurrentPrice] = useState<number>(100);
  const [atr, setAtr] = useState<number>(5);
  const [rangePrice, setRangePrice] = useState<number>(15);
  const [days, setDays] = useState<number>(15);
  const [iterations, setIterations] = useState<number>(100000);

  // Calculate upper and lower bounds for display
  const upperBound = currentPrice + rangePrice;
  const lowerBound = currentPrice - rangePrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      currentPrice,
      atr,
      rangePrice,
      days,
      iterations,
    });
  };

  // Handle input focus to improve mobile UX - scroll into view when focusing on inputs
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Add a small delay to ensure the virtual keyboard is open before scrolling
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  return (
    <div className="simulation-form-container">
      <h2>Monte Carlo Price Simulation</h2>
      <form onSubmit={handleSubmit} className="simulation-form">
        <div className="form-group">
          <label htmlFor="currentPrice">Current Price:</label>
          <input
            id="currentPrice"
            type="number"
            step="0.01"
            value={currentPrice}
            onChange={e => setCurrentPrice(parseFloat(e.target.value) || 0)}
            onFocus={handleInputFocus}
            inputMode="decimal"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="atr">Average True Range (ATR):</label>
          <input
            id="atr"
            type="number"
            step="0.01"
            value={atr}
            onChange={e => setAtr(parseFloat(e.target.value) || 0)}
            onFocus={handleInputFocus}
            inputMode="decimal"
            required
          />
          <small>Daily price volatility measure</small>
        </div>

        <div className="form-group">
          <label htmlFor="rangePrice">Price Range:</label>
          <input
            id="rangePrice"
            type="number"
            step="0.01"
            value={rangePrice}
            onChange={e => setRangePrice(parseFloat(e.target.value) || 0)}
            onFocus={handleInputFocus}
            inputMode="decimal"
            required
          />
          <small>Range from current price (±) for given strategy</small>
        </div>

        <div className="form-group range-display">
          <div className="bound-info">
            <span>Lower Bound: {lowerBound.toFixed(2)}</span>
            <span>Upper Bound: {upperBound.toFixed(2)}</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="days">Time Horizon (Days):</label>
          <input
            id="days"
            type="number"
            min="1"
            max="365"
            value={days}
            onChange={e => setDays(parseInt(e.target.value) || 0)}
            onFocus={handleInputFocus}
            inputMode="numeric"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="iterations">Simulation Iterations:</label>
          <input
            id="iterations"
            type="number"
            min="100"
            max="1000000"
            step="100"
            value={iterations}
            onChange={e => setIterations(parseInt(e.target.value) || 100)}
            onFocus={handleInputFocus}
            inputMode="numeric"
            required
          />
          <small>Higher values give more accurate results but are slower</small>
          <small className="mobile-notice">
            On mobile devices, consider using 10,000 or fewer iterations for better performance
          </small>
        </div>

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Running Simulation...' : 'Run Simulation'}
        </button>
      </form>
    </div>
  );
};

export default SimulationForm;
