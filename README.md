
# ThermoNexus — Microbolometer Learning & Signal Analysis

**ThermoNexus** is a web-based educational application designed to help users understand the electro-thermal response of MEMS microbolometers and explore numerical data through interactive visualizations.


## Overview

Microbolometers are thermal infrared sensors that detect incoming radiation through temperature-dependent changes in their sensing elements. Understanding their thermal response is important for sensor modeling, characterization, and analysis.

ThermoNexus provides a simple platform to explore fundamental concepts and visualize time-series data using CSV files, interactive charts, and basic statistical measurements.

## Features

### 1. Interactive Home Page
- Introduction to ThermoNexus and its objectives.
- Overview of microbolometer technology.
- Navigation to learning resources and analysis tools.

### 2. Knowledge Hub
- Introduction to microbolometer fundamentals.
- Basic concepts of electro-thermal modeling.
- Explanation of thermal capacitance, thermal conductance, and temperature response.
- Simplified mathematical representation of a microbolometer's thermal behavior.

### 3. ThermoAnalyze
- Upload datasets in CSV format.
- Select numerical columns for visualization.
- Plot time-series data using interactive charts.
- Calculate minimum, maximum, mean, and signal change.
- Export selected data as a CSV file.
- Analyze datasets directly in the browser.

### 4. Responsive User Interface
- Modern dark-themed interface.
- Navigation between Home, Knowledge Hub, ThermoAnalyze, and About.
- Responsive layout for different screen sizes.

## Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend UI development |
| Vite | Development server and build tool |
| JavaScript | Application logic |
| CSS | Styling and responsive design |
| Recharts | Interactive charts |
| Papa Parse | CSV file parsing |
| Lucide React | Icons |

## Scientific Background

A simplified lumped thermal model of a microbolometer can be expressed as:

\[
C_{th}\frac{dT}{dt}=P_{in}-G_{th}(T-T_{amb})
\]

Where:

- **C_th:** Effective thermal capacitance.
- **T:** Temperature of the sensing element.
- **P_in:** Absorbed thermal power.
- **G_th:** Effective thermal conductance.
- **T_amb:** Ambient temperature.

The equation describes the balance between absorbed thermal power and heat loss to the surroundings. It provides a conceptual foundation for understanding the thermal response of a microbolometer.

## How It Works

1. **Learn:** Explore microbolometer concepts through the Knowledge Hub.
2. **Upload:** Import a CSV file containing numerical data.
3. **Select:** Choose the columns to visualize.
4. **Analyze:** Examine interactive plots and basic statistical values.
5. **Export:** Download the selected data for further analysis.

The current version focuses on educational exploration and basic data analysis. It does not execute a physics-based microbolometer simulation.

## Getting Started

### Prerequisites

- Node.js and npm
- Git (optional)
- Visual Studio Code or another code editor

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/tanisha4846/ThermoNexus.git
```

**2. Navigate to the project directory**

```bash
cd ThermoNexus
```

**3. Install dependencies**

```bash
npm install
npm install recharts papaparse lucide-react
```

**4. Start the development server**

```bash
npm run dev
```

Open the local URL shown in your terminal, usually:

`http://localhost:5173`

### Production Build

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

The production-ready files will be generated in the `dist` directory.

## Sample CSV Format

ThermoNexus supports CSV files containing numerical columns.

```csv
Time,Temperature
0,25.0
1,25.4
2,26.1
3,26.7
4,27.0
```

*Note: These values are illustrative sample data, not experimental measurements or original MATLAB/Simulink output.*

For best results, use a CSV file with a header row and numerical values in the columns selected for plotting.

## Privacy and Data Handling

CSV parsing and visualization are performed locally in the browser in the current implementation. A custom backend server is not required for the analysis workflow.

## Current Scope and Limitations

- Supports CSV-based data analysis and visualization.
- Provides basic descriptive statistics.
- Does not currently run MATLAB/Simulink simulations.
- Does not automatically validate sensor models or experimental results.
- Does not currently include a backend, database, or user authentication.
- Uses sample data for demonstration where applicable.

## Future Enhancements

- Configurable electro-thermal response simulation.
- Thermal time-constant estimation and curve fitting.
- Signal filtering and noise analysis.
- Comparison of multiple datasets.
- Import workflows for MATLAB/Simulink output.
- Downloadable analysis reports.
- Optional backend and user accounts for saving projects.

These are potential future enhancements and are not implemented features of the current version.

## Research Context

ThermoNexus was inspired by my exposure to MEMS microbolometer electro-thermal modeling and simulation during a research internship at the Solid State Physics Laboratory (SSPL), DRDO.

The project aims to make related concepts more accessible through an interactive web interface while applying frontend development and data visualization skills.

**Disclaimer:** ThermoNexus is an independent educational project. It is not an official DRDO application and is not intended to replace validated engineering simulation tools.

## Author

**Tanisha**  
B.Tech, Instrumentation and Control Engineering  
Dr. B. R. Ambedkar National Institute of Technology, Jalandhar

---

*ThermoNexus — Connecting thermal sensing concepts with interactive data exploration.*
