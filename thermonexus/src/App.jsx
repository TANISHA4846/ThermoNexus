import { useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import {
  Activity, ArrowDownToLine, ArrowRight, BookOpen, CheckCircle2, ChevronRight,
  CircleHelp, Cpu, Database, FileSpreadsheet, Gauge, Home, Info, Layers3,
  Menu, Microscope, Radio, ShieldCheck, Thermometer, Upload, Waves, X
} from "lucide-react";
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";

const sampleRows = Array.from({ length: 41 }, (_, i) => {
  const time = i * 0.05;
  const temperature = 22 + 8 * (1 - Math.exp(-time / 0.38));
  const resistance = 100000 * (1 - 0.018 * (1 - Math.exp(-time / 0.38)));
  const voltage = 1.2 + 0.16 * (1 - Math.exp(-time / 0.38));
  return {
    time_s: Number(time.toFixed(2)),
    temperature_C: Number(temperature.toFixed(3)),
    resistance_ohm: Number(resistance.toFixed(2)),
    voltage_V: Number(voltage.toFixed(4))
  };
});

const initialColumns = ["time_s", "temperature_C", "resistance_ohm", "voltage_V"];
const columnLabels = {
  time_s: "Time (s)",
  temperature_C: "Temperature (°C)",
  resistance_ohm: "Resistance (Ω)",
  voltage_V: "Voltage (V)"
};

function formatNumber(value, digits = 3) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
}

