const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "large-realistic-environmental-results.csv");
const jsOutputPath = path.join(__dirname, "large-realistic-environmental-results.js");

const quarters = [
  ["2023Q1", "2023-02-16"],
  ["2023Q2", "2023-05-18"],
  ["2023Q3", "2023-08-17"],
  ["2023Q4", "2023-11-15"],
  ["2024Q1", "2024-02-14"],
  ["2024Q2", "2024-05-16"],
  ["2024Q3", "2024-08-15"],
  ["2024Q4", "2024-11-13"],
  ["2025Q1", "2025-02-12"],
  ["2025Q2", "2025-05-14"],
  ["2025Q3", "2025-08-13"],
  ["2025Q4", "2025-11-12"],
];

const wells = [
  { id: "MW-1", lat: 35.47821, lon: -97.51566, gradient: 1.07, zone: "Source" },
  { id: "MW-2", lat: 35.47842, lon: -97.51498, gradient: 0.82, zone: "Source" },
  { id: "MW-3", lat: 35.47883, lon: -97.51421, gradient: 0.55, zone: "Mid-plume" },
  { id: "MW-4", lat: 35.47916, lon: -97.51352, gradient: 0.34, zone: "Mid-plume" },
  { id: "MW-5", lat: 35.47942, lon: -97.51274, gradient: 0.18, zone: "Downgradient" },
  { id: "MW-6", lat: 35.47788, lon: -97.51633, gradient: 0.09, zone: "Upgradient" },
  { id: "MW-7", lat: 35.48001, lon: -97.5121, gradient: 0.12, zone: "Property boundary" },
  { id: "MW-8", lat: 35.48044, lon: -97.51142, gradient: 0.06, zone: "Offsite sentinel" },
];

const groundwaterAnalytes = [
  { name: "Benzene", base: 16, rl: 0.5, trend: -0.05 },
  { name: "Toluene", base: 220, rl: 1, trend: -0.09 },
  { name: "Ethylbenzene", base: 62, rl: 1, trend: -0.07 },
  { name: "Xylenes", base: 410, rl: 2, trend: -0.06 },
  { name: "Trichloroethene", base: 11, rl: 0.5, trend: 0.04 },
  { name: "Tetrachloroethene", base: 7.5, rl: 0.5, trend: 0.02 },
  { name: "Vinyl chloride", base: 1.8, rl: 0.2, trend: 0.08 },
  { name: "Arsenic", base: 8.5, rl: 1, trend: 0.01 },
  { name: "Nitrate as N", base: 3600, rl: 50, trend: 0.03 },
];

const soilLocations = [
  { id: "SB-1", lat: 35.4781, lon: -97.51572, source: 1.1 },
  { id: "SB-2", lat: 35.47836, lon: -97.51528, source: 0.9 },
  { id: "SB-3", lat: 35.47879, lon: -97.51486, source: 0.55 },
  { id: "SB-4", lat: 35.47911, lon: -97.51422, source: 0.36 },
  { id: "SB-5", lat: 35.47963, lon: -97.51378, source: 0.18 },
  { id: "SB-6", lat: 35.47782, lon: -97.5162, source: 0.08 },
];

const soilAnalytes = [
  { name: "Benzene", base: 0.32, rl: 0.005 },
  { name: "Toluene", base: 7.4, rl: 0.01 },
  { name: "Ethylbenzene", base: 3.2, rl: 0.01 },
  { name: "Xylenes", base: 18, rl: 0.02 },
  { name: "Arsenic", base: 9.8, rl: 0.2 },
  { name: "Lead", base: 122, rl: 0.5 },
];

const soilGasLocations = [
  { id: "SG-1", lat: 35.47815, lon: -97.51561, source: 1.0 },
  { id: "SG-2", lat: 35.47862, lon: -97.51492, source: 0.78 },
  { id: "SG-3", lat: 35.47904, lon: -97.51416, source: 0.46 },
  { id: "SG-4", lat: 35.47949, lon: -97.51344, source: 0.24 },
  { id: "SG-5", lat: 35.47791, lon: -97.51608, source: 0.08 },
];

const soilGasAnalytes = [
  { name: "Benzene", base: 620, rl: 5 },
  { name: "Trichloroethene", base: 180, rl: 5 },
  { name: "Tetrachloroethene", base: 1350, rl: 10 },
  { name: "Vinyl chloride", base: 74, rl: 2 },
];

const rows = [];

for (const [quarter, date] of quarters) {
  const qIndex = Number(quarter.slice(-1));
  const yearIndex = Number(quarter.slice(0, 4)) - 2023;
  const time = yearIndex * 4 + qIndex - 1;

  for (const well of wells) {
    const depthToWater = 14.6 - well.gradient * 1.8 + seasonal(time, 0.42, 0.1);
    const gwElevation = 1184.22 - depthToWater;

    for (const analyte of groundwaterAnalytes) {
      const plume = well.gradient;
      const seasonalFactor = 1 + seasonal(time, 0.09, analyte.base);
      const trendFactor = Math.exp(analyte.trend * time);
      const signal = analyte.base * plume * seasonalFactor * trendFactor;
      const value = Math.max(0, signal + wobble(`${quarter}-${well.id}-${analyte.name}`, analyte.base * 0.08));
      rows.push(makeRow({
        sampleId: `${well.id}-${quarter}-${abbr(analyte.name)}`,
        location: well.id,
        date,
        matrix: "Groundwater",
        depth: "",
        analyte: analyte.name,
        value,
        units: "ug/L",
        rl: analyte.rl,
        qualifier: qualifierFor(value, analyte.rl, well.id, analyte.name, quarter),
        lat: well.lat,
        lon: well.lon,
        gwElevation,
        depthToWater,
        zone: well.zone,
        method: methodFor(analyte.name),
      }));
    }
  }
}

