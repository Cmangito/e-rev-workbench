const fs = require("fs");
const path = require("path");

const SAMPLE_PATH = path.resolve(__dirname, "..", "sample-data", "large-realistic-environmental-results.csv");

const STARTER_CRITERIA = [
  ["Benzene", "water", 5, "ug/L"],
  ["Toluene", "water", 1000, "ug/L"],
  ["Ethylbenzene", "water", 700, "ug/L"],
  ["Xylenes", "water", 10000, "ug/L"],
  ["Trichloroethene", "water", 5, "ug/L"],
  ["Tetrachloroethene", "water", 5, "ug/L"],
  ["Vinyl chloride", "water", 2, "ug/L"],
  ["cis-1,2-Dichloroethene", "water", 70, "ug/L"],
  ["trans-1,2-Dichloroethene", "water", 100, "ug/L"],
  ["Arsenic", "water", 10, "ug/L"],
  ["Nitrate as N", "water", 10000, "ug/L"],
  ["Benzene", "soil", 0.58, "mg/kg"],
  ["Arsenic", "soil", 0.68, "mg/kg"],
  ["Trichloroethene", "air", 2.1, "ug/m3"],
  ["Tetrachloroethene", "air", 47, "ug/m3"],
].map(([analyte, matrix, value, units]) => ({
  analyte,
  canonicalAnalyte: canonicalAnalyte(analyte),
  matrix,
  value,
  units,
}));

const EXPECTED = {
  records: 992,
  detections: 893,
  exceedances: 157,
  qaFlags: 110,
  trends: 70,
  increasing: 9,
  decreasing: 20,
  stable: 41,
  depthProfiles: 36,
  mappedLocations: 19,
};

const tests = [];

function check(name, condition, detail = "") {
  tests.push({ name, ok: Boolean(condition), detail });
}

function closeEnough(actual, expected, tolerance = 1e-9) {
  return Math.abs(actual - expected) <= tolerance;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const header = rows.shift();
  return rows
    .filter((values) => values.some((value) => String(value).trim()))
    .map((values) =>
      Object.fromEntries(header.map((column, index) => [column, values[index] ?? ""])),
    );
}

function cleanCell(value) {
  return String(value ?? "").trim();
}

function parseNumber(value) {
  const match = String(value ?? "").replace(/,/g, "").match(/-?\d+(\.\d+)?([eE][+-]?\d+)?/);
  return match ? Number(match[0]) : null;
}

function parseResult(value, qualifier) {
  const text = cleanCell(value);
  const qual = cleanCell(qualifier).toUpperCase();
  return {
    numeric: parseNumber(text),
    nondetect: /^</.test(text) || /\bND\b/i.test(text) || /\bU\b/.test(qual),
  };
}

function normalizeUnit(unit) {
  return String(unit || "")
    .toLowerCase()
    .replace(/\u00b5/g, "u")
    .replace(/\u03bc/g, "u")
    .replace(/\u00b3/g, "3")
    .replace(/\s+/g, "")
    .replace("micrograms", "ug")
    .replace("microgram", "ug")
    .replace("milligrams", "mg")
    .replace("milligram", "mg")
    .replace("nanograms", "ng")
    .replace("nanogram", "ng");
}

function defaultUnitForMatrix(matrix) {
  if (matrix === "soil" || matrix === "sediment") return "mg/kg";
  if (matrix === "air") return "ug/m3";
  return "ug/L";
}

function convertValue(value, fromUnit, toUnit) {
  if (value === null || Number.isNaN(value)) return null;
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);
  if (!from || from === to) return value;
  const conversions = {
    "mg/l>ug/l": 1000,
    "ng/l>ug/l": 0.001,
    "ngl>ug/l": 0.001,
    "ppb>ug/l": 1,
    "ppm>ug/l": 1000,
    "ug/l>mg/l": 0.001,
    "ug/kg>mg/kg": 0.001,
    "ug/g>mg/kg": 1,
    "ppm>mg/kg": 1,
    "mg/m3>ug/m3": 1000,
    "ng/m3>ug/m3": 0.001,
  };
  const factor = conversions[`${from}>${to}`];
  return factor ? value * factor : null;
}