function StatCard({ label, value, unit, icon: Icon, detail }) {
  return (
    <div className="stat-card">
      <div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={17} /></span></div>
      <div className="stat-value">{value}<small>{unit}</small></div>
      <div className="stat-detail">{detail}</div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState("Home");
  const [mobileNav, setMobileNav] = useState(false);
  const [rows, setRows] = useState(sampleRows);
  const [columns, setColumns] = useState(initialColumns);
  const [timeColumn, setTimeColumn] = useState("time_s");
  const [signalColumn, setSignalColumn] = useState("temperature_C");
  const [fileName, setFileName] = useState("illustrative-response.csv");
  const [uploadError, setUploadError] = useState("");
  const [notice, setNotice] = useState("Illustrative sample data loaded. Upload your own CSV to explore your data.");
  const fileInput = useRef(null);

  const numericColumns = useMemo(() => columns.filter((col) =>
    rows.some((row) => Number.isFinite(Number(row[col])))
  ), [columns, rows]);

  const chartData = useMemo(() => rows
    .map((row) => ({ x: Number(row[timeColumn]), y: Number(row[signalColumn]) }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
    .sort((a, b) => a.x - b.x), [rows, timeColumn, signalColumn]);

  const stats = useMemo(() => {
    if (!chartData.length) return null;
    const values = chartData.map((point) => point.y);
    const sum = values.reduce((acc, value) => acc + value, 0);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      mean: sum / values.length,
      first: values[0],
      last: values[values.length - 1],
      count: values.length,
      span: chartData[chartData.length - 1].x - chartData[0].x
    };
  }, [chartData]);

  function loadSample() {
    setRows(sampleRows);
    setColumns(initialColumns);
    setTimeColumn("time_s");
    setSignalColumn("temperature_C");
    setFileName("illustrative-response.csv");
    setUploadError("");
    setNotice("Illustrative sample data loaded. These values are for demonstration only, not experimental measurements.");
  }

  function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError("");
    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      dynamicTyping: true,
      complete: (result) => {
        const parsedRows = result.data.filter((row) => row && Object.keys(row).length > 1);
        const parsedColumns = result.meta.fields || [];
        if (result.errors.length || parsedRows.length < 2 || parsedColumns.length < 2) {
          setUploadError("Could not read this CSV. Please use a header row and at least two columns with two or more data rows.");
          return;
        }
        const usableColumns = parsedColumns.filter((column) =>
          parsedRows.some((row) => row[column] !== "" && row[column] !== null && row[column] !== undefined && Number.isFinite(Number(row[column])))
        );
        if (usableColumns.length < 2) {
          setUploadError("Please include at least two numeric columns, such as time_s and temperature_C.");
          return;
        }
        const cleanRows = parsedRows.filter((row) => usableColumns.every((column) =>
          row[column] !== "" && row[column] !== null && row[column] !== undefined && Number.isFinite(Number(row[column]))
        )).map((row) => Object.fromEntries(usableColumns.map((column) => [column, Number(row[column])])));
        if (cleanRows.length < 2) {
          setUploadError("Not enough valid numeric rows after checking the file. Check for missing values or non-numeric cells.");
          return;
        }
        setRows(cleanRows);
        setColumns(usableColumns);
        setTimeColumn(usableColumns[0]);
        setSignalColumn(usableColumns[1]);
        setFileName(file.name);
        setNotice(`Loaded ${cleanRows.length} valid rows from ${file.name}.`);
      },
      error: () => setUploadError("The file could not be read. Try exporting it as a standard UTF-8 CSV.")
    });
    event.target.value = "";
  }

  function exportCsv() {
    if (!chartData.length) return;
    const csv = Papa.unparse(chartData.map((point) => ({
      [timeColumn]: point.x,
      [signalColumn]: point.y
    })));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "thermonexus-processed-data.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const navItems = [
    { name: "Home", icon: Home },
    { name: "Knowledge Hub", icon: BookOpen },
    { name: "ThermoAnalyze", icon: Activity },
    { name: "About", icon: Info }
  ];

  function navigate(name) {
    setPage(name);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand" onClick={() => navigate("Home")} role="button" tabIndex={0}>
          <div className="brand-mark"><Thermometer size={22} /></div>
          <div><div className="brand-name">Thermo<span>Nexus</span></div><div className="brand-subtitle">INFRARED SYSTEMS LAB</div></div>
          <button className="mobile-close icon-button" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map(({ name, icon: Icon }) => (
            <button key={name} className={`nav-item ${page === name ? "active" : ""}`} onClick={() => navigate(name)}>
              <Icon size={18} strokeWidth={1.8} /><span>{name}</span>{page === name && <ChevronRight className="nav-chevron" size={15} />}
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-note">
          <div className="note-icon"><Radio size={17} /></div>
          <div className="note-title">Explore the invisible</div>
          <p>Understand how thermal energy becomes an electrical signal.</p>
          <button onClick={() => navigate("Knowledge Hub")}>Explore the basics <ArrowRight size={14} /></button>
        </div>
        <div className="sidebar-footer"><span className="status-dot" /> Educational demo <span className="version">v1.0</span></div>
      </aside>

      {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}
      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={21} /></button>
          <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{page}</strong></div>
          <div className="topbar-right"><span className="topbar-status"><span className="status-dot" /></span><div className="avatar">TN</div></div>
        </header>

        {page === "Home" && <HomePage navigate={navigate} />}
        {page === "Knowledge Hub" && <KnowledgePage navigate={navigate} />}
        {page === "ThermoAnalyze" && (
          <AnalyzePage
            rows={rows} columns={numericColumns} timeColumn={timeColumn} signalColumn={signalColumn}
            setTimeColumn={setTimeColumn} setSignalColumn={setSignalColumn}
            chartData={chartData} stats={stats} fileName={fileName} notice={notice}
            uploadError={uploadError} fileInput={fileInput} handleUpload={handleUpload}
            loadSample={loadSample} exportCsv={exportCsv}
          />
        )}
        {page === "About" && <AboutPage navigate={navigate} />}
        <footer className="page-footer"><span>THERMONEXUS <span className="footer-sep">/</span> MICROBOLOMETER LEARNING & ANALYSIS</span><span>Built for learning · Results depend on uploaded data</span></footer>
      </main>
    </div>
  );
}

function PageHeading({ eyebrow, title, description, actions }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{actions && <div className="heading-actions">{actions}</div>}</div>;
}

function HomePage({ navigate }) {
  return (
    <div className="page-content">
      <div className="hero">
        <div className="hero-content">
          <div className="hero-pill"><span className="pulse-dot" /> MEMS · INFRARED SENSING · THERMAL RESPONSE</div>
          <h1>See the science<br />behind <span>thermal vision.</span></h1>
          <p className="hero-description">A learning and data exploration workspace for understanding MEMS-based infrared microbolometers — from the physics of detection to response curves.</p>
          <div className="hero-actions">
            <button className="button-primary" onClick={() => navigate("Knowledge Hub")}>Explore the knowledge hub <ArrowRight size={16} /></button>
            <button className="button-secondary" onClick={() => navigate("ThermoAnalyze")}><Activity size={16} /> Open analyzer</button>
          </div>
          <div className="hero-footnote"><ShieldCheck size={15} /> Educational resource · Browser-based data analysis</div>
        </div>
        <div className="hero-visual">
          <div className="visual-grid" />
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="sensor-core"><div className="sensor-inner"><Thermometer size={39} strokeWidth={1.3} /></div></div>
          <div className="sensor-label label-top"><span className="label-line" /> IR RADIATION <b>λ</b></div>
          <div className="sensor-label label-right"><span className="label-line" /> THERMAL RESPONSE</div>
          <div className="visual-readout"><span>PIXEL RESPONSE</span><strong>ΔT <i>→</i> ΔR</strong><small>Thermal energy to resistance change</small></div>
          <div className="visual-coordinate">MEMS / 01</div>
        </div>
      </div>

      <div className="section-intro"><div><div className="eyebrow">YOUR WORKSPACE</div><h2>From fundamentals to response data</h2></div><p>Learn the device, understand the model, then explore a signal.</p></div>
      <div className="feature-grid">
        <button className="feature-card" onClick={() => navigate("Knowledge Hub")}>
          <div className="feature-icon purple"><BookOpen size={21} /></div><div className="feature-number">01 / LEARN</div><h3>Knowledge Hub</h3><p>Explore detector anatomy, operating principles, electro-thermal dynamics and key performance parameters.</p><span className="card-link">Read the fundamentals <ArrowRight size={15} /></span>
        </button>
        <button className="feature-card" onClick={() => navigate("ThermoAnalyze")}>
          <div className="feature-icon teal"><Waves size={21} /></div><div className="feature-number">02 / ANALYZE</div><h3>ThermoAnalyze</h3><p>Upload a time-series CSV, visualize a signal, review summary statistics and export processed data.</p><span className="card-link">Open data analyzer <ArrowRight size={15} /></span>
        </button>
        <button className="feature-card" onClick={() => navigate("About")}>
          <div className="feature-icon amber"><Microscope size={21} /></div><div className="feature-number">03 / DISCOVER</div><h3>Project overview</h3><p>Understand the motivation, intended use and limitations of this educational prototype.</p><span className="card-link">About the project <ArrowRight size={15} /></span>
        </button>
      </div>

      <div className="principle-panel">
        <div className="principle-copy"><div className="eyebrow">THE CORE IDEA</div><h2>Light in.<br /><span>Electrical signal out.</span></h2><p>A microbolometer detects infrared radiation indirectly. Absorbed energy warms a thermally isolated element, changing its resistance. Readout circuitry measures that change to form a thermal image.</p><button className="text-button" onClick={() => navigate("Knowledge Hub")}>Understand the process <ArrowRight size={15} /></button></div>
        <div className="process-flow">
          {[["01","IR absorption","Radiation deposits energy"],["02","Temperature rise","Membrane warms up"],["03","Resistance shift","Thermistor changes"],["04","Readout signal","Circuit measures change"]].map(([n,t,d],i)=><div className="process-step" key={n}><div className="process-node">{i===0?<Waves size={18}/>:i===1?<Thermometer size={18}/>:i===2?<Activity size={18}/>:<Cpu size={18}/>}</div><div className="process-text"><span>STEP {n}</span><strong>{t}</strong><small>{d}</small></div>{i<3&&<div className="process-arrow"><ArrowRight size={15}/></div>}</div>)}
        </div>
      </div>
      <div className="disclaimer-strip"><Info size={17} /><p><strong>Scope note</strong> — ThermoNexus is an educational prototype. The included sample curve is illustrative and is not presented as experimental or original Simulink output.</p></div>
    </div>
  );
}

function KnowledgePage({ navigate }) {
  const [expanded, setExpanded] = useState("working");
  const chapters = [
    { id:"intro", n:"01", title:"What is a microbolometer?", subtitle:"The uncooled infrared detector", body:<><p>A microbolometer is a thermal detector that senses infrared (IR) radiation by measuring the temperature-dependent electrical properties of a tiny absorbing element. Unlike photon detectors, it does not need to convert each photon directly into an electron; instead, absorbed radiation heats a thermally isolated pixel.</p><p>Many modern thermal cameras use microbolometer arrays because they can operate without a cryogenic cooling system. Each pixel responds to incident IR energy, and readout electronics convert the pixel response into image data.</p><div className="callout"><Info size={17}/><span><strong>Key distinction:</strong> the detector responds to heating caused by absorbed IR energy, not to visible light alone.</span></div></> },
    { id:"structure", n:"02", title:"Structure of a detector pixel", subtitle:"The key physical components", body:<><p>A typical MEMS microbolometer pixel is engineered to absorb IR energy while limiting heat loss to the substrate.</p><div className="component-grid">{[["Absorber","Captures incident infrared energy."],["Thermistor","Converts temperature change into resistance change."],["Suspended membrane","Supports sensing material while limiting heat transfer."],["Thermal isolation legs","Provide mechanical support and a controlled thermal path."],["Substrate / ROIC","Supports the array and reads electrical signals."]].map(([a,b])=><div className="component-item" key={a}><span className="component-dot"/><div><strong>{a}</strong><p>{b}</p></div></div>)}</div><p>Exact materials, geometry and layer stacks vary by design. A simplified educational diagram should not be treated as a fabrication drawing.</p></> },
    { id:"working", n:"03", title:"Working principle", subtitle:"From infrared energy to an electrical output", body:<><div className="working-steps">{[["01","Absorption","Incident IR radiation is absorbed by the pixel."],["02","Heating","The absorber and sensing element warm up."],["03","Resistance change","A temperature-sensitive material changes resistance."],["04","Readout","Bias and readout circuits measure the resulting electrical change."]].map(([n,t,d])=><div className="working-step" key={n}><div>{n}</div><section><strong>{t}</strong><p>{d}</p></section></div>)}</div><p>The sign and magnitude of the resistance change depend on the sensing material and its temperature coefficient of resistance (TCR).</p></> },
    { id:"model", n:"04", title:"Electro-thermal model", subtitle:"A first-order approximation of pixel dynamics", body:<><p>A common simplified model represents the pixel as a thermal capacitance connected to its surroundings through a thermal conductance:</p><div className="equation-card"><span>THERMAL ENERGY BALANCE</span><div className="equation">C<sub>th</sub> <span>·</span> dΔT/dt + G<sub>th</sub>ΔT = P<sub>abs</sub></div><p>For a constant absorbed-power step and constant parameters, the temperature approaches a new equilibrium exponentially.</p></div><ul className="theory-list"><li><strong>C<sub>th</sub> — thermal capacitance:</strong> energy required to change pixel temperature.</li><li><strong>G<sub>th</sub> — thermal conductance:</strong> how readily heat escapes to the surroundings.</li><li><strong>P<sub>abs</sub> — absorbed power:</strong> the portion of incident power absorbed by the pixel.</li><li><strong>ΔT — temperature rise:</strong> pixel temperature relative to its reference environment.</li></ul><div className="equation-card secondary-equation"><span>THERMAL TIME CONSTANT</span><div className="equation">τ = C<sub>th</sub> / G<sub>th</sub></div><p>A larger time constant generally means a slower thermal response in this first-order model.</p></div><p>Real devices can require additional effects, including temperature-dependent parameters, electrical bias heating, nonuniform temperature, readout behavior and noise.</p></> },
    { id:"parameters", n:"05", title:"Important parameters", subtitle:"How detector behavior is described", body:<div className="parameter-table"><div className="parameter-row table-head"><span>Parameter</span><span>Meaning</span></div>{[["TCR","Relative resistance change per degree of temperature change."],["R","Electrical resistance of the sensing element."],["Gth","Thermal conductance to the surrounding structure."],["Cth","Effective thermal capacitance of the pixel."],["τ","Characteristic thermal response time, often approximated by Cth/Gth."],["Responsivity","Output change per unit of incident or absorbed input, with definition depending on context."]].map(([a,b])=><div className="parameter-row" key={a}><strong>{a}</strong><span>{b}</span></div>)}</div> },
    { id:"applications", n:"06", title:"Applications & limitations", subtitle:"Where the technology is useful", body:<><div className="application-grid">{[["Thermal imaging","Night vision and temperature-pattern visualization."],["Industrial inspection","Monitoring equipment, heat loss and hot spots."],["Building diagnostics","Finding insulation gaps and thermal leakage."],["Research & sensing","Studying heat signatures and thermal processes."]].map(([a,b])=><div className="application-item" key={a}><CheckCircle2 size={17}/><strong>{a}</strong><p>{b}</p></div>)}</div><h4>Engineering trade-offs</h4><p>Detector design balances sensitivity, response speed, pixel size, thermal isolation, fabrication complexity and noise. Stronger thermal isolation can improve temperature rise for a given absorbed power, but can also affect response speed and device robustness. Actual trade-offs depend on the complete design.</p></> }
  ];
  return <div className="page-content">
    <PageHeading eyebrow="TECHNICAL LIBRARY / 06 CHAPTERS" title="Knowledge Hub" description="Build a foundation in uncooled infrared sensing, MEMS detector structure and electro-thermal response." actions={<button className="button-primary" onClick={() => navigate("ThermoAnalyze")}>Try the analyzer <ArrowRight size={15}/></button>} />
    <div className="knowledge-layout">
      <aside className="chapter-nav"><div className="chapter-nav-title">IN THIS GUIDE</div>{chapters.map((c)=><button key={c.id} className={expanded===c.id?"chapter-link selected": "chapter-link"} onClick={()=>{setExpanded(c.id);document.getElementById(c.id)?.scrollIntoView({behavior:"smooth",block:"start"});}}><span>{c.n}</span>{c.title}</button>)}<div className="reading-tip"><BookOpen size={17}/><strong>Study tip</strong><p>Follow the chapters in order, then explore how a response curve changes over time.</p></div></aside>
      <div className="chapter-content">
        <div className="knowledge-intro"><div className="knowledge-icon"><Layers3 size={24}/></div><div><span className="eyebrow">FIELD NOTES / MEMS INFRARED</span><h2>Understanding the microbolometer</h2><p>These notes introduce the concepts behind thermal detection. They are educational summaries, not a device-specific design specification.</p></div></div>
        {chapters.map((c)=><section className="chapter-section" id={c.id} key={c.id}><div className="chapter-section-heading"><span>{c.n}</span><div><h3>{c.title}</h3><p>{c.subtitle}</p></div></div><div className="chapter-body">{c.body}</div></section>)}
        <div className="reference-box"><BookOpen size={19}/><div><strong>Further reading</strong><p>For a formal report, cite the specific microbolometer papers, textbooks and device documentation you consulted. Verify each bibliographic detail before submission; this prototype does not claim a validated reference list.</p></div></div>
      </div>
    </div>
  </div>;
}

function AnalyzePage({ rows, columns, timeColumn, signalColumn, setTimeColumn, setSignalColumn, chartData, stats, fileName, notice, uploadError, fileInput, handleUpload, loadSample, exportCsv }) {
  return <div className="page-content">
    <PageHeading eyebrow="DATA WORKSPACE / RESPONSE ANALYSIS" title="ThermoAnalyze" description="Explore a time-series signal from a CSV file. All processing happens in your browser; files are not uploaded to a server." actions={<button className="button-secondary" onClick={loadSample}><Waves size={16}/> Load sample data</button>} />
    <div className="analyzer-banner"><div className="analyzer-banner-icon"><Activity size={22}/></div><div><strong>Response analysis workspace</strong><p>Choose a time column and a numeric signal column to update the chart and summary statistics.</p></div><div className="banner-badge"><span className="status-dot"/> LOCAL PROCESSING</div></div>
    <div className="analyzer-grid">
      <section className="panel upload-panel">
        <div className="panel-heading"><div><span className="panel-kicker">STEP 01</span><h3>Import data</h3></div><FileSpreadsheet size={19}/></div>
        <button className="dropzone" onClick={() => fileInput.current?.click()}><div className="upload-icon"><Upload size={21}/></div><strong>Choose a CSV file</strong><span>Click to browse your computer</span><small>.csv · Header row required</small></button>
        <input ref={fileInput} type="file" accept=".csv,text/csv" className="hidden-input" onChange={handleUpload}/>
        <div className="file-status"><span className="file-badge"><FileSpreadsheet size={17}/></span><div><strong>{fileName}</strong><small>{rows.length} valid rows · {columns.length} numeric columns</small></div><CheckCircle2 size={17} className="success-icon"/></div>
        {uploadError && <div className="error-message">{uploadError}</div>}
        <div className="notice-message"><Info size={15}/><span>{notice}</span></div>
        <div className="csv-help"><strong>Expected format</strong><code>time_s,temperature_C</code><p>Use at least two numeric columns and two valid rows. Missing or non-numeric rows are excluded.</p></div>
      </section>
      <section className="panel settings-panel">
        <div className="panel-heading"><div><span className="panel-kicker">STEP 02</span><h3>Signal configuration</h3></div><Gauge size={19}/></div>
        <label className="field-label">Time / X-axis column<select value={timeColumn} onChange={(e)=>setTimeColumn(e.target.value)}>{columns.map((c)=><option key={c} value={c}>{columnLabels[c] || c}</option>)}</select></label>
        <label className="field-label">Signal / Y-axis column<select value={signalColumn} onChange={(e)=>setSignalColumn(e.target.value)}>{columns.filter((c)=>c!==timeColumn).map((c)=><option key={c} value={c}>{columnLabels[c] || c}</option>)}</select></label>
        <div className="config-note"><CheckCircle2 size={16}/><span>Chart and summary metrics update automatically when you change a column.</span></div>
        <div className="analysis-summary"><span>ACTIVE DATASET</span><strong>{fileName}</strong><div><span><Database size={14}/> {rows.length} rows</span><span><Layers3 size={14}/> {columns.length} columns</span></div></div>
      </section>
    </div>

    <section className="panel chart-panel">
      <div className="chart-header"><div><span className="panel-kicker">SIGNAL VISUALIZATION</span><h3>{columnLabels[signalColumn] || signalColumn} <span className="chart-subtitle">over {columnLabels[timeColumn] || timeColumn}</span></h3></div><button className="button-secondary compact" onClick={exportCsv} disabled={!chartData.length}><ArrowDownToLine size={15}/> Export plotted data</button></div>
      <div className="chart-legend"><span className="legend-dot"/><span>{columnLabels[signalColumn] || signalColumn}</span><span className="legend-meta">{chartData.length} plotted points</span></div>
      <div className="chart-wrap">
        {chartData.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{top:10,right:18,left:5,bottom:8}}><CartesianGrid strokeDasharray="3 5" stroke="#e7edf2"/><XAxis dataKey="x" type="number" domain={["dataMin","dataMax"]} tick={{fill:"#758493",fontSize:11}} tickLine={false} axisLine={{stroke:"#dce4ea"}} tickFormatter={(v)=>formatNumber(v,2)} label={{value:columnLabels[timeColumn]||timeColumn,position:"insideBottom",offset:-3,fill:"#758493",fontSize:11}}/><YAxis type="number" domain={["auto","auto"]} tick={{fill:"#758493",fontSize:11}} tickLine={false} axisLine={false} width={72} tickFormatter={(v)=>formatNumber(v,3)}/><Tooltip contentStyle={{borderRadius:10,border:"1px solid #e1e8ee",boxShadow:"0 8px 24px #172b3d12",fontSize:12}} formatter={(value)=>[formatNumber(Number(value),5),columnLabels[signalColumn]||signalColumn]} labelFormatter={(value)=>`${columnLabels[timeColumn]||timeColumn}: ${formatNumber(Number(value),4)}`}/><Line type="monotone" dataKey="y" stroke="#149e91" strokeWidth={2.5} dot={false} activeDot={{r:5,fill:"#149e91",stroke:"#ffffff",strokeWidth:2}}/></LineChart></ResponsiveContainer> : <div className="empty-chart">No valid points to display. Check your selected columns.</div>}
      </div>
      <div className="chart-footnote"><Info size={14}/> The graph shows the selected numeric columns. It does not validate the physical model or measurement conditions.</div>
    </section>

    <div className="stats-heading"><div><span className="panel-kicker">QUICK METRICS</span><h3>Signal summary</h3></div><span className="metric-caption">Calculated from plotted values</span></div>
    <div className="stats-grid">
      <StatCard label="Minimum" value={stats?formatNumber(stats.min):"—"} unit="" icon={ArrowDownToLine} detail="Lowest plotted value"/>
      <StatCard label="Maximum" value={stats?formatNumber(stats.max):"—"} unit="" icon={Activity} detail="Highest plotted value"/>
      <StatCard label="Mean" value={stats?formatNumber(stats.mean):"—"} unit="" icon={Gauge} detail="Arithmetic average"/>
      <StatCard label="Signal change" value={stats?formatNumber(stats.last-stats.first):"—"} unit="" icon={Waves} detail="Final value minus initial value"/>
    </div>
    <div className="disclaimer-strip"><Info size={17}/><p><strong>Interpret with care</strong> — These are descriptive statistics, not proof of a microbolometer's physical response. Rise time, settling time and sensitivity require defined test conditions and suitable data.</p></div>
  </div>;
}

