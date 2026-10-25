# ThermoNexus MVP

A frontend-only educational microbolometer knowledge site and CSV response analyzer built with React, Vite, Recharts, Papa Parse, and Lucide React.

## Run locally

```powershell
npm install
npm run dev
```

If you created the project with Vite first, install dependencies:

```powershell
npm install recharts papaparse lucide-react
```

## Features
- Home dashboard and navigation
- Knowledge Hub: microbolometer basics, components, working principle, simplified electro-thermal model, parameters, applications and limitations
- ThermoAnalyze: illustrative sample dataset, CSV upload, numeric column selection, interactive time-series chart, descriptive statistics, and export of plotted data
- About page describing scope and limitations

## CSV format
Use a header row with at least two numeric columns and at least two valid rows. Example:

```csv
time_s,temperature_C
0,22
0.05,22.98
0.10,23.86
```

The app attempts to use all-numeric columns and excludes rows with missing or non-numeric values in those columns. It runs in the browser; files are not sent to a server.

## Important limitations
- The built-in sample values are illustrative and are not experimental measurements.
- The analyzer computes descriptive statistics, not validated device parameters.
- It does not reproduce or validate a particular MATLAB/Simulink model.
- No backend, account system, or database is included in this MVP.
- Technical content is introductory. Verify primary literature and device-specific details before using it in a formal report.

## Deploy
Push the project to a Git repository and import it into Vercel. Use the default Vite settings: build command `npm run build`, output directory `dist`.
