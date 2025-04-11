# ATR Monte Carlo Price Simulator

This application simulates potential price movements using Monte Carlo simulation based on Average True Range (ATR). It helps traders and investors estimate the probability of a price reaching specific targets within a given timeframe.

[![Lint Code](https://github.com/awhipp/atr-montecarlo/actions/workflows/lint.yml/badge.svg)](https://github.com/awhipp/atr-montecarlo/actions/workflows/lint.yml)

[![Dependabot Updates](https://github.com/awhipp/atr-montecarlo/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/awhipp/atr-montecarlo/actions/workflows/dependabot/dependabot-updates)

## What This Tool Does

This simulator allows you to:

- Estimate the probability of a price reaching upper or lower bounds based on ATR volatility
- Visualize potential price paths through Monte Carlo simulations
- Calculate how long it might take for price to reach target levels
- Make more informed trading decisions by understanding the probability of price movements

## How to Use

1. Enter your current price
2. Input the ATR (Average True Range) value
3. Specify the price range to test (how far above/below current price)
4. Set the number of days to simulate
5. Choose how many iterations (simulations) to run
6. Submit to see the probability results and visualizations

## Getting Started

### `npm start`

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to use the simulator in your browser.

### `npm run build`

Creates a production-ready version for deployment.

## About Monte Carlo Simulations

Monte Carlo simulations use random sampling to model the probability of different outcomes. This tool applies this technique to financial markets by:

1. Starting with the current price
2. Applying random daily price movements based on ATR volatility
3. Running thousands of simulations to find probability patterns
4. Calculating how often price reaches target levels