for (const location of soilLocations) {
  for (const depth of ["0-2", "4-6", "8-10"]) {
    const depthFactor = depth === "0-2" ? 1 : depth === "4-6" ? 0.72 : 0.38;
    for (const analyte of soilAnalytes) {
      const value = Math.max(0, analyte.base * location.source * depthFactor + wobble(`${location.id}-${depth}-${analyte.name}`, analyte.base * 0.12));
      rows.push(makeRow({
        sampleId: `${location.id}-${depth}-${abbr(analyte.name)}`,
        location: location.id,
        date: "2025-04-22",
        matrix: "Soil",
        depth,
        analyte: analyte.name,
        value,
        units: "mg/kg",
        rl: analyte.rl,
        qualifier: qualifierFor(value, analyte.rl, location.id, analyte.name, depth),
        lat: location.lat,
        lon: location.lon,
        gwElevation: "",
        depthToWater: "",
        zone: "Source area borings",
        method: methodFor(analyte.name),
      }));
    }
  }
}

for (const location of soilGasLocations) {
  for (const analyte of soilGasAnalytes) {
    const value = Math.max(0, analyte.base * location.source + wobble(`${location.id}-${analyte.name}`, analyte.base * 0.16));
    rows.push(makeRow({
      sampleId: `${location.id}-2025Q2-${abbr(analyte.name)}`,
      location: location.id,
      date: "2025-05-01",
      matrix: "Soil Gas",
      depth: "5",
      analyte: analyte.name,
      value,
      units: "ug/m3",
      rl: analyte.rl,
      qualifier: qualifierFor(value, analyte.rl, location.id, analyte.name, "gas"),
      lat: location.lat,
      lon: location.lon,
      gwElevation: "",
      depthToWater: "",
      zone: "Vapor screening",
      method: "TO-15",
    }));
  }
}

const header = [
  "Sample ID",
  "Location",
  "Sample Date",
  "Matrix",
  "Sample Depth ft bgs",
  "Analyte",
  "Result",
  "Units",
  "Reporting Limit",
  "Qualifier",
  "Latitude",
  "Longitude",
  "Groundwater Elevation ft",
  "Depth to Water ft",
  "Site Area",
  "Analytical Method",
];

const csv = [
  header.join(","),
  ...rows.map((row) => header.map((key) => csvCell(row[key])).join(",")),
].join("\n");

fs.writeFileSync(outputPath, `${csv}\n`);
fs.writeFileSync(
  jsOutputPath,
  `window.LARGE_REALISTIC_SAMPLE_CSV = ${JSON.stringify(`${csv}\n`)};\n`,
);
console.log(`Wrote ${rows.length} rows to ${outputPath}`);
console.log(`Wrote browser sample bundle to ${jsOutputPath}`);

function makeRow(input) {
  const reported = input.qualifier.includes("U") ? `<${input.rl}` : input.value;
  return {
    "Sample ID": input.sampleId,
    Location: input.location,
    "Sample Date": input.date,
    Matrix: input.matrix,
    "Sample Depth ft bgs": input.depth,
    Analyte: input.analyte,
    Result: formatResult(reported),
    Units: input.units,
    "Reporting Limit": input.rl,
    Qualifier: input.qualifier,
    Latitude: input.lat.toFixed(5),
    Longitude: input.lon.toFixed(5),
    "Groundwater Elevation ft": input.gwElevation === "" ? "" : input.gwElevation.toFixed(2),
    "Depth to Water ft": input.depthToWater === "" ? "" : input.depthToWater.toFixed(2),
    "Site Area": input.zone,
    "Analytical Method": input.method,
  };
}

function qualifierFor(value, rl, location, analyte, period) {
  const token = `${location}-${analyte}-${period}`;
  if (value < rl) return "U";
  if (value < rl * 3) return "J";
  if (hash(token) % 47 === 0) return "B";
  if (hash(token) % 61 === 0) return "R";
  return "";
}

function methodFor(analyte) {
  if (["Arsenic", "Lead"].includes(analyte)) return "EPA 6010D";
  if (analyte === "Nitrate as N") return "EPA 300.0";
  return "EPA 8260D";
}

function seasonal(time, scale, salt) {
  return Math.sin((time / 4) * Math.PI * 2 + Number(`0.${hash(String(salt)).toString().slice(0, 3)}`)) * scale;
}

function wobble(seed, scale) {
  const raw = (hash(seed) % 2000) / 1000 - 1;
  return raw * scale;
}

function hash(value) {
  let h = 2166136261;
  for (const char of String(value)) {
    h ^= char.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function abbr(value) {
  return String(value)
    .replace(/[^A-Za-z0-9 ]/g, "")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 5);
}

function formatResult(value) {
  if (typeof value === "string") return value;
  if (value >= 100) return value.toFixed(0);
  if (value >= 10) return value.toFixed(1);
  if (value >= 1) return value.toFixed(2);
  return value.toFixed(3);
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