function classifyMatrix(matrixValue, unitValue) {
  const matrix = String(matrixValue || "").toLowerCase();
  const unit = normalizeUnit(unitValue);
  const isAirMatrix = /soil\s*gas|sub\s*slab|vapor|vapour|air/.test(matrix);
  const isWaterMatrix = /groundwater|water|aqueous|drinking/.test(matrix);
  const isSoilMatrix = /soil|solid|sludge/.test(matrix);
  if (isAirMatrix || /m3/.test(unit)) return "air";
  if (/sediment/.test(matrix)) return "sediment";
  if (isWaterMatrix || (/\/l|ppb|ngl/.test(unit) && !isSoilMatrix)) return "water";
  if (isSoilMatrix || /\/kg|\/g|ppm/.test(unit)) return "soil";
  return matrix ? matrix.replace(/\s+/g, "-") : "water";
}

function canonicalAnalyte(analyte) {
  const normalized = String(analyte || "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const aliases = new Map([
    ["tetrachloroethene", "tetrachloroethene"],
    ["perchloroethylene", "tetrachloroethene"],
    ["pce", "tetrachloroethene"],
    ["trichloroethene", "trichloroethene"],
    ["trichloroethylene", "trichloroethene"],
    ["tce", "trichloroethene"],
    ["vinyl chloride", "vinyl chloride"],
    ["benzene", "benzene"],
    ["toluene", "toluene"],
    ["ethylbenzene", "ethylbenzene"],
    ["xylenes", "xylenes"],
    ["total xylenes", "xylenes"],
    ["arsenic", "arsenic"],
    ["nitrate as n", "nitrate as n"],
    ["nitrate nitrogen", "nitrate as n"],
    ["cis 1 2 dichloroethene", "cis-1,2-dichloroethene"],
    ["trans 1 2 dichloroethene", "trans-1,2-dichloroethene"],
  ]);
  return aliases.get(normalized) || normalized;
}

function matchCriterion(analyte, matrix) {
  const canonical = canonicalAnalyte(analyte);
  return STARTER_CRITERIA.find((item) => item.canonicalAnalyte === canonical && item.matrix === matrix);
}

function compareRecord(result, normalizedValue, censorLimit, criterionValue) {
  if (criterionValue === null) return { label: "No criterion", exceedance: false, multiple: null };
  if (normalizedValue === null) return { label: "Unit review", exceedance: false, multiple: null };
  if (result.nondetect) {
    if (censorLimit !== null && censorLimit > criterionValue) {
      return { label: "RL above criterion", exceedance: false, multiple: censorLimit / criterionValue };
    }
    return { label: "Nondetect", exceedance: false, multiple: null };
  }
  if (normalizedValue > criterionValue) {
    return { label: "Exceeds", exceedance: true, multiple: normalizedValue / criterionValue };
  }
  return { label: "Below", exceedance: false, multiple: normalizedValue / criterionValue };
}

function buildRecord(row, rowIndex) {
  const result = parseResult(row.Result, row.Qualifier);
  const matrix = classifyMatrix(row.Matrix, row.Units);
  const normalizedUnit = defaultUnitForMatrix(matrix);
  const normalizedValue = convertValue(result.numeric, row.Units, normalizedUnit);
  const reportingLimit = parseNumber(row["Reporting Limit"]);
  const normalizedCensorLimit = convertValue(reportingLimit ?? result.numeric, row.Units, normalizedUnit);
  const criterion = matchCriterion(row.Analyte, matrix);
  const criterionValue = criterion ? convertValue(criterion.value, criterion.units, normalizedUnit) : null;
  const comparison = compareRecord(result, normalizedValue, normalizedCensorLimit, criterionValue);
  return {
    row: rowIndex + 2,
    sampleId: cleanCell(row["Sample ID"]),
    location: cleanCell(row.Location),
    date: cleanCell(row["Sample Date"]),
    matrix,
    analyte: cleanCell(row.Analyte),
    canonicalAnalyte: canonicalAnalyte(row.Analyte),
    rawResult: cleanCell(row.Result),
    resultValue: result.numeric,
    nondetect: result.nondetect,
    units: cleanCell(row.Units),
    normalizedValue,
    normalizedUnit,
    qualifier: cleanCell(row.Qualifier),
    comparison: comparison.label,
    exceedance: comparison.exceedance,
    multiple: comparison.multiple,
    latitude: parseNumber(row.Latitude),
    longitude: parseNumber(row.Longitude),
    depth: cleanCell(row["Sample Depth ft bgs"]),
  };
}

