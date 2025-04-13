import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getTargetReachedStats } from '../utils/monteCarloSimulation';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface SimulationResultsProps {
  result?: {
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
  };
  currentPrice: number;
  rangePrice: number;
  days: number;
}

const SimulationResults: React.FC<SimulationResultsProps> = ({
  result,
  currentPrice,
  rangePrice,
  days,
}) => {
  if (!result) return null;

  const {
    probabilityUpper,
    probabilityLower,
    probabilityCombined,
    paths,
    successPathsUpper,
    successPathsLower,
    successPathsCombined,
    totalPaths,
    daysToTargetUpper,
    daysToTargetLower,
    upperBound,
    lowerBound,
  } = result;

  // Prepare data for chart
  const labels = Array.from({ length: days + 1 }, (_, i) => i.toString());

  // Sample paths to display (showing all paths can be overwhelming)
  const sampleSize = Math.min(50, paths.length);
  const samplePaths = paths.slice(0, sampleSize);

  // Determine which paths hit a bound (successful) - checking if any price in the path reaches or exceeds the bounds
  const successfulPaths = samplePaths.map(path =>
    path.some(price => price >= upperBound || price <= lowerBound)
  );

  // Set colors based on success - light green for successful paths, light red for unsuccessful
  const colors = samplePaths.map(
    (_, index) =>
      successfulPaths[index]
        ? 'rgba(144, 238, 144, 0.5)' // Light green for successful paths
        : 'rgba(255, 182, 193, 1)' // Light red for unsuccessful paths
  );

  // Find first indices of successful and unsuccessful paths to use for labels
  const firstSuccessfulIndex = successfulPaths.findIndex(success => success === true);
  const firstUnsuccessfulIndex = successfulPaths.findIndex(success => success === false);

  const chartData: ChartData<'line'> = {
    labels,
    datasets: [
      // Sample paths
      ...samplePaths.map((path, index) => ({
        label:
          index === firstSuccessfulIndex && firstSuccessfulIndex !== -1
            ? 'Successful Paths'
            : index === firstUnsuccessfulIndex && firstUnsuccessfulIndex !== -1
              ? 'Unsuccessful Paths'
              : undefined,
        data: path,
        borderColor: colors[index],
        backgroundColor: colors[index],
        borderWidth: 1,
        pointRadius: 0,
        showLine: true,
        hidden: false,
      })),
      // Upper bound line
      {
        label: 'Bounds', // Hide label for upper bound line
        data: Array(days + 1).fill(upperBound),
        borderColor: 'rgba(0, 0, 0, 0.6)',
        backgroundColor: 'black',
        borderWidth: 2,
        borderDash: [1, 1],
        pointRadius: 0,
      },
      // Lower bound line
      {
        label: undefined, // Hide label for upper bound line
        data: Array(days + 1).fill(lowerBound),
        borderColor: 'rgba(0, 0, 0, 0.6)',
        backgroundColor: 'black',
        borderWidth: 2,
        borderDash: [1, 1],
        pointRadius: 0,
      },
      // Starting price point
      {
        label: undefined, // Hide label for current price point
        data: [currentPrice, ...Array(days).fill(null)],
        borderColor: 'rgba(0, 128, 0, 1)',
        backgroundColor: 'rgba(0, 128, 0, 1)',
        borderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        showLine: false,
      },
    ],
  };

  // Make sure both successful and unsuccessful paths have labels in the legend
  if (!samplePaths.some((_, index) => successfulPaths[index])) {
    // If there are no successful paths in the sample, add a dummy entry to show in legend
    chartData.datasets.push({
      label: 'Successful Paths',
      data: [],
      borderColor: 'rgba(144, 238, 144, 0.6)',
      backgroundColor: 'transparent',
      borderWidth: 1,
      pointRadius: 0,
      showLine: true,
      hidden: true,
    });
  }

  if (!samplePaths.some((_, index) => !successfulPaths[index])) {
    // If there are no unsuccessful paths in the sample, add a dummy entry to show in legend
    chartData.datasets.push({
      label: 'Unsuccessful Paths',
      data: [],
      borderColor: 'rgba(255, 182, 193, 0.6)',
      backgroundColor: 'transparent',
      borderWidth: 1,
      pointRadius: 0,
      showLine: true,
      hidden: true,
    });
  }

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          filter: item => item.text !== undefined,
          // Smaller font for mobile
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
          boxWidth: window.innerWidth < 768 ? 12 : 40,
          padding: window.innerWidth < 768 ? 8 : 10,
        },
      },
      title: {
        display: true,
        text: 'Monte Carlo Simulation of Price Paths',
        font: {
          size: window.innerWidth < 768 ? 14 : 16,
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          // Limit the number of decimal places in tooltips
          label: function (context) {
            if (context.parsed.y !== null) {
              return `${context.dataset.label || ''}: ${context.parsed.y.toFixed(2)}`;
            }
            return '';
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Days',
          font: {
            size: window.innerWidth < 768 ? 12 : 14,
          },
        },
        ticks: {
          maxRotation: window.innerWidth < 768 ? 45 : 0,
          autoSkip: true,
          maxTicksLimit: window.innerWidth < 768 ? 7 : 10,
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price',
          font: {
            size: window.innerWidth < 768 ? 12 : 14,
          },
        },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
      },
    },
  };

  // Calculate statistics about when targets were reached
  const upperTargetStats = getTargetReachedStats(daysToTargetUpper);
  const lowerTargetStats = getTargetReachedStats(daysToTargetLower);

  return (
    <div className="simulation-results">
      <h2>Simulation Results</h2>

      <div className="result-summary">
        <div className="result-card probability">
          <h3>Probability Not Hit</h3>
          <div className="result-value">
            {(((totalPaths - successPathsCombined) / totalPaths) * 100).toFixed(2)}%
          </div>
          <div className="result-detail">
            {totalPaths - successPathsCombined} paths never hit either bound
          </div>
        </div>

        <div className="result-card upper-bound">
          <h3>Upper Bound ({upperBound.toFixed(2)})</h3>
          <div className="result-value">{probabilityUpper.toFixed(2)}%</div>
          <div className="result-detail">{successPathsUpper} paths hit upper bound</div>
        </div>

        <div className="result-card lower-bound">
          <h3>Lower Bound ({lowerBound.toFixed(2)})</h3>
          <div className="result-value">{probabilityLower.toFixed(2)}%</div>
          <div className="result-detail">{successPathsLower} paths hit lower bound</div>
        </div>
      </div>

      {successPathsUpper > 0 && (
        <div className="result-card time-stats">
          <h3>Days to Reach Upper Bound</h3>
          <div className="time-stats-grid">
            <div>
              <div className="stat-label">Min</div>
              <div className="stat-value">{upperTargetStats.min}</div>
            </div>
            <div>
              <div className="stat-label">Avg</div>
              <div className="stat-value">{upperTargetStats.avg.toFixed(1)}</div>
            </div>
            <div>
              <div className="stat-label">Median</div>
              <div className="stat-value">{upperTargetStats.median}</div>
            </div>
            <div>
              <div className="stat-label">Max</div>
              <div className="stat-value">{upperTargetStats.max}</div>
            </div>
          </div>
        </div>
      )}

      {successPathsLower > 0 && (
        <div className="result-card time-stats">
          <h3>Days to Reach Lower Bound</h3>
          <div className="time-stats-grid">
            <div>
              <div className="stat-label">Min</div>
              <div className="stat-value">{lowerTargetStats.min}</div>
            </div>
            <div>
              <div className="stat-label">Avg</div>
              <div className="stat-value">{lowerTargetStats.avg.toFixed(1)}</div>
            </div>
            <div>
              <div className="stat-label">Median</div>
              <div className="stat-value">{lowerTargetStats.median}</div>
            </div>
            <div>
              <div className="stat-label">Max</div>
              <div className="stat-value">{lowerTargetStats.max}</div>
            </div>
          </div>
        </div>
      )}

      <div className="chart-container">
        <Line data={chartData} options={chartOptions} height={400} />
      </div>

      <div className="interpretation">
        <h3>Strategy Interpretation</h3>
        <p>
          Based on the Monte Carlo simulation with {totalPaths} iterations, starting from a current
          price of <strong>{currentPrice}</strong> with a range of <strong>±{rangePrice}</strong>{' '}
          and Average True Range (ATR) of{' '}
          {paths.length > 0 ? Math.abs(paths[0][1] - paths[0][0]).toFixed(2) : 'N/A'}:
        </p>
        <ul>
          <li>
            The price has a <strong>{probabilityCombined.toFixed(2)}%</strong> probability of
            reaching either bound within {days} days.
          </li>
          <li>
            The probability of hitting the upper bound ({upperBound.toFixed(2)}) is{' '}
            <strong>{probabilityUpper.toFixed(2)}%</strong>.
          </li>
          <li>
            The probability of hitting the lower bound ({lowerBound.toFixed(2)}) is{' '}
            <strong>{probabilityLower.toFixed(2)}%</strong>.
          </li>
        </ul>
        {successPathsUpper > 0 && (
          <p>
            For the upper bound, it was reached in as few as {upperTargetStats.min} days, with an
            average of {upperTargetStats.avg.toFixed(1)} days.
          </p>
        )}
        {successPathsLower > 0 && (
          <p>
            For the lower bound, it was reached in as few as {lowerTargetStats.min} days, with an
            average of {lowerTargetStats.avg.toFixed(1)} days.
          </p>
        )}
      </div>
    </div>
  );
};

export default SimulationResults;