function AboutPage({ navigate }) {
  return <div className="page-content">
    <PageHeading eyebrow="PROJECT NOTES / ABOUT" title="A bridge between theory and data." description="ThermoNexus is a compact educational platform inspired by the study of MEMS-based infrared microbolometers and electro-thermal response."/>
    <div className="about-hero"><div className="about-hero-icon"><Microscope size={30}/></div><div><div className="eyebrow">PROJECT INTENT</div><h2>Make technical concepts easier to explore.</h2><p>The project brings introductory theory and a lightweight time-series data tool into one interface. It is intended to support learning and demonstration, not replace calibrated instrumentation, simulation software or peer-reviewed analysis.</p></div></div>
    <div className="about-grid">
      <div className="about-card"><div className="feature-icon purple"><BookOpen size={20}/></div><h3>Learn</h3><p>Structured notes introduce the device, its components, thermal dynamics and important parameters.</p></div>
      <div className="about-card"><div className="feature-icon teal"><Activity size={20}/></div><h3>Explore</h3><p>The browser-based analyzer plots numeric CSV data and computes basic descriptive statistics.</p></div>
      <div className="about-card"><div className="feature-icon amber"><ShieldCheck size={20}/></div><h3>Understand limits</h3><p>Results are data-derived and depend on data quality, units and the assumptions used to interpret them.</p></div>
    </div>
    <section className="panel about-details"><span className="panel-kicker">TECHNICAL OVERVIEW</span><h3>Prototype scope</h3><div className="detail-row"><span>Interface</span><strong>React + Vite</strong></div><div className="detail-row"><span>Visualization</span><strong>Recharts</strong></div><div className="detail-row"><span>CSV parsing</span><strong>Papa Parse</strong></div><div className="detail-row"><span>Processing</span><strong>Client-side in browser</strong></div><div className="detail-row"><span>Persistent database</span><strong>Not included in this MVP</strong></div><div className="detail-row"><span>Simulation fidelity</span><strong>Not a validated device model</strong></div></section>
    <div className="about-cta"><div><h3>Ready to explore a response curve?</h3><p>Load the illustrative sample data or bring a numeric CSV of your own.</p></div><button className="button-primary" onClick={()=>navigate("ThermoAnalyze")}>Open ThermoAnalyze <ArrowRight size={16}/></button></div>
  </div>;
}

export default App;