function findQaFlags(records) {
  const flags = [];
  const seen = new Map();
  records.forEach((record) => {
    if (!record.location) flags.push(["Missing location", record.row]);
    if (!record.date) flags.push(["Missing date", record.row]);
    if (!record.analyte) flags.push(["Missing analyte", record.row]);
    if (!record.rawResult) flags.push(["Missing result", record.row]);
    if (!record.units) flags.push(["Missing units", record.row]);
    if (!record.nondetect && record.resultValue !== null && record.resultValue < 0) flags.push(["Negative result", record.row]);
    if (!record.nondetect && record.normalizedValue === 0) flags.push(["Zero result", record.row]);
    if (record.comparison === "Unit review") flags.push(["Unit review", record.row]);
    if (record.comparison === "RL above criterion") flags.push(["Reporting limit", record.row]);
    if (record.comparison === "No criterion" && record.resultValue !== null && !record.nondetect) flags.push(["No criterion", record.row]);
    if (/[BR]/i.test(record.qualifier)) flags.push(["Qualifier review", record.row]);
    const duplicateKey = [record.location, record.date, record.matrix, record.canonicalAnalyte, record.rawResult].join("|");
    if (seen.has(duplicateKey)) flags.push(["Possible duplicate", record.row]);
    else seen.set(duplicateKey, record.row);
  });
  return flags;
}

function calculateTrends(records) {
  const groups = new Map();
  records.forEach((record) => {
    if (record.nondetect || record.normalizedValue === null || record.normalizedValue <= 0 || !record.date || !record.location || !record.analyte) return;
    const time = new Date(record.date).getTime();
    if (Number.isNaN(time)) return;
    const key = `${record.location}|${record.matrix}|${record.canonicalAnalyte}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ ...record, time });
  });
  return [...groups.entries()].map(([key, points]) => trendForGroup(key, points)).filter(Boolean);
}

function trendForGroup(key, points) {
  const sorted = collapseSameDayTrendPoints(points);
  if (sorted.length < 3) return null;
  const firstTime = sorted[0].time;
  const xs = sorted.map((point) => (point.time - firstTime) / (365.25 * 24 * 60 * 60 * 1000));
  const ys = sorted.map((point) => Math.log(point.normalizedValue));
  const regression = linearRegression(xs, ys);
  const percentPerYear = (Math.exp(regression.slope) - 1) * 100;
  const status =
    regression.r2 < 0.2 || Math.abs(percentPerYear) < 15
      ? "Stable"
      : percentPerYear > 0
        ? "Increasing"
        : "Decreasing";
  return { key, status, percentPerYear, r2: regression.r2, points: sorted };
}

function collapseSameDayTrendPoints(points) {
  const byDate = new Map();
  [...points]
    .sort((a, b) => a.time - b.time)
    .forEach((point) => {
      const current = byDate.get(point.date);
      if (!current || point.normalizedValue > current.normalizedValue) byDate.set(point.date, point);
    });
  return [...byDate.values()].sort((a, b) => a.time - b.time);
}

function calculateDepthProfiles(records) {
  const groups = new Map();
  records.forEach((record) => {
    if (!record.location || !record.date || !record.analyte || record.normalizedValue === null || record.normalizedValue < 0) return;
    const depth = parseDepthInterval(record.depth);
    if (!depth) return;
    const key = `${record.location}|${record.date}|${record.matrix}|${record.canonicalAnalyte}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ ...record, depth });
  });
  return [...groups.entries()].map(([key, points]) => depthProfileForGroup(key, points)).filter(Boolean);
}

function depthProfileForGroup(key, points) {
  const byDepth = new Map();
  [...points]
    .sort((a, b) => a.depth.midpoint - b.depth.midpoint)
    .forEach((point) => {
      const depthKey = String(point.depth.midpoint);
      const current = byDepth.get(depthKey);
      if (!current || point.normalizedValue > current.normalizedValue) byDepth.set(depthKey, point);
    });
  const sorted = [...byDepth.values()].sort((a, b) => a.depth.midpoint - b.depth.midpoint);
  if (sorted.length < 2) return null;
  return {
    key,
    points: sorted,
    shallowDepth: Math.min(...sorted.map((point) => point.depth.top)),
    deepDepth: Math.max(...sorted.map((point) => point.depth.bottom)),
  };
}

function parseDepthInterval(value) {
  const cleaned = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\b(feet|foot|ft|bgs|below ground surface)\b/g, " ")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/(\d)\s*-\s*(\d)/g, "$1 $2");
  const matches = [...cleaned.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
  if (!matches.length) return null;
  const top = matches[0];
  const bottom = matches.length > 1 ? matches[1] : matches[0];
  const shallow = Math.min(top, bottom);
  const deep = Math.max(top, bottom);
  return { top: shallow, bottom: deep, midpoint: (shallow + deep) / 2 };
}

function linearRegression(xs, ys) {
  const n = xs.length;
  const meanX = xs.reduce((sum, value) => sum + value, 0) / n;
  const meanY = ys.reduce((sum, value) => sum + value, 0) / n;
  const numerator = xs.reduce((sum, x, index) => sum + (x - meanX) * (ys[index] - meanY), 0);
  const denominator = xs.reduce((sum, x) => sum + (x - meanX) ** 2, 0);
  const slope = denominator ? numerator / denominator : 0;
  const intercept = meanY - slope * meanX;
  const ssTotal = ys.reduce((sum, y) => sum + (y - meanY) ** 2, 0);
  const ssResidual = ys.reduce((sum, y, index) => sum + (y - (intercept + slope * xs[index])) ** 2, 0);
  return { slope, intercept, r2: ssTotal ? Math.max(0, 1 - ssResidual / ssTotal) : 0 };
}

function mappedLocations(records, flags) {
  const flagsByRow = flags.reduce((accumulator, [, row]) => accumulator.set(row, (accumulator.get(row) || 0) + 1), new Map());
  const groups = new Map();
  records.forEach((record) => {
    if (!Number.isFinite(record.latitude) || !Number.isFinite(record.longitude) || !record.location) return;
    if (!groups.has(record.location)) {
      groups.set(record.location, { latTotal: 0, lonTotal: 0, coordinateCount: 0, qaFlagCount: 0 });
    }
    const group = groups.get(record.location);
    group.latTotal += record.latitude;
    group.lonTotal += record.longitude;
    group.coordinateCount += 1;
    group.qaFlagCount += flagsByRow.get(record.row) || 0;
  });
  return [...groups.entries()].map(([location, group]) => ({
    location,
    latitude: group.latTotal / group.coordinateCount,
    longitude: group.lonTotal / group.coordinateCount,
  }));
}

function projectMapLocations(locations) {
  const originLat = locations.reduce((sum, item) => sum + item.latitude, 0) / locations.length;
  const originLon = locations.reduce((sum, item) => sum + item.longitude, 0) / locations.length;
  const lonScale = 111320 * Math.cos((originLat * Math.PI) / 180);
  const latScale = 110540;
  return locations.map((location) => ({
    ...location,
    xMeters: (location.longitude - originLon) * lonScale,
    yMeters: (location.latitude - originLat) * latScale,
  }));
}

const rows = parseCsv(fs.readFileSync(SAMPLE_PATH, "utf8"));
const records = rows.map(buildRecord);
const flags = findQaFlags(records);
const exceedances = records.filter((record) => record.exceedance);
const trends = calculateTrends(records);
const trendCounts = trends.reduce((counts, trend) => {
  counts[trend.status] = (counts[trend.status] || 0) + 1;
  return counts;
}, {});
const depthProfiles = calculateDepthProfiles(records);
const locations = mappedLocations(records, flags);

check("large sample record count", records.length === EXPECTED.records, `${records.length}`);
check("large sample detection count", records.filter((record) => !record.nondetect && record.resultValue !== null).length === EXPECTED.detections);
check("large sample exceedance count", exceedances.length === EXPECTED.exceedances, `${exceedances.length}`);
check("large sample QA flag count", flags.length === EXPECTED.qaFlags, `${flags.length}`);
check("large sample trend count", trends.length === EXPECTED.trends, `${trends.length}`);
check("large sample increasing trend count", trendCounts.Increasing === EXPECTED.increasing, `${trendCounts.Increasing || 0}`);
check("large sample decreasing trend count", trendCounts.Decreasing === EXPECTED.decreasing, `${trendCounts.Decreasing || 0}`);
check("large sample stable trend count", trendCounts.Stable === EXPECTED.stable, `${trendCounts.Stable || 0}`);
check("large sample depth profile count", depthProfiles.length === EXPECTED.depthProfiles, `${depthProfiles.length}`);
check("large sample mapped location count", locations.length === EXPECTED.mappedLocations, `${locations.length}`);
check("same-day SB-3 lead is not a time trend", !trends.some((trend) => trend.key === "SB-3|soil|lead"));

check("water mg/L to ug/L conversion", convertValue(0.005, "mg/L", "ug/L") === 5);
check("soil ug/kg to mg/kg conversion", convertValue(680, "ug/kg", "mg/kg") === 0.68);
check("air mg/m3 to ug/m3 conversion", convertValue(0.047, "mg/m3", "ug/m3") === 47);
check("micro symbol normalizes", normalizeUnit("\u03bcg/L") === "ug/l" && normalizeUnit("\u00b5g/m\u00b3") === "ug/m3");

const benzeneDetect = buildRecord(
  { "Sample ID": "X", Location: "MW", "Sample Date": "2026-01-01", Matrix: "Groundwater", "Sample Depth ft bgs": "", Analyte: "Benzene", Result: "6", Units: "ug/L", "Reporting Limit": "0.5", Qualifier: "", Latitude: "", Longitude: "" },
  0,
);
const benzeneNondetect = buildRecord(
  { "Sample ID": "Y", Location: "MW", "Sample Date": "2026-01-01", Matrix: "Groundwater", "Sample Depth ft bgs": "", Analyte: "Benzene", Result: "<10", Units: "ug/L", "Reporting Limit": "10", Qualifier: "U", Latitude: "", Longitude: "" },
  1,
);
check("detected benzene above MCL screens as exceedance", benzeneDetect.exceedance && closeEnough(benzeneDetect.multiple, 1.2));
check("nondetect above criterion flags reporting limit, not exceedance", !benzeneNondetect.exceedance && benzeneNondetect.comparison === "RL above criterion");

const trend = trendForGroup("MW|water|benzene", [
  { date: "2024-01-01", time: new Date("2024-01-01").getTime(), normalizedValue: 10 },
  { date: "2025-01-01", time: new Date("2025-01-01").getTime(), normalizedValue: 20 },
  { date: "2026-01-01", time: new Date("2026-01-01").getTime(), normalizedValue: 40 },
]);
check("synthetic doubling trend is increasing", trend.status === "Increasing" && trend.r2 > 0.999);
check("synthetic doubling trend percent is about 100% per year", closeEnough(trend.percentPerYear, 100, 0.5), `${trend.percentPerYear}`);

const projected = projectMapLocations([
  { location: "origin", latitude: 35, longitude: -97 },
  { location: "north", latitude: 35.001, longitude: -97 },
  { location: "east", latitude: 35, longitude: -96.999 },
]);
check("map projection keeps north positive", projected.find((item) => item.location === "north").yMeters > projected.find((item) => item.location === "origin").yMeters);
check("map projection keeps east positive", projected.find((item) => item.location === "east").xMeters > projected.find((item) => item.location === "origin").xMeters);

tests.forEach((result) => {
  console.log(`${result.ok ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
});

if (tests.some((result) => !result.ok)) process.exit(1);
