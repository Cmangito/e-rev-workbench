const path = require("path");
const { chromium } = require("playwright");

function fileUrl(filePath) {
  return `file:///${filePath.replace(/\\/g, "/").replace(/ /g, "%20")}`;
}

(async () => {
  const appPath = path.resolve(__dirname, "..", "index.html");
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const pageErrors = [];
  const consoleMessages = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => consoleMessages.push(`${message.type()}: ${message.text()}`));

  await page.goto(fileUrl(appPath), { waitUntil: "load" });
  await page.waitForFunction(() => Boolean(document.querySelector("#metricRecords")));

  const results = await page.evaluate(() => {
    const tests = [];
    const check = (name, condition, detail = "") => {
      tests.push({ name, ok: Boolean(condition), detail });
    };

    const preambleCsv = `Project: Example Site
Generated: 2026-06-10

Sample ID,Location,Sample Date,Matrix,Analyte,Result,Units,Reporting Limit,Qualifier
S1,MW-1,2026-01-01,Groundwater,Benzene,6,ug/L,0.5,
S2,MW-1,2026-04-01,Groundwater,Benzene,7,ug/L,0.5,`;
    const preambleRows = parseDelimited(preambleCsv).rows;
    loadRows(preambleRows, "preamble.csv");
    check("preamble header row detected", Object.keys(preambleRows[0]).includes("Sample ID"), Object.keys(preambleRows[0]).join(", "));
    check("preamble rows normalize to records", state.records.length === 2, `${state.records.length} records`);
    check("source row advances past preamble rows", state.records[0].row > 2, `row ${state.records[0].row}`);
    check("preamble record keeps location", state.records[0].location === "MW-1", state.records[0].location);

    const fromToCsv = `Sample ID,Location,Sample Date,Matrix,From,To,Analyte,Result,Units,Reporting Limit,Qualifier,Latitude,Longitude
SB3-0-2,SB-3,2026-01-01,Soil,0,2,Lead,80,mg/kg,0.2,,35,-97
SB3-4-6,SB-3,2026-01-01,Soil,4,6,Lead,35,mg/kg,0.2,,35,-97
SB3-8-10,SB-3,2026-01-01,Soil,8,10,Lead,20,mg/kg,0.2,,35,-97`;
    loadRows(parseDelimited(fromToCsv).rows, "from-to-depth.csv");
    const profile = state.depthProfiles[0];
    check("From column maps to depthFrom", state.mapping.From === "depthFrom", state.mapping.From);
    check("To column maps to depthTo", state.mapping.To === "depthTo", state.mapping.To);
    check(
      "From/To intervals are combined",
      profile.points.map((point) => point.depth.label).join("|") === "0-2 ft|4-6 ft|8-10 ft",
      profile.points.map((point) => point.depth.label).join("|"),
    );
    check("depth range uses interval bounds", profile.shallowDepth === 0 && profile.deepDepth === 10, `${profile.shallowDepth}-${profile.deepDepth}`);

    const trendCsv = `Sample ID,Location,Sample Date,Matrix,Analyte,Result,Units,Reporting Limit,Qualifier
MW1-Q1,MW-1,2026-01-01,Groundwater,Benzene,1,ug/L,0.5,
MW1-Q2,MW-1,2026-04-01,Groundwater,Benzene,2,ug/L,0.5,
MW1-Q3,MW-1,2026-07-01,Groundwater,Benzene,6,ug/L,0.5,
MW1-Q4,MW-1,2026-10-01,Groundwater,Benzene,4,ug/L,0.5,`;
    loadRows(parseDelimited(trendCsv).rows, "trend-filter.csv");
    state.filters.location = "MW-1";
    state.filters.analyte = "Benzene";
    state.filters.exceedanceOnly = true;
    renderAll();
    const tableRecords = filteredRecords();
    const trends = filteredTrends();
    check("exceedance table remains narrowed", tableRecords.length === 1, `${tableRecords.length} records`);
    check("trend keeps full qualifying series", trends.length === 1 && trends[0].points.length === 4, `${trends.length} trends, ${trends[0]?.points.length || 0} points`);

    const trendMathCsv = `Sample ID,Location,Sample Date,Matrix,Analyte,Result,Units,Reporting Limit,Qualifier
MW1-ZERO,MW-1,2026-01-01,Groundwater,Benzene,0,ug/L,0.5,
MW1-NEG,MW-1,2026-04-01,Groundwater,Benzene,-1,ug/L,0.5,
MW1-P1,MW-1,2026-07-01,Groundwater,Benzene,1,ug/L,0.5,
MW1-P2,MW-1,2026-10-01,Groundwater,Benzene,2,ug/L,0.5,
MW1-P3,MW-1,2027-01-01,Groundwater,Benzene,4,ug/L,0.5,`;
    loadRows(parseDelimited(trendMathCsv).rows, "trend-math-edge.csv");
    const edgeTrend = state.trends.find((trend) => trend.location === "MW-1" && trend.analyte === "Benzene");
    check("zero detected result flagged", state.flags.some((item) => item.issue === "Zero result"), state.flags.map((item) => item.issue).join(", "));
    check("negative detected result flagged", state.flags.some((item) => item.issue === "Negative result"), state.flags.map((item) => item.issue).join(", "));
    check(
      "log trend excludes nonpositive detected values",
      edgeTrend?.points.length === 3 && edgeTrend.points.every((point) => point.normalizedValue > 0),
      `${edgeTrend?.points.length || 0} trend points`,
    );

    loadLargeSample();
    state.activeView = "clean";
    renderActiveView();
    const cleanNote = document.querySelector("#activeTable .table-note")?.textContent || "";
    check("clean table explains preview limit", cleanNote.includes("CSV export includes all"), cleanNote || "missing table note");

    return tests;
  });

  await browser.close();

  const failed = results.filter((result) => !result.ok);
  results.forEach((result) => {
    const marker = result.ok ? "PASS" : "FAIL";
    console.log(`${marker} ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
  });
  if (pageErrors.length) {
    console.error(`PAGE ERRORS:\n${pageErrors.join("\n")}`);
  }
  const warnings = consoleMessages.filter((message) => !/favicon/i.test(message));
  if (warnings.length) {
    console.error(`CONSOLE:\n${warnings.join("\n")}`);
  }
  if (failed.length || pageErrors.length || warnings.length) process.exit(1);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
