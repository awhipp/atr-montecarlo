/**
 * Monte Carlo simulation utility for price movement based on Average True Range (ATR)
 */

interface SimulationParams {
  currentPrice: number;
  atr: number;
  rangePrice: number;
  days: number;
  iterations: number;
}

interface SimulationResult {
  probabilityUpper: number; // Probability of hitting upper bound
  probabilityLower: number; // Probability of hitting lower bound
  probabilityCombined: number; // Probability of hitting either bound
  paths: number[][];
  successPathsUpper: number; // Paths hitting upper bound
  successPathsLower: number; // Paths hitting lower bound
  successPathsCombined: number; // Paths hitting either bound
  totalPaths: number;
  daysToTargetUpper: number[]; // Days to hit upper bound
  daysToTargetLower: number[]; // Days to hit lower bound
  upperBound: number; // Upper bound value
  lowerBound: number; // Lower bound value
}

/**
 * Runs a Monte Carlo simulation to determine the probability of a price
 * reaching either end of a range within a given timeframe based on ATR.
 */
export const runMonteCarloSimulation = (params: SimulationParams): SimulationResult => {
  const { currentPrice, atr, rangePrice, days, iterations } = params;
  
  // Calculate upper and lower bounds
  const upperBound = currentPrice + rangePrice;
  const lowerBound = currentPrice - rangePrice;
  
  // Initialize simulation result
  const paths: number[][] = [];
  let successPathsUpper = 0;
  let successPathsLower = 0;
  let successPathsCombined = 0;
  const daysToTargetUpper: number[] = [];
  const daysToTargetLower: number[] = [];
  
  // Run the simulation for the specified number of iterations
  for (let i = 0; i < iterations; i++) {
    const path = [currentPrice];
    let upperReached = false;
    let lowerReached = false;
    let dayUpperReached = -1;
    let dayLowerReached = -1;
    let pathCounted = false; // Flag to track if this path has been counted in the combined total
    
    // Simulate price movement for each day
    for (let day = 0; day < days; day++) {
      // Generate random movement based on ATR 
      // Using normal distribution with mean 0 and standard deviation of ATR
      // Box-Muller transform to generate normally distributed random numbers
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const priceMove = z * atr;
      
      // Calculate new price
      const newPrice = path[path.length - 1] + priceMove;
      path.push(newPrice);
      
      // Check if upper bound is reached
      if (!upperReached && newPrice >= upperBound) {
        upperReached = true;
        dayUpperReached = day + 1;
        successPathsUpper++;
        daysToTargetUpper.push(dayUpperReached);
        
        // If this path hasn't been counted yet in the combined total, count it
        if (!pathCounted) {
          successPathsCombined++;
          pathCounted = true;
        }
      }
      
      // Check if lower bound is reached
      if (!lowerReached && newPrice <= lowerBound) {
        lowerReached = true;
        dayLowerReached = day + 1;
        successPathsLower++;
        daysToTargetLower.push(dayLowerReached);
        
        // If this path hasn't been counted yet in the combined total, count it
        if (!pathCounted) {
          successPathsCombined++;
          pathCounted = true;
        }
      }
      
      // If both bounds are already reached, no need to check again for this path
      if (upperReached && lowerReached) {
        break;
      }
    }
    
    paths.push(path);
  }
  
  // Calculate probability of reaching target prices
  const probabilityUpper = (successPathsUpper / iterations) * 100;
  const probabilityLower = (successPathsLower / iterations) * 100;
  const probabilityCombined = (successPathsCombined / iterations) * 100;
  
  return {
    probabilityUpper,
    probabilityLower,
    probabilityCombined,
    paths,
    successPathsUpper,
    successPathsLower,
    successPathsCombined,
    totalPaths: iterations,
    daysToTargetUpper,
    daysToTargetLower,
    upperBound,
    lowerBound
  };
};

/**
 * Get descriptive statistics about when the target was reached
 */
export const getTargetReachedStats = (daysToTarget: number[]) => {
  if (daysToTarget.length === 0) return { min: 0, max: 0, avg: 0, median: 0 };
  
  // Sort the array for calculating median
  const sorted = [...daysToTarget].sort((a, b) => a - b);
  
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sorted.reduce((sum, day) => sum + day, 0) / sorted.length,
    median: sorted.length % 2 === 0 
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]
  };
};