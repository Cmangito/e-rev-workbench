const SAMPLE_CSV = `Sample ID,Location,Sample Date,Matrix,Analyte,Result,Units,Reporting Limit,Qualifier
MW-1-2024Q1,MW-1,2024-01-18,Groundwater,Benzene,3.1,ug/L,0.5,
MW-1-2024Q2,MW-1,2024-04-19,Groundwater,Benzene,4.4,ug/L,0.5,
MW-1-2024Q3,MW-1,2024-07-17,Groundwater,Benzene,5.8,ug/L,0.5,
MW-1-2024Q4,MW-1,2024-10-21,Groundwater,Benzene,7.2,ug/L,0.5,
MW-2-2024Q1,MW-2,2024-01-18,Groundwater,Benzene,<0.5,ug/L,0.5,U
MW-2-2024Q2,MW-2,2024-04-19,Groundwater,Benzene,0.8,ug/L,0.5,J
MW-2-2024Q3,MW-2,2024-07-17,Groundwater,Benzene,1.1,ug/L,0.5,J
MW-2-2024Q4,MW-2,2024-10-21,Groundwater,Benzene,1.0,ug/L,0.5,
MW-3-2024Q1,MW-3,2024-01-18,Groundwater,Trichloroethene,12,ug/L,0.5,
MW-3-2024Q2,MW-3,2024-04-19,Groundwater,Trichloroethene,9.5,ug/L,0.5,
MW-3-2024Q3,MW-3,2024-07-17,Groundwater,Trichloroethene,6.2,ug/L,0.5,
MW-3-2024Q4,MW-3,2024-10-21,Groundwater,Trichloroethene,4.7,ug/L,0.5,
SB-1-5,SB-1,2024-03-12,Soil,Arsenic,8.4,mg/kg,0.2,
SB-2-5,SB-2,2024-03-12,Soil,Benzene,0.08,mg/kg,0.005,J
SG-1,SG-1,2024-03-14,Soil Gas,Tetrachloroethene,1200,ug/m3,10,`;

const RESULT_TEMPLATE_CSV = `Sample ID,Location,Sample Date,Matrix,Sample Depth ft bgs,Analyte,Result,Units,Reporting Limit,Qualifier,Latitude,Longitude,Groundwater Elevation ft,Depth to Water ft,Site Area,Analytical Method
MW-1-2026Q1-BENZ,MW-1,2026-01-15,Groundwater,,Benzene,4.2,ug/L,0.5,,35.00000,-97.00000,1180.25,14.72,Source Area,EPA 8260D
SB-1-4-6-ARS,SB-1,2026-01-16,Soil,4-6,Arsenic,6.8,mg/kg,0.2,J,35.00010,-97.00012,,,Source Area,EPA 6010D`;

const CRITERIA_TEMPLATE_CSV = `analyte,matrix,value,units,source
Benzene,water,5,ug/L,Federal MCL
Trichloroethene,water,5,ug/L,Federal MCL
Arsenic,soil,0.68,mg/kg,Project screening level
Tetrachloroethene,air,47,ug/m3,Project screening level`;

const PROJECT_STORAGE_KEY = "e-rev-project-setup";
const PROJECT_FIELDS = ["projectName", "siteName", "clientName", "reviewerName", "reviewDate", "projectNotes"];

const ROLE_OPTIONS = [
  ["ignore", "Ignore"],
  ["sampleId", "Sample ID"],
  ["location", "Location / Well"],
  ["date", "Sample Date"],
  ["matrix", "Matrix"],
  ["analyte", "Analyte"],
  ["result", "Result"],
  ["wideAnalyte", "Analyte Result"],
  ["units", "Units"],
  ["qualifier", "Qualifier"],
  ["reportingLimit", "Reporting Limit"],
  ["detectionLimit", "Detection Limit"],
  ["depth", "Depth"],
  ["depthFrom", "Depth From"],
  ["depthTo", "Depth To"],
  ["latitude", "Latitude"],
  ["longitude", "Longitude"],
];

const ROLE_PATTERNS = {
  sampleId: [/^sample\s*id$/, /^client\s*sample/, /^sample\s*name$/, /^field\s*sample/],
  location: [/location/, /^loc\b/, /well/, /station/, /field\s*point/, /^fpn$/, /sample\s*point/],
  date: [/sample\s*date/, /collection\s*date/, /collected/, /^date$/, /sampled/],
  matrix: [/matrix/, /media/, /medium/],
  analyte: [/analyte/, /chemical/, /compound/, /constituent/, /parameter/, /substance/],
  result: [/^result$/, /result\s*value/, /concentration/, /^conc\b/, /^value$/, /detected\s*result/],
  units: [/^unit/, /units$/, /result\s*unit/, /concentration\s*unit/],
  qualifier: [/qualifier/, /\bflag\b/, /validation/, /^q$/],
  reportingLimit: [/reporting\s*limit/, /\brl\b/, /quantitation/, /\bloq\b/, /report\s*limit/],
  detectionLimit: [/method\s*detection/, /\bmdl\b/, /detection\s*limit/, /\bdl\b/],
  depthFrom: [/^from$/, /^top$/, /^depth\s*from$/, /^from\s*depth$/, /top\s*depth/, /start\s*depth/],
  depthTo: [/^to$/, /^bottom$/, /^depth\s*to$/, /^to\s*depth$/, /bottom\s*depth/, /end\s*depth/],
  depth: [/depth/, /sample\s*interval/],
  latitude: [/latitude/, /^lat$/],
  longitude: [/longitude/, /^long/, /^lon$/],
};

const STARTER_CRITERIA = [
  criterion("Benzene", "water", 5, "ug/L", "Federal MCL"),
  criterion("Toluene", "water", 1000, "ug/L", "Federal MCL"),
  criterion("Ethylbenzene", "water", 700, "ug/L", "Federal MCL"),
  criterion("Xylenes", "water", 10000, "ug/L", "Federal MCL"),
  criterion("Trichloroethene", "water", 5, "ug/L", "Federal MCL"),
  criterion("Tetrachloroethene", "water", 5, "ug/L", "Federal MCL"),
  criterion("Vinyl chloride", "water", 2, "ug/L", "Federal MCL"),
  criterion("cis-1,2-Dichloroethene", "water", 70, "ug/L", "Federal MCL"),
  criterion("trans-1,2-Dichloroethene", "water", 100, "ug/L", "Federal MCL"),
  criterion("Arsenic", "water", 10, "ug/L", "Federal MCL"),
  criterion("Nitrate as N", "water", 10000, "ug/L", "Federal MCL"),
  criterion("Benzene", "soil", 0.58, "mg/kg", "Starter soil screen"),
  criterion("Arsenic", "soil", 0.68, "mg/kg", "Starter soil screen"),
  criterion("Trichloroethene", "air", 2.1, "ug/m3", "Starter air screen"),
  criterion("Tetrachloroethene", "air", 47, "ug/m3", "Starter air screen"),
];

const state = {
  rawRows: [],
  headers: [],
  mapping: {},
  records: [],
  flags: [],
  exceedances: [],
  trends: [],
  depthProfiles: [],
  criteria: [...STARTER_CRITERIA],
  activeView: "exceedances",
  selectedTrend: "",
  selectedDepthProfile: "",
  mapBasemap: false,
  filters: {
    matrix: "",
    location: "",
    analyte: "",
    dateFrom: "",
    dateTo: "",
    search: "",
    exceedanceOnly: false,
  },
  project: emptyProject(),
  sourceName: "",
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let mapRenderToken = 0;

document.addEventListener("DOMContentLoaded", () => {
  loadStoredProject();
  bindEvents();
  renderProject();
  renderCriteria();
  renderAll();
  refreshIcons();
});

function bindEvents() {
  $("#fileInput").addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (file) parseUploadedFile(file);
    event.target.value = "";
  });

  $("#criteriaInput").addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (file) await importCriteria(file);
    event.target.value = "";
  });

  $("#helpBtn").addEventListener("click", openHelp);
  $("#closeHelpBtn").addEventListener("click", closeHelp);
  $("#helpDialog").addEventListener("click", (event) => {
    if (event.target.id === "helpDialog") closeHelp();
  });
  $("#mathBtn").addEventListener("click", openMath);
  $("#closeMathBtn").addEventListener("click", closeMath);
  $("#mathDialog").addEventListener("click", (event) => {
    if (event.target.id === "mathDialog") closeMath();
  });

  $("#loadSampleBtn").addEventListener("click", loadSmallSample);
  $("#loadSmallSampleBtn").addEventListener("click", loadSmallSample);
  $("#loadLargeSampleBtn").addEventListener("click", loadLargeSample);
  $("#downloadTemplateBtn").addEventListener("click", () => {
    downloadFile("environmental-results-template.csv", RESULT_TEMPLATE_CSV, "text/csv");
  });
  $("#downloadCriteriaTemplateBtn").addEventListener("click", () => {
    downloadFile("screening-criteria-template.csv", CRITERIA_TEMPLATE_CSV, "text/csv");
  });
  $("#downloadDemoBriefBtn").addEventListener("click", downloadDemoBrief);

  PROJECT_FIELDS.forEach((field) => {
    $(`#${field}`).addEventListener("input", (event) => {
      state.project[field] = event.target.value;
      persistProject();
      renderAll();
    });
  });
  $("#clearProjectBtn").addEventListener("click", clearProject);

  $("#resetBtn").addEventListener("click", resetWorkspace);
  $("#applyMappingBtn").addEventListener("click", applyMappingFromUi);
  $("#downloadActiveBtn").addEventListener("click", downloadActiveView);
  $("#downloadSummaryBtn").addEventListener("click", downloadSummary);
  $("#copySummaryBtn").addEventListener("click", copySummary);
  $("#downloadMemoBtn").addEventListener("click", downloadMemo);
  $("#copyMemoBtn").addEventListener("click", copyMemo);
  $("#downloadAiPromptBtn").addEventListener("click", downloadAiPrompt);
  $("#copyAiPromptBtn").addEventListener("click", copyAiPrompt);
  $("#downloadAiBriefBtn").addEventListener("click", downloadAiBrief);
  $("#copyAiBriefBtn").addEventListener("click", copyAiBrief);
  $("#checkAiDraftBtn").addEventListener("click", () => {
    renderAiDraftChecklist();
    toast("AI draft checked.");
  });
  $("#aiDraftInput").addEventListener("input", renderAiDraftChecklist);
  $("#downloadPackageBtn").addEventListener("click", downloadReviewPackage);
  $("#clearFiltersBtn").addEventListener("click", clearFilters);
  $("#trendSelect").addEventListener("change", (event) => {
    state.selectedTrend = event.target.value;
    drawTrendChart();
  });
  $("#depthProfileSelect").addEventListener("change", (event) => {
    state.selectedDepthProfile = event.target.value;
    drawDepthProfileChart();
  });
  $("#mapBasemapToggle").addEventListener("change", (event) => {
    state.mapBasemap = event.target.checked;
    drawMapChart();
  });
  $("#openGoogleMapBtn").addEventListener("click", openCurrentMapInGoogle);

  [
    ["filterMatrix", "matrix"],
    ["filterLocation", "location"],
    ["filterAnalyte", "analyte"],
    ["filterDateFrom", "dateFrom"],
    ["filterDateTo", "dateTo"],
    ["filterSearch", "search"],
  ].forEach(([id, key]) => {
    $(`#${id}`).addEventListener("input", (event) => {
      state.filters[key] = event.target.value;
      renderAll();
    });
  });
  $("#filterExceedanceOnly").addEventListener("change", (event) => {
    state.filters.exceedanceOnly = event.target.checked;
    renderAll();
  });

  $("#criterionForm").addEventListener("submit", (event) => {
    event.preventDefault();
    addCriterionFromForm();
  });

  $$(".tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = button.dataset.view;
      renderActiveView();
    });
  });

  const dropZone = $("#dropZone");
  ["dragenter", "dragover"].forEach((type) => {
    dropZone.addEventListener(type, (event) => {
      event.preventDefault();
      dropZone.classList.add("dragging");
    });
  });
  ["dragleave", "drop"].forEach((type) => {
    dropZone.addEventListener(type, (event) => {
      event.preventDefault();
      dropZone.classList.remove("dragging");
    });
  });
  dropZone.addEventListener("drop", (event) => {
    const [file] = event.dataTransfer.files;
    if (file) parseUploadedFile(file);
  });
}

function emptyProject() {
  return {
    projectName: "",
    siteName: "",
    clientName: "",
    reviewerName: "",
    reviewDate: "",
    projectNotes: "",
  };
}

function loadStoredProject() {
  try {
    const stored = JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY) || "{}");
    state.project = { ...emptyProject(), ...stored };
  } catch {
    state.project = emptyProject();
  }
}

function renderProject() {
  PROJECT_FIELDS.forEach((field) => {
    const input = $(`#${field}`);
    if (input) input.value = state.project[field] || "";
  });
}

function persistProject() {
  try {
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(state.project));
  } catch {
    toast("Project setup could not be saved in this browser.");
  }
}

function clearProject() {
  state.project = emptyProject();
  localStorage.removeItem(PROJECT_STORAGE_KEY);
  renderProject();
  renderAll();
  toast("Project setup cleared.");
}

function loadSmallSample() {
  loadRows(parseDelimited(SAMPLE_CSV).rows, "sample-environmental-results.csv");
  toast("Small sample loaded.");
}

function loadLargeSample() {
  if (!window.LARGE_REALISTIC_SAMPLE_CSV) {
    toast("The realistic sample bundle did not load. Use the CSV file in sample-data instead.");
    return;
  }
  const rows = parseDelimited(window.LARGE_REALISTIC_SAMPLE_CSV).rows;
  loadRows(rows, "large-realistic-environmental-results.csv");
  toast(`${rows.length.toLocaleString()} realistic sample rows loaded.`);
}

function openHelp() {
  const dialog = $("#helpDialog");
  if (dialog.showModal) dialog.showModal();
  else dialog.setAttribute("open", "");
  refreshIcons();
}

function closeHelp() {
  const dialog = $("#helpDialog");
  if (dialog.close) dialog.close();
  else dialog.removeAttribute("open");
}

function openMath() {
  const dialog = $("#mathDialog");
  if (dialog.showModal) dialog.showModal();
  else dialog.setAttribute("open", "");
  refreshIcons();
}

function closeMath() {
  const dialog = $("#mathDialog");
  if (dialog.close) dialog.close();
  else dialog.removeAttribute("open");
}

async function parseUploadedFile(file) {
  try {
    const extension = file.name.split(".").pop().toLowerCase();
    let rows;
    if (["xlsx", "xls"].includes(extension)) {
      rows = await parseWorkbook(file);
    } else {
      const text = await file.text();
      rows = parseDelimited(text).rows;
    }
    loadRows(rows, file.name);
    toast(`${rows.length.toLocaleString()} data rows loaded.`);
  } catch (error) {
    toast(error.message || "The file could not be read.");
  }
}

async function parseWorkbook(file) {
  const loaded = await ensureSheetJs();
  if (!loaded) {
    throw new Error("XLSX support is unavailable. Save the file as CSV and upload again.");
  }
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const matrix = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    defval: "",
    raw: false,
  });
  return rowsFromMatrix(matrix);
}

function ensureSheetJs() {
  if (window.XLSX) return Promise.resolve(true);
  toast("Loading Excel parser...");
  return new Promise((resolve) => {
    const existing = document.querySelector("script[data-sheetjs]");
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js";
    script.async = true;
    script.dataset.sheetjs = "true";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.append(script);
    window.setTimeout(() => resolve(Boolean(window.XLSX)), 12000);
  });
}

function parseDelimited(text) {
  const delimiter = detectDelimiter(text);
  const matrix = parseCsvMatrix(text, delimiter);
  return { rows: rowsFromMatrix(matrix), delimiter };
}

function detectDelimiter(text) {
  const sample = text.split(/\r?\n/).slice(0, 8).join("\n");
  const candidates = [",", "\t", ";", "|"];
  let best = ",";
  let bestScore = -1;
  for (const delimiter of candidates) {
    const counts = sample
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => parseCsvLine(line, delimiter).length);
    const score = Math.max(...counts) - (new Set(counts).size - 1);
    if (score > bestScore) {
      best = delimiter;
      bestScore = score;
    }
  }
  return best;
}

function parseCsvMatrix(text, delimiter = ",") {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => String(value).trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => String(value).trim() !== "")) rows.push(row);
  return rows;
}

function parseCsvLine(line, delimiter) {
  return parseCsvMatrix(`${line}\n`, delimiter)[0] || [];
}

function rowsFromMatrix(matrix) {
  const headerIndex = bestHeaderRowIndex(matrix);
  if (headerIndex < 0) return [];
  const headers = uniqueHeaders(matrix[headerIndex].map((header, index) => cleanHeader(header, index)));
  return matrix.slice(headerIndex + 1)
    .map((row, offset) => ({ row, sourceRow: headerIndex + offset + 2 }))
    .filter(({ row }) => row.some((cell) => String(cell).trim() !== ""))
    .map(({ row, sourceRow }) => {
      const record = Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]));
      Object.defineProperty(record, "__sourceRow", {
        value: sourceRow,
        enumerable: false,
      });
      return record;
    });
}

function cleanHeader(header, index) {
  const value = String(header ?? "").trim();
  return value || `Column ${index + 1}`;
}

function uniqueHeaders(headers) {
  const counts = new Map();
  return headers.map((header) => {
    const count = (counts.get(header) || 0) + 1;
    counts.set(header, count);
    return count === 1 ? header : `${header} ${count}`;
  });
}

function bestHeaderRowIndex(matrix) {
  let fallback = -1;
  let best = { index: -1, score: -Infinity };
  const limit = Math.min(matrix.length, 40);
  for (let index = 0; index < limit; index += 1) {
    const row = matrix[index] || [];
    if (!row.some((cell) => String(cell).trim())) continue;
    if (fallback < 0) fallback = index;
    const score = headerRowScore(row, index);
    if (score > best.score) best = { index, score };
  }
  return best.score >= 12 ? best.index : fallback;
}

function headerRowScore(row, rowIndex) {
  const normalized = row.map(normalizeHeader).filter(Boolean);
  const matchedRoles = new Set();
  normalized.forEach((header) => {
    Object.keys(ROLE_PATTERNS).forEach((role) => {
      if (headerMatchesRole(role, header)) matchedRoles.add(role);
    });
  });
  const requiredHits = ["location", "date", "analyte", "result", "units"].filter((role) => matchedRoles.has(role)).length;
  const nonEmpty = normalized.length;
  const lowInformationPenalty = nonEmpty <= 1 ? 14 : 0;
  return matchedRoles.size * 8 + requiredHits * 6 + Math.min(nonEmpty, 16) - lowInformationPenalty - rowIndex * 0.1;
}

function loadRows(rows, sourceName) {
  state.rawRows = rows;
  state.headers = rows.length ? Object.keys(rows[0]) : [];
  state.mapping = autoDetectMapping(state.headers, rows);
  state.sourceName = sourceName;
  state.filters = {
    matrix: "",
    location: "",
    analyte: "",
    dateFrom: "",
    dateTo: "",
    search: "",
    exceedanceOnly: false,
  };
  analyze();
  renderMapping();
  renderAll();
}

function autoDetectMapping(headers, rows) {
  const mapping = Object.fromEntries(headers.map((header) => [header, "ignore"]));
  const taken = new Set();
  for (const [role, patterns] of Object.entries(ROLE_PATTERNS)) {
    const match = headers.find((header) => {
      if (taken.has(header)) return false;
      const normalized = normalizeHeader(header);
      return headerMatchesRole(role, normalized);
    });
    if (match) {
      mapping[match] = role;
      taken.add(match);
    }
  }

  const hasLongShape = Object.values(mapping).includes("analyte") && Object.values(mapping).includes("result");
  if (!hasLongShape) {
    const metadataRoles = new Set(Object.values(mapping).filter((role) => role !== "ignore"));
    headers.forEach((header) => {
      if (mapping[header] !== "ignore" || metadataRoles.has(header)) return;
      const numericShare = shareWithNumericValues(rows, header);
      if (numericShare >= 0.45) mapping[header] = "wideAnalyte";
    });
  }

  return mapping;
}

function normalizeHeader(header) {
  return String(header).toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function headerMatchesRole(role, normalizedHeader) {
  if ((role === "depth" || role === "depthTo") && /depth\s*to\s*water|water\s*level|groundwater\s*elevation/.test(normalizedHeader)) {
    return false;
  }
  return ROLE_PATTERNS[role].some((pattern) => pattern.test(normalizedHeader));
}

function shareWithNumericValues(rows, header) {
  const values = rows.map((row) => row[header]).filter((value) => String(value).trim() !== "");
  if (!values.length) return 0;
  const numeric = values.filter((value) => parseResult(value, "").numeric !== null).length;
  return numeric / values.length;
}

function renderMapping() {
  const container = $("#mappingTable");
  container.innerHTML = "";
  if (!state.headers.length) {
    $("#mappingState").textContent = "No file loaded.";
    return;
  }
  $("#mappingState").textContent = `${state.sourceName} | ${state.headers.length} columns`;

  state.headers.forEach((header) => {
    const row = document.createElement("div");
    row.className = "mapping-row";
    row.innerHTML = `
      <div class="field-name" title="${escapeHtml(header)}">${escapeHtml(header)}</div>
      <select data-header="${escapeHtml(header)}" aria-label="Role for ${escapeHtml(header)}">
        ${ROLE_OPTIONS.map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}
      </select>
    `;
    row.querySelector("select").value = state.mapping[header] || "ignore";
    container.append(row);
  });
}

function applyMappingFromUi() {
  $$("#mappingTable select").forEach((select) => {
    state.mapping[select.dataset.header] = select.value;
  });
  analyze();
  renderAll();
  toast("Field mapping applied.");
}

function analyze() {
  const records = normalizeRecords();
  const flags = findQaFlags(records);
  const exceedances = records
    .filter((record) => record.exceedance)
    .sort((a, b) => (b.multiple || 0) - (a.multiple || 0));
  const trends = calculateTrends(records);
  const depthProfiles = calculateDepthProfiles(records);

  state.records = records;
  state.flags = flags;
  state.exceedances = exceedances;
  state.trends = trends;
  state.depthProfiles = depthProfiles;
  if (!trends.some((trend) => trend.key === state.selectedTrend)) {
    state.selectedTrend = trends[0]?.key || "";
  }
  if (!depthProfiles.some((profile) => profile.key === state.selectedDepthProfile)) {
    state.selectedDepthProfile = depthProfiles[0]?.key || "";
  }
}

function normalizeRecords() {
  if (!state.rawRows.length) return [];
  const roleToHeaders = {};
  for (const [header, role] of Object.entries(state.mapping)) {
    if (role === "ignore") continue;
    if (!roleToHeaders[role]) roleToHeaders[role] = [];
    roleToHeaders[role].push(header);
  }

  const wideHeaders = roleToHeaders.wideAnalyte || [];
  const records = [];

  if (wideHeaders.length && !roleToHeaders.analyte?.length) {
    state.rawRows.forEach((row, rowIndex) => {
      wideHeaders.forEach((analyteHeader) => {
        const result = row[analyteHeader];
        if (String(result ?? "").trim() === "") return;
        records.push(buildRecord(row, rowIndex, {
          analyteOverride: analyteHeader,
          resultOverride: result,
        }));
      });
    });
  } else {
    state.rawRows.forEach((row, rowIndex) => records.push(buildRecord(row, rowIndex)));
  }

  return records.map((record, index) => ({ ...record, id: index + 1 }));
}

function buildRecord(row, rowIndex, overrides = {}) {
  const valueFor = (role) => {
    const header = Object.entries(state.mapping).find(([, mappedRole]) => mappedRole === role)?.[0];
    return header ? row[header] : "";
  };
  const rawResult = overrides.resultOverride ?? valueFor("result");
  const analyte = String(overrides.analyteOverride ?? valueFor("analyte")).trim();
  const depth = combinedDepthValue(valueFor("depth"), valueFor("depthFrom"), valueFor("depthTo"));
  const result = parseResult(rawResult, valueFor("qualifier"));
  const reportingLimit = parseNumber(valueFor("reportingLimit"));
  const detectionLimit = parseNumber(valueFor("detectionLimit"));
  const matrix = classifyMatrix(valueFor("matrix"), valueFor("units"));
  const normalizedUnit = defaultUnitForMatrix(matrix);
  const normalizedValue = convertValue(result.numeric, valueFor("units"), normalizedUnit);
  const censorSource = reportingLimit ?? detectionLimit ?? result.numeric;
  const normalizedCensorLimit = convertValue(censorSource, valueFor("units"), normalizedUnit);
  const match = matchCriterion(analyte, matrix);
  const criterionValue = match ? convertValue(match.value, match.units, normalizedUnit) : null;
  const comparison = compareRecord(result, normalizedValue, normalizedCensorLimit, criterionValue);

  return {
    row: row.__sourceRow || rowIndex + 2,
    sampleId: cleanCell(valueFor("sampleId")),
    location: cleanCell(valueFor("location")),
    date: formatDate(valueFor("date")),
    matrix,
    rawMatrix: cleanCell(valueFor("matrix")),
    analyte: cleanCell(analyte),
    canonicalAnalyte: canonicalAnalyte(analyte),
    rawResult: cleanCell(rawResult),
    resultValue: result.numeric,
    nondetect: result.nondetect,
    units: cleanCell(valueFor("units")),
    normalizedValue,
    normalizedUnit,
    qualifier: cleanCell(valueFor("qualifier")),
    reportingLimit,
    detectionLimit,
    normalizedCensorLimit,
    criterion: criterionValue,
    criterionSource: match?.source || "",
    comparison: comparison.label,
    exceedance: comparison.exceedance,
    multiple: comparison.multiple,
    latitude: parseNumber(valueFor("latitude")),
    longitude: parseNumber(valueFor("longitude")),
    depth,
  };
}

function combinedDepthValue(depthValue, fromValue, toValue) {
  const depth = cleanCell(depthValue);
  if (depth) return depth;
  const from = cleanCell(fromValue);
  const to = cleanCell(toValue);
  if (from && to) return `${from}-${to}`;
  return from || to;
}

function parseResult(value, qualifier) {
  const text = String(value ?? "").trim();
  const qual = String(qualifier ?? "").toUpperCase();
  const nondetect = /^</.test(text) || /\bND\b/i.test(text) || /\bU\b/.test(qual);
  const numeric = parseNumber(text);
  return { numeric, nondetect };
}

function parseNumber(value) {
  const match = String(value ?? "").replace(/,/g, "").match(/-?\d+(\.\d+)?([eE][+-]?\d+)?/);
  return match ? Number(match[0]) : null;
}

function cleanCell(value) {
  return String(value ?? "").trim();
}

function formatDate(value) {
  const text = cleanCell(value);
  if (!text) return "";
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return date.toISOString().slice(0, 10);
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
    "mg/kg>mg/kg": 1,
    "ug/kg>mg/kg": 0.001,
    "ug/g>mg/kg": 1,
    "ppm>mg/kg": 1,
    "mg/m3>ug/m3": 1000,
    "ng/m3>ug/m3": 0.001,
  };
  const factor = conversions[`${from}>${to}`];
  return factor ? value * factor : null;
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

function criterion(analyte, matrix, value, units, source) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    analyte,
    canonicalAnalyte: canonicalAnalyte(analyte),
    matrix,
    value,
    units,
    source,
  };
}

function matchCriterion(analyte, matrix) {
  const canonical = canonicalAnalyte(analyte);
  return state.criteria.find((item) => item.canonicalAnalyte === canonical && item.matrix === matrix);
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

function findQaFlags(records) {
  const flags = [];
  const seen = new Map();

  records.forEach((record) => {
    if (!record.location) flags.push(flag(record, "Missing location", "Add a well, boring, station, or sample point."));
    if (!record.date) flags.push(flag(record, "Missing date", "Add the sample collection date."));
    if (!record.analyte) flags.push(flag(record, "Missing analyte", "Map an analyte or wide-result column."));
    if (!record.rawResult) flags.push(flag(record, "Missing result", "Map the result concentration column."));
    if (!record.units) flags.push(flag(record, "Missing units", "Add units before comparing against criteria."));
    if (!record.nondetect && record.resultValue !== null && record.resultValue < 0) {
      flags.push(flag(record, "Negative result", "Detected concentrations below zero should be reviewed before screening or charting."));
    }
    if (!record.nondetect && record.normalizedValue === 0) {
      flags.push(flag(record, "Zero result", "Zero detected concentrations are excluded from log-trend screening."));
    }
    if (record.comparison === "Unit review") flags.push(flag(record, "Unit review", "The result units could not be converted for screening."));
    if (record.comparison === "RL above criterion") flags.push(flag(record, "Reporting limit", "The nondetect reporting limit is above the screening criterion."));
    if (record.comparison === "No criterion" && record.resultValue !== null && !record.nondetect) {
      flags.push(flag(record, "No criterion", "Add a screening criterion for this matrix and analyte."));
    }
    if (/[BR]/i.test(record.qualifier)) {
      flags.push(flag(record, "Qualifier review", `Qualifier ${record.qualifier} may affect usability.`));
    }
    const duplicateKey = [
      record.location,
      record.date,
      record.matrix,
      record.canonicalAnalyte,
      record.rawResult,
    ].join("|");
    if (seen.has(duplicateKey)) {
      flags.push(flag(record, "Possible duplicate", `Similar to row ${seen.get(duplicateKey)}.`));
    } else {
      seen.set(duplicateKey, record.row);
    }
  });

  return flags;
}

function flag(record, issue, note) {
  return {
    row: record.row,
    location: record.location || "-",
    date: record.date || "-",
    matrix: record.matrix || "-",
    analyte: record.analyte || "-",
    issue,
    note,
  };
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

  return [...groups.entries()]
    .map(([key, points]) => trendForGroup(key, points))
    .filter(Boolean)
    .sort((a, b) => Math.abs(b.percentPerYear) - Math.abs(a.percentPerYear));
}

function trendForGroup(key, points) {
  const sorted = collapseSameDayTrendPoints(points);
  if (sorted.length < 3) return null;
  const firstTime = sorted[0].time;
  const xs = sorted.map((point) => (point.time - firstTime) / (365.25 * 24 * 60 * 60 * 1000));
  const ys = sorted.map((point) => Math.log(Math.max(point.normalizedValue, 1e-12)));
  const regression = linearRegression(xs, ys);
  const percentPerYear = (Math.exp(regression.slope) - 1) * 100;
  const status =
    regression.r2 < 0.2 || Math.abs(percentPerYear) < 15
      ? "Stable"
      : percentPerYear > 0
        ? "Increasing"
        : "Decreasing";
  const intervals = sorted.slice(1).map((point, index) => (point.time - sorted[index].time) / (365.25 * 24 * 60 * 60 * 1000));
  const nextOffset = xs[xs.length - 1] + median(intervals, 0.25);
  const nextValue = Math.exp(regression.intercept + regression.slope * nextOffset);
  const [location, matrix, canonical] = key.split("|");
  return {
    key,
    location,
    matrix,
    analyte: sorted[0].analyte || canonical,
    points: sorted,
    status,
    percentPerYear,
    r2: regression.r2,
    latestValue: sorted[sorted.length - 1].normalizedValue,
    predictedNext: nextValue,
    units: sorted[0].normalizedUnit,
    criterion: sorted[0].criterion,
    source: sorted[0].criterionSource,
  };
}

function collapseSameDayTrendPoints(points) {
  const byDate = new Map();
  [...points]
    .sort((a, b) => a.time - b.time)
    .forEach((point) => {
      const dateKey = point.date;
      const current = byDate.get(dateKey);
      if (!current || point.normalizedValue > current.normalizedValue) byDate.set(dateKey, point);
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

  return [...groups.entries()]
    .map(([key, points]) => depthProfileForGroup(key, points))
    .filter(Boolean)
    .sort((a, b) => a.location.localeCompare(b.location) || a.date.localeCompare(b.date) || a.analyte.localeCompare(b.analyte));
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
  const [location, date, matrix, canonical] = key.split("|");
  const values = sorted.map((point) => point.normalizedValue);
  const shallowDepth = Math.min(...sorted.map((point) => point.depth.top));
  const deepDepth = Math.max(...sorted.map((point) => point.depth.bottom));
  return {
    key,
    location,
    date,
    matrix,
    analyte: sorted[0].analyte || canonical,
    points: sorted,
    units: sorted[0].normalizedUnit,
    criterion: sorted[0].criterion,
    source: sorted[0].criterionSource,
    pointCount: sorted.length,
    shallowDepth,
    deepDepth,
    maxValue: Math.max(...values),
  };
}

function parseDepthInterval(value) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const cleaned = text
    .toLowerCase()
    .replace(/\b(feet|foot|ft|bgs|below ground surface)\b/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/(\d)\s*-\s*(\d)/g, "$1 $2");
  const matches = [...cleaned.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
  if (!matches.length) return null;
  const top = matches[0];
  const bottom = matches.length > 1 ? matches[1] : matches[0];
  if (!Number.isFinite(top) || !Number.isFinite(bottom)) return null;
  const shallow = Math.min(top, bottom);
  const deep = Math.max(top, bottom);
  return {
    top: shallow,
    bottom: deep,
    midpoint: (shallow + deep) / 2,
    label: shallow === deep ? `${formatNumber(shallow)} ft` : `${formatNumber(shallow)}-${formatNumber(deep)} ft`,
  };
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
  const r2 = ssTotal ? Math.max(0, 1 - ssResidual / ssTotal) : 0;
  return { slope, intercept, r2 };
}

function median(values, fallback) {
  if (!values.length) return fallback;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] || fallback;
}

function renderAll() {
  renderWorkflow();
  renderFilters();
  renderMetrics();
  renderDashboard();
  renderSummary();
  renderAiAssistant();
  renderQaSummary();
  renderTrendPicker();
  renderDepthProfilePicker();
  renderActiveView();
  drawTrendChart();
  drawDepthProfileChart();
  drawMapChart();
  refreshIcons();
}

function renderWorkflow() {
  const hasData = state.records.length > 0;
  const requiredMapped = ["location", "date", "matrix", "analyte", "result", "units"].every((role) =>
    Object.values(state.mapping).includes(role),
  );
  const hasQaReview = hasData && requiredMapped && state.flags.length === 0;
  const hasResults = hasData && (state.exceedances.length > 0 || state.trends.length > 0 || state.depthProfiles.length > 0 || mappedLocations().length > 0);
  const activeId = !hasData
    ? "workflowUpload"
    : !requiredMapped
      ? "workflowFields"
      : state.flags.length
        ? "workflowQa"
        : hasResults
          ? "workflowExport"
          : "workflowResults";
  const steps = [
    ["workflowUpload", hasData],
    ["workflowFields", hasData && requiredMapped],
    ["workflowQa", hasQaReview],
    ["workflowResults", hasResults],
    ["workflowExport", false],
  ];

  steps.forEach(([id, done]) => {
    const element = $(`#${id}`);
    element.classList.toggle("done", Boolean(done));
    element.classList.toggle("active", id === activeId && !done);
  });
}

function renderFilters() {
  syncFilterSelect("#filterMatrix", uniqueSorted(state.records.map((record) => record.matrix)), "All matrices", state.filters.matrix);
  syncFilterSelect("#filterLocation", uniqueSorted(state.records.map((record) => record.location)), "All locations", state.filters.location);
  syncFilterSelect("#filterAnalyte", uniqueSorted(state.records.map((record) => record.analyte)), "All analytes", state.filters.analyte);
  $("#filterDateFrom").value = state.filters.dateFrom;
  $("#filterDateTo").value = state.filters.dateTo;
  $("#filterSearch").value = state.filters.search;
  $("#filterExceedanceOnly").checked = state.filters.exceedanceOnly;

  const filteredCount = filteredRecords().length;
  const active = activeFilterCount();
  $("#filterNote").textContent = active
    ? `${filteredCount.toLocaleString()} of ${state.records.length.toLocaleString()} records match ${active} active filter${active === 1 ? "" : "s"}.${state.filters.exceedanceOnly ? " Trend and depth views preserve full matching series for groups with exceedances." : ""}`
    : "Filters apply to tables, trend choices, depth profiles, map locations, and exports.";
}

function syncFilterSelect(selector, values, label, current) {
  const select = $(selector);
  const next = [optionMarkup("", label), ...values.map((value) => optionMarkup(value, value))].join("");
  if (select.dataset.options !== next) {
    select.innerHTML = next;
    select.dataset.options = next;
  }
  select.value = values.includes(current) ? current : "";
  const key = selector.replace("#filter", "");
  const stateKey = key.charAt(0).toLowerCase() + key.slice(1);
  if (select.value !== state.filters[stateKey]) state.filters[stateKey] = select.value;
}

function optionMarkup(value, label) {
  return `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;
}

function activeFilterCount() {
  return Object.values(state.filters).filter((value) => (typeof value === "boolean" ? value : String(value).trim())).length;
}

function clearFilters() {
  state.filters = {
    matrix: "",
    location: "",
    analyte: "",
    dateFrom: "",
    dateTo: "",
    search: "",
    exceedanceOnly: false,
  };
  renderAll();
  toast("Filters cleared.");
}

function renderMetrics() {
  $("#metricRecords").textContent = state.records.length.toLocaleString();
  $("#metricDetections").textContent = state.records.filter((record) => !record.nondetect && record.resultValue !== null).length.toLocaleString();
  $("#metricExceedances").textContent = state.exceedances.length.toLocaleString();
  $("#metricFlags").textContent = state.flags.length.toLocaleString();
}

function renderDashboard() {
  const records = filteredRecords();
  const exceedances = filteredExceedances();
  const flags = filteredFlags();
  const trends = filteredTrends();
  const status = $("#dashboardStatus");
  status.textContent = !state.records.length ? "Waiting for data" : activeFilterCount() ? "Filtered view" : "Full dataset";
  status.classList.toggle("review", Boolean(state.records.length && (flags.length || exceedances.length)));
  status.classList.toggle("clean", Boolean(state.records.length && !flags.length && !exceedances.length));

  if (!records.length) {
    setDashboardCard("dashTopExceedance", "-", "dashTopExceedanceMeta", "No records match the current view.");
    setDashboardCard("dashQaIssue", "-", "dashQaIssueMeta", "No QA flags match the current view.");
    setDashboardCard("dashTrendMix", "-", "dashTrendMixMeta", "No trend series match the current view.");
    setDashboardCard("dashDetectionFocus", "-", "dashDetectionFocusMeta", "No detection data in the current view.");
    renderDashboardCharts([], [], []);
    renderRankList("#dashAnalyteList", [], "No exceedances to rank.");
    renderRankList("#dashLocationList", [], "No exceedances to rank.");
    return;
  }

  const topExceedance = exceedances[0];
  if (topExceedance) {
    setDashboardCard(
      "dashTopExceedance",
      `${topExceedance.analyte}`,
      "dashTopExceedanceMeta",
      `${topExceedance.location} | ${formatNumber(topExceedance.multiple)}x criterion | ${formatNumber(topExceedance.normalizedValue)} ${displayUnit(topExceedance.normalizedUnit)}`,
    );
  } else {
    setDashboardCard("dashTopExceedance", "None", "dashTopExceedanceMeta", "No exceedances against active criteria.");
  }

  const qaCounts = countBy(flags, "issue");
  const topQa = Object.entries(qaCounts).sort((a, b) => b[1] - a[1])[0];
  setDashboardCard(
    "dashQaIssue",
    topQa ? topQa[0] : "None",
    "dashQaIssueMeta",
    topQa ? `${topQa[1].toLocaleString()} flag${topQa[1] === 1 ? "" : "s"} in current view.` : "No QA flags in current view.",
  );

  const trendCounts = countBy(trends, "status");
  const increasing = trendCounts.Increasing || 0;
  const decreasing = trendCounts.Decreasing || 0;
  const stable = trendCounts.Stable || 0;
  setDashboardCard(
    "dashTrendMix",
    `${increasing}/${decreasing}/${stable}`,
    "dashTrendMixMeta",
    "Increasing / decreasing / stable trend series.",
  );

  const detectionFocus = topDetectionFocus(records);
  setDashboardCard(
    "dashDetectionFocus",
    detectionFocus ? detectionFocus.analyte : "None",
    "dashDetectionFocusMeta",
    detectionFocus
      ? `${detectionFocus.detected} of ${detectionFocus.total} records detected (${formatNumber(detectionFocus.rate * 100)}%).`
      : "No detected results in current view.",
  );

  renderRankList("#dashAnalyteList", rankCounts(exceedances, "analyte"), "No exceedances to rank.");
  renderRankList("#dashLocationList", rankCounts(exceedances, "location"), "No exceedances to rank.");
  renderDashboardCharts(records, flags, trends);
}

function setDashboardCard(valueId, value, metaId, meta) {
  $(`#${valueId}`).textContent = value;
  $(`#${metaId}`).textContent = meta;
}

function topDetectionFocus(records) {
  const groups = new Map();
  records.forEach((record) => {
    if (!record.analyte) return;
    const current = groups.get(record.analyte) || { analyte: record.analyte, detected: 0, total: 0, rate: 0 };
    current.total += 1;
    if (!record.nondetect && record.resultValue !== null) current.detected += 1;
    current.rate = current.detected / current.total;
    groups.set(record.analyte, current);
  });
  return [...groups.values()]
    .filter((item) => item.detected > 0)
    .sort((a, b) => b.rate - a.rate || b.detected - a.detected)[0];
}

function rankCounts(records, field) {
  return Object.entries(countBy(records, field))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, count]) => ({ label, count }));
}

function renderRankList(selector, items, emptyMessage) {
  const container = $(selector);
  if (!items.length) {
    container.innerHTML = `<div class="rank-empty">${escapeHtml(emptyMessage)}</div>`;
    return;
  }
  const max = Math.max(...items.map((item) => item.count), 1);
  container.innerHTML = items
    .map(
      (item) => `
        <div class="rank-row">
          <div>
            <strong>${escapeHtml(item.label)}</strong>
            <span>${item.count.toLocaleString()}</span>
          </div>
          <div class="rank-bar"><span style="width: ${(item.count / max) * 100}%"></span></div>
        </div>
      `,
    )
    .join("");
}

function renderDashboardCharts(records, flags, trends) {
  const qaItems = chartItemsFromCounts(countBy(flags, "issue"));
  renderSegmentChart("#qaIssueChart", qaItems, "No QA flags in current view.");
  $("#qaChartTotal").textContent = `${flags.length.toLocaleString()} flag${flags.length === 1 ? "" : "s"}`;

  const trendItems = ["Increasing", "Decreasing", "Stable"]
    .map((label) => ({ label, count: countBy(trends, "status")[label] || 0, tone: trendTone(label) }))
    .filter((item) => item.count > 0);
  renderSegmentChart("#trendStatusChart", trendItems, "No trend series in current view.");
  $("#trendChartTotal").textContent = `${trends.length.toLocaleString()} series`;

  const detectionItems = detectionFrequencyItems(records);
  renderFrequencyChart("#detectionChart", detectionItems, "No detections in current view.");
  $("#detectionChartTotal").textContent = `${detectionItems.length.toLocaleString()} analyte${detectionItems.length === 1 ? "" : "s"}`;
}

function chartItemsFromCounts(counts) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count], index) => ({ label, count, tone: chartTone(index) }));
}

function renderSegmentChart(selector, items, emptyMessage) {
  const container = $(selector);
  if (!items.length) {
    container.innerHTML = `<div class="rank-empty">${escapeHtml(emptyMessage)}</div>`;
    return;
  }
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const segments = items
    .map(
      (item) =>
        `<span class="${item.tone}" style="width: ${(item.count / total) * 100}%" title="${escapeHtml(item.label)}: ${item.count.toLocaleString()}"></span>`,
    )
    .join("");
  const legend = items
    .map(
      (item) => `
        <div class="chart-legend-row">
          <span class="legend-dot ${item.tone}"></span>
          <strong>${escapeHtml(item.label)}</strong>
          <em>${item.count.toLocaleString()} (${formatNumber((item.count / total) * 100)}%)</em>
        </div>
      `,
    )
    .join("");
  container.innerHTML = `<div class="segment-bar">${segments}</div><div class="chart-legend">${legend}</div>`;
}

function detectionFrequencyItems(records) {
  const groups = new Map();
  records.forEach((record) => {
    if (!record.analyte) return;
    const current = groups.get(record.analyte) || { label: record.analyte, detected: 0, total: 0, rate: 0 };
    current.total += 1;
    if (!record.nondetect && record.resultValue !== null) current.detected += 1;
    current.rate = current.detected / current.total;
    groups.set(record.analyte, current);
  });
  return [...groups.values()]
    .filter((item) => item.detected > 0)
    .sort((a, b) => b.rate - a.rate || b.detected - a.detected)
    .slice(0, 6);
}

function renderFrequencyChart(selector, items, emptyMessage) {
  const container = $(selector);
  if (!items.length) {
    container.innerHTML = `<div class="rank-empty">${escapeHtml(emptyMessage)}</div>`;
    return;
  }
  container.innerHTML = items
    .map(
      (item) => `
        <div class="frequency-row">
          <div>
            <strong>${escapeHtml(item.label)}</strong>
            <span>${item.detected.toLocaleString()} / ${item.total.toLocaleString()}</span>
          </div>
          <div class="frequency-track">
            <span style="width: ${item.rate * 100}%"></span>
          </div>
          <em>${formatNumber(item.rate * 100)}%</em>
        </div>
      `,
    )
    .join("");
}

function chartTone(index) {
  return ["tone-red", "tone-amber", "tone-blue", "tone-green", "tone-muted"][index] || "tone-muted";
}

function trendTone(label) {
  if (label === "Increasing") return "tone-red";
  if (label === "Decreasing") return "tone-green";
  return "tone-blue";
}

function renderQaSummary() {
  const flags = filteredFlags();
  const counts = countBy(flags, "issue");
  const topIssues = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const total = flags.length;
  const status = $("#qaStatus");
  status.textContent = !state.records.length ? "Waiting for data" : total ? "Review needed" : "Ready";
  status.classList.toggle("review", Boolean(state.records.length && total));
  status.classList.toggle("clean", Boolean(state.records.length && !total));

  const grid = $("#qaSummaryGrid");
  if (!state.records.length) {
    grid.innerHTML = qaSummaryItem("0", "Flags", "green") + qaSummaryItem("0", "Records screened", "");
    return;
  }
  if (!topIssues.length) {
    grid.innerHTML =
      qaSummaryItem("0", "Open QA flags", "green") +
      qaSummaryItem(filteredRecords().length.toLocaleString(), "Filtered records", "") +
      qaSummaryItem(filteredExceedances().length.toLocaleString(), "Filtered exceedances", "amber") +
      qaSummaryItem(filteredTrends().length.toLocaleString(), "Trend series", "");
    return;
  }
  grid.innerHTML = topIssues
    .map(([issue, count]) => qaSummaryItem(count.toLocaleString(), issue, issueColor(issue)))
    .join("");
}

function qaSummaryItem(value, label, color) {
  return `<div class="qa-summary-item ${color || ""}"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`;
}

function issueColor(issue) {
  if (/missing|unit|reporting|duplicate|qualifier/i.test(issue)) return "amber";
  if (/no criterion/i.test(issue)) return "";
  return "red";
}

function countBy(rows, field) {
  return rows.reduce((accumulator, row) => {
    const key = row[field] || "Other";
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
}

function renderSummary() {
  $("#summaryText").textContent = buildSummary();
  $("#memoPreview").textContent = buildReviewMemo({ preview: true });
  $("#aiPromptPreview").textContent = buildAiReviewPrompt({ preview: true });
}

function buildSummary() {
  if (!state.records.length) return "Upload environmental data to generate a concise screening note.";
  const filtersActive = activeFilterCount() > 0;
  const records = filtersActive ? filteredRecords() : state.records;
  const exceedances = records
    .filter((record) => record.exceedance)
    .sort((a, b) => (b.multiple || 0) - (a.multiple || 0));
  const trends = filtersActive ? filteredTrends() : state.trends;
  const profiles = filtersActive ? filteredDepthProfiles() : state.depthProfiles;
  const flags = filtersActive ? filteredFlags() : state.flags;
  if (!records.length) return "No records match the active filters.";
  const locations = uniqueCount(records, "location");
  const analytes = uniqueCount(records, "canonicalAnalyte");
  const matrices = [...new Set(records.map((record) => record.matrix))].filter(Boolean).join(", ");
  const top = exceedances[0];
  const trend = trends.find((item) => item.status !== "Stable") || trends[0];
  const projectLead = projectSummaryLead();
  const subject = filtersActive ? "filtered view" : state.sourceName || "dataset";
  const pieces = [
    `${projectLead}${projectLead ? `the ${subject}` : `The ${subject}`} contains ${records.length.toLocaleString()} normalized records across ${locations} location${locations === 1 ? "" : "s"}, ${analytes} analyte${analytes === 1 ? "" : "s"}, and ${matrices || "mapped media"}.`,
  ];
  if (exceedances.length) {
    pieces.push(
      `${exceedances.length} result${exceedances.length === 1 ? "" : "s"} exceed starter criteria; the highest multiple is ${top.analyte} at ${top.location} (${formatNumber(top.multiple)}x).`,
    );
  } else {
    pieces.push("No exceedances were identified against the active screening criteria.");
  }
  if (trend) {
    pieces.push(
      `Trend signal: ${trend.analyte} at ${trend.location} is ${trend.status.toLowerCase()} (${formatNumber(trend.percentPerYear)}% per year, R2 ${formatNumber(trend.r2)}).`,
    );
  }
  if (profiles.length) {
    pieces.push(`${profiles.length} depth profile${profiles.length === 1 ? " is" : "s are"} available for same-day vertical sampling review.`);
  }
  if (flags.length) {
    pieces.push(`${flags.length} QA flag${flags.length === 1 ? "" : "s"} should be reviewed before report use.`);
  }
  return pieces.join(" ");
}

function projectSummaryLead() {
  const parts = [];
  if (state.project.projectName) parts.push(state.project.projectName);
  if (state.project.siteName) parts.push(state.project.siteName);
  if (!parts.length) return "";
  return `For ${parts.join(" | ")}, `;
}

function buildReportText() {
  const projectLines = [
    ["Project", state.project.projectName],
    ["Site", state.project.siteName],
    ["Client", state.project.clientName],
    ["Reviewer", state.project.reviewerName],
    ["Review Date", state.project.reviewDate],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`);
  if (state.project.projectNotes) projectLines.push(`Notes: ${state.project.projectNotes}`);
  return [...projectLines, projectLines.length ? "" : null, buildSummary()].filter((line) => line !== null).join("\n");
}

function buildReviewMemo({ preview = false } = {}) {
  if (!state.records.length) return "Upload data to generate a structured review memo.";
  const records = filteredRecords();
  if (!records.length) return "No records match the active filters.";

  const exceedances = filteredExceedances();
  const flags = filteredFlags();
  const trends = filteredTrends();
  const profiles = filteredDepthProfiles();
  const detections = records.filter((record) => !record.nondetect && record.resultValue !== null);
  const matrices = uniqueSorted(records.map((record) => record.matrix)).join(", ") || "mapped media";
  const qaCounts = Object.entries(countBy(flags, "issue")).sort((a, b) => b[1] - a[1]);
  const trendCounts = countBy(trends, "status");
  const lines = [];

  lines.push("E-REV WORKBENCH REVIEW MEMO");
  lines.push("");
  lines.push("PROJECT");
  lines.push(...memoProjectLines());
  lines.push("");
  lines.push("REVIEW SCOPE");
  lines.push(buildSummary());
  lines.push(`Active filters: ${activeFilterDescription()}`);
  lines.push("");
  lines.push("DATASET SUMMARY");
  lines.push(`Records reviewed: ${records.length.toLocaleString()}`);
  lines.push(`Detections: ${detections.length.toLocaleString()}`);
  lines.push(`Matrices: ${matrices}`);
  lines.push(`Locations: ${uniqueCount(records, "location").toLocaleString()}`);
  lines.push(`Analytes: ${uniqueCount(records, "canonicalAnalyte").toLocaleString()}`);
  lines.push("");
  lines.push("SCREENING SUMMARY");
  lines.push(`Exceedances: ${exceedances.length.toLocaleString()}`);
  lines.push(`Top exceedance: ${memoTopExceedance(exceedances)}`);
  lines.push("");
  lines.push("QA SUMMARY");
  if (qaCounts.length) {
    qaCounts.forEach(([issue, count]) => lines.push(`- ${issue}: ${count.toLocaleString()}`));
  } else {
    lines.push("- No QA flags in the current view.");
  }
  lines.push("");
  lines.push("TOP EXCEEDANCES");
  lines.push(...memoExceedanceRows(exceedances, preview ? 5 : 12));
  lines.push("");
  lines.push("TREND SUMMARY");
  lines.push(`Trend series: ${trends.length.toLocaleString()}`);
  lines.push(`Increasing / decreasing / stable: ${trendCounts.Increasing || 0} / ${trendCounts.Decreasing || 0} / ${trendCounts.Stable || 0}`);
  lines.push(...memoTrendRows(trends, preview ? 5 : 10));
  lines.push("");
  lines.push("DEPTH PROFILE SUMMARY");
  lines.push(`Depth profiles: ${profiles.length.toLocaleString()}`);
  lines.push(...memoDepthProfileRows(profiles, preview ? 5 : 10));
  lines.push("");
  lines.push("NOTES AND ASSUMPTIONS");
  lines.push(state.project.projectNotes || "No project notes entered.");
  lines.push("");
  lines.push("SCREENING CRITERIA CAVEAT");
  lines.push("Starter screening values in this prototype are placeholders for workflow testing. Replace them with verified federal, state, client, or project-specific criteria before relying on the memo for formal reporting.");

  return lines.join("\n");
}

function buildAiReviewPrompt({ preview = false } = {}) {
  if (!state.records.length) return "Upload data to generate an AI-ready review prompt.";
  const records = filteredRecords();
  if (!records.length) return "No records match the active filters.";

  const lines = [];
  lines.push("AI ENVIRONMENTAL REVIEW DRAFTING PROMPT");
  lines.push("");
  lines.push("Role:");
  lines.push("You are helping draft environmental consulting review language from an auditable screening output.");
  lines.push("");
  lines.push("Instructions:");
  lines.push("- Draft concise consultant-style narrative for an environmental data review memo.");
  lines.push("- Use the E-Rev Workbench findings below as the source of truth for counts, comparisons, trends, depth profiles, and map summaries.");
  lines.push("- Do not invent screening criteria, regulatory conclusions, cleanup obligations, plume interpretations, or professional opinions beyond the supplied findings.");
  lines.push("- Keep caveats clear: starter criteria are placeholders unless project-verified criteria were imported.");
  lines.push("- Mention QA flags as review items, not final validation decisions.");
  lines.push("- Use plain professional language suitable for an internal draft or project portfolio discussion.");
  lines.push("");
  lines.push("Requested Output:");
  lines.push("1. Executive-style paragraph.");
  lines.push("2. Bullet list of key exceedance, QA, trend, depth profile, and map observations.");
  lines.push("3. Short limitations/caveats paragraph.");
  lines.push("4. Suggested next review steps.");
  lines.push("");
  lines.push("E-Rev Data Packet:");
  lines.push(buildReviewMemo({ preview }));
  return lines.join("\n");
}

function renderAiAssistant() {
  const status = $("#aiAssistantStatus");
  status.textContent = !state.records.length ? "Waiting for data" : activeFilterCount() ? "Filtered brief" : "Ready";
  status.classList.toggle("clean", Boolean(state.records.length && !filteredFlags().length && !filteredExceedances().length));
  status.classList.toggle("review", Boolean(state.records.length && (filteredFlags().length || filteredExceedances().length)));
  $("#aiBriefPreview").textContent = buildAiBrief({ preview: true });
  renderAiDraftChecklist();
}

function buildAiBrief({ preview = false } = {}) {
  if (!state.records.length) return "Upload data to generate a consultant-style draft brief.";
  const records = filteredRecords();
  if (!records.length) return "No records match the active filters.";

  const exceedances = filteredExceedances();
  const flags = filteredFlags();
  const trends = filteredTrends();
  const profiles = filteredDepthProfiles();
  const locations = mappedLocations(records, flags);
  const detections = records.filter((record) => !record.nondetect && record.resultValue !== null);
  const trendCounts = countBy(trends, "status");
  const qaCounts = Object.entries(countBy(flags, "issue")).sort((a, b) => b[1] - a[1]);
  const lines = [];

  lines.push("E-REV AI-ASSISTED REVIEW BRIEF");
  lines.push("");
  lines.push("Executive Draft");
  lines.push(
    `${buildSummary()} This is a screening-level draft built from E-Rev outputs and should be reviewed by the project team before client or regulatory use.`,
  );
  lines.push("");
  lines.push("Key Observations");
  lines.push(`- Records reviewed: ${records.length.toLocaleString()}; detections: ${detections.length.toLocaleString()}; active filters: ${activeFilterDescription()}.`);
  lines.push(`- Screening results: ${exceedances.length.toLocaleString()} exceedance${exceedances.length === 1 ? "" : "s"} in the current view. Top exceedance: ${memoTopExceedance(exceedances)}`);
  if (flags.length) {
    const topQa = qaCounts[0];
    lines.push(`- QA review: ${flags.length.toLocaleString()} flag${flags.length === 1 ? "" : "s"} identified; largest category is ${topQa[0]} (${topQa[1].toLocaleString()}).`);
  } else {
    lines.push("- QA review: no QA flags were identified in the current view.");
  }
  lines.push(
    `- Trends: ${trends.length.toLocaleString()} series available (${trendCounts.Increasing || 0} increasing, ${trendCounts.Decreasing || 0} decreasing, ${trendCounts.Stable || 0} stable).`,
  );
  if (profiles.length) lines.push(`- Depth profiles: ${profiles.length.toLocaleString()} same-day vertical profile${profiles.length === 1 ? "" : "s"} available for boring or depth-interval review.`);
  if (locations.length) lines.push(`- Map view: ${locations.length.toLocaleString()} mapped location${locations.length === 1 ? "" : "s"} in the current view.`);
  lines.push("");
  lines.push("Draft Limitations");
  lines.push("- Starter screening criteria are placeholders unless project-verified criteria have been imported.");
  lines.push("- QA flags are review prompts and do not replace validation or professional judgment.");
  lines.push("- Trend and depth-profile observations are screening aids; confirm them against sampling design, hydrogeology, and site history.");
  lines.push("- Do not present this draft as a final regulatory conclusion, cleanup requirement, or closure opinion.");
  lines.push("");
  lines.push("Suggested Next Steps");
  lines.push("- Verify applicable criteria and units before relying on exceedance calls.");
  lines.push("- Review QA flags and source lab reports for records driving decisions.");
  lines.push("- Use filters to isolate key wells, analytes, dates, and depth intervals for narrative review.");
  lines.push("- Export the review package after the current view reflects the intended memo scope.");

  if (!preview) {
    lines.push("");
    lines.push("Source Memo Packet");
    lines.push(buildReviewMemo());
  }

  return lines.join("\n");
}

function renderAiDraftChecklist() {
  const container = $("#aiDraftChecklist");
  if (!container) return;
  const checks = buildAiDraftChecks($("#aiDraftInput").value);
  container.innerHTML = checks
    .map(
      (check) => `
        <div class="ai-check ${escapeHtml(check.status)}">
          <i></i>
          <div>
            <strong>${escapeHtml(check.label)}</strong>
            <span>${escapeHtml(check.detail)}</span>
          </div>
        </div>
      `,
    )
    .join("");
}

function buildAiDraftChecks(text) {
  if (!state.records.length) {
    return [{ status: "warn", label: "Load data first", detail: "The draft check needs E-Rev findings before it can compare counts and caveats." }];
  }

  const draft = String(text || "").trim();
  if (!draft) {
    return [{ status: "warn", label: "Paste an AI draft", detail: "Paste AI-written text here, then use Check before sharing or exporting language." }];
  }

  const records = filteredRecords();
  const exceedances = filteredExceedances();
  const flags = filteredFlags();
  const trends = filteredTrends();
  const profiles = filteredDepthProfiles();
  const checks = [];
  const add = (condition, label, passDetail, failDetail, failStatus = "fail") => {
    checks.push({ status: condition ? "pass" : failStatus, label, detail: condition ? passDetail : failDetail });
  };

  add(textHasCount(draft, records.length), "Record count", "Draft includes the current record count.", `Expected ${records.length.toLocaleString()} records in the current view.`);
  add(textHasCount(draft, exceedances.length), "Exceedance count", "Draft includes the current exceedance count.", `Expected ${exceedances.length.toLocaleString()} exceedances in the current view.`);
  add(textHasCount(draft, flags.length), "QA flag count", "Draft includes the current QA flag count.", `Expected ${flags.length.toLocaleString()} QA flags in the current view.`, flags.length ? "fail" : "warn");
  add(/criteria|screening|standard|level/i.test(draft) && /placeholder|verified|project-specific|starter|caveat/i.test(draft), "Criteria caveat", "Draft includes a screening-criteria caveat.", "Add a caveat that starter criteria are placeholders unless verified.");
  add(!flags.length || /qa|quality|flag|validation|review/i.test(draft), "QA language", "Draft acknowledges QA review.", "Mention QA flags as review items before relying on memo language.");
  add(!trends.length || /trend|increasing|decreasing|stable/i.test(draft), "Trend language", "Draft references trend findings.", "Mention trend findings or state why they are not discussed.", "warn");
  add(!profiles.length || /depth|profile|boring|interval|vertical/i.test(draft), "Depth-profile language", "Draft references depth-profile findings.", "Mention same-day depth profiles where relevant.", "warn");

  const overreach = hasOverreachLanguage(draft);
  add(!overreach, "Overreach scan", "No common unsupported regulatory conclusions found.", "Review wording for unsupported regulatory, cleanup, closure, or risk conclusions.");

  return checks;
}

function hasOverreachLanguage(text) {
  const patterns = [
    /cleanup required/i,
    /no further action/i,
    /regulatory closure/i,
    /\bcompliant\b/i,
    /\bnon[- ]?compliant\b/i,
    /safe for/i,
    /no risk/i,
    /violat(?:es|ion)/i,
    /approved by/i,
  ];
  return patterns.some((pattern) => {
    const match = pattern.exec(text);
    if (!match) return false;
    const before = text.slice(Math.max(0, match.index - 40), match.index).toLowerCase();
    return !/\b(not|avoid|without|should not|do not|does not|not a)\b/.test(before);
  });
}

function textHasCount(text, count) {
  const normalized = String(text || "").replace(/,/g, "");
  if (count === 0) return /\b0\b|\bno\b|\bnone\b|\bzero\b/i.test(normalized);
  return new RegExp(`\\b${String(count)}\\b`).test(normalized);
}

function buildReviewPackageHtml() {
  const records = filteredRecords();
  const exceedances = filteredExceedances();
  const flags = filteredFlags();
  const trends = filteredTrends();
  const profiles = filteredDepthProfiles();
  const locations = mappedLocations(records, flags);
  const detections = records.filter((record) => !record.nondetect && record.resultValue !== null);
  const matrices = uniqueSorted(records.map((record) => record.matrix)).join(", ") || "mapped media";
  const generatedAt = new Date().toLocaleString();
  const chartSnapshots = [
    chartSnapshot("#trendCanvas", "Trend View"),
    chartSnapshot("#depthCanvas", "Depth Profile View"),
    chartSnapshot("#mapCanvas", "Map View"),
  ];

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(packageTitle())}</title>
    <style>${reviewPackageCss()}</style>
  </head>
  <body>
    <main class="report">
      <header class="hero">
        <p>Environmental Consulting Review</p>
        <h1>${escapeHtml(packageTitle())}</h1>
        <div class="meta">
          <span>Generated: ${escapeHtml(generatedAt)}</span>
          <span>Active filters: ${escapeHtml(activeFilterDescription())}</span>
          <span>Source: ${escapeHtml(state.sourceName || "Not specified")}</span>
        </div>
      </header>

      <section>
        <h2>Project</h2>
        ${packageTable(
          ["Field", "Value"],
          [
            ["Project", state.project.projectName || "-"],
            ["Site", state.project.siteName || "-"],
            ["Client", state.project.clientName || "-"],
            ["Reviewer", state.project.reviewerName || "-"],
            ["Review Date", state.project.reviewDate || "-"],
            ["Notes", state.project.projectNotes || "-"],
          ],
          "No project setup entered.",
        )}
      </section>

      <section>
        <h2>Review Summary</h2>
        <p class="lead">${escapeHtml(buildSummary())}</p>
        <div class="metrics">
          ${packageMetric("Records", records.length)}
          ${packageMetric("Detections", detections.length)}
          ${packageMetric("Exceedances", exceedances.length)}
          ${packageMetric("QA Flags", flags.length)}
          ${packageMetric("Trend Series", trends.length)}
          ${packageMetric("Depth Profiles", profiles.length)}
          ${packageMetric("Mapped Locations", locations.length)}
          ${packageMetric("Matrices", matrices)}
        </div>
      </section>

      <section>
        <h2>QA Summary</h2>
        ${packageTable(
          ["Issue", "Count"],
          Object.entries(countBy(flags, "issue"))
            .sort((a, b) => b[1] - a[1])
            .map(([issue, count]) => [issue, count.toLocaleString()]),
          "No QA flags in the current view.",
        )}
      </section>

      <section>
        <h2>Top Exceedances</h2>
        ${packageTable(
          ["Location", "Date", "Matrix", "Analyte", "Result", "Criterion", "Multiple"],
          exceedances.slice(0, 15).map((record) => [
            record.location,
            record.date,
            record.matrix,
            record.analyte,
            `${formatNumber(record.normalizedValue)} ${displayUnit(record.normalizedUnit)}`,
            `${formatNumber(record.criterion)} ${displayUnit(record.normalizedUnit)}`,
            `${formatNumber(record.multiple)}x`,
          ]),
          "No exceedances identified against active criteria.",
        )}
      </section>

      <section>
        <h2>Trend Summary</h2>
        ${packageTable(
          ["Location", "Matrix", "Analyte", "Status", "Change / Year", "R2", "Next Estimate"],
          trends.slice(0, 12).map((trend) => [
            trend.location,
            trend.matrix,
            trend.analyte,
            trend.status,
            `${formatNumber(trend.percentPerYear)}%`,
            formatNumber(trend.r2),
            `${formatNumber(trend.predictedNext)} ${displayUnit(trend.units)}`,
          ]),
          "No trend series available in the current view.",
        )}
      </section>

      <section>
        <h2>Depth Profile Summary</h2>
        ${packageTable(
          ["Location", "Date", "Matrix", "Analyte", "Depth Range", "Points", "Max Result"],
          profiles.slice(0, 12).map((profile) => [
            profile.location,
            profile.date,
            profile.matrix,
            profile.analyte,
            `${formatNumber(profile.shallowDepth)}-${formatNumber(profile.deepDepth)} ft`,
            profile.pointCount,
            `${formatNumber(profile.maxValue)} ${displayUnit(profile.units)}`,
          ]),
          "No depth profiles available in the current view.",
        )}
      </section>

      <section>
        <h2>Map Location Summary</h2>
        ${packageTable(
          ["Location", "Status", "Latitude", "Longitude", "Records", "Detections", "Exceedances", "QA Flags"],
          locations.slice(0, 20).map((location) => [
            location.location,
            location.status,
            formatCoordinate(location.latitude),
            formatCoordinate(location.longitude),
            location.recordCount,
            location.detectionCount,
            location.exceedanceCount,
            location.qaFlagCount,
          ]),
          "No mapped locations in the current view.",
        )}
      </section>

      <section>
        <h2>Chart Snapshots</h2>
        <div class="charts">
          ${chartSnapshots.map(packageChartFigure).join("")}
        </div>
      </section>

      <section>
        <h2>Review Memo Text</h2>
        <pre>${escapeHtml(buildReviewMemo())}</pre>
      </section>

      <section>
        <h2>AI Review Prompt</h2>
        <pre>${escapeHtml(buildAiReviewPrompt())}</pre>
      </section>

      <section>
        <h2>AI Assistant Brief</h2>
        <pre>${escapeHtml(buildAiBrief())}</pre>
      </section>

      <section>
        <h2>Screening Criteria Caveat</h2>
        <p class="caveat">Starter screening values in this prototype are placeholders for workflow testing. Replace them with verified federal, state, client, or project-specific criteria before relying on this package for formal reporting.</p>
      </section>
    </main>
  </body>
</html>`;
}

function buildDemoBriefHtml() {
  const hasData = Boolean(state.records.length);
  const records = hasData ? filteredRecords() : [];
  const flags = hasData ? filteredFlags() : [];
  const exceedances = hasData ? filteredExceedances() : [];
  const trends = hasData ? filteredTrends() : [];
  const profiles = hasData ? filteredDepthProfiles() : [];
  const locations = hasData ? mappedLocations(records, flags) : [];
  const generatedAt = new Date().toLocaleString();
  const dataSummary = hasData
    ? buildSummary()
    : "Load the realistic sample to show the full workflow, or upload a project CSV to demonstrate field mapping and review outputs.";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>E-Rev Workbench Portfolio Brief</title>
    <style>${demoBriefCss()}</style>
  </head>
  <body>
    <main class="brief">
      <header>
        <p>Environmental Consulting Review</p>
        <h1>E-Rev Workbench Portfolio Brief</h1>
        <div class="meta">
          <span>Generated: ${escapeHtml(generatedAt)}</span>
          <span>Project: ${escapeHtml(state.project.projectName || "Portfolio demo")}</span>
          <span>Data: ${escapeHtml(state.sourceName || "No dataset loaded")}</span>
        </div>
      </header>

      <section>
        <h2>Project Summary</h2>
        <p>E-Rev Workbench is a local portfolio prototype inspired by the idea of streamlining spreadsheet-heavy environmental consulting review. It reads result tables, maps environmental fields, normalizes units, screens starter criteria, flags QA review items, builds trend and depth-profile views, maps sample locations, and exports an auditable review package.</p>
        <p>The intent is not to replace professional judgment. The app handles repeatable first-pass review steps so a consultant can spend more time on interpretation, hydrogeologic context, and client-ready communication.</p>
      </section>

      <section>
        <h2>What This Demonstrates</h2>
        <ul>
          <li>Environmental workflow thinking: field mapping, QA triage, screening criteria, trends, depth profiles, maps, and exportable notes.</li>
          <li>Product judgment: the first screen is the working review tool, not a landing page.</li>
          <li>Responsible AI design: calculations stay deterministic, and AI is positioned as drafting support from verified findings.</li>
          <li>Practical delivery: the core CSV workflow can run as a static browser app on GitHub Pages or Netlify.</li>
        </ul>
      </section>

      <section>
        <h2>Current Demo Snapshot</h2>
        <p>${escapeHtml(dataSummary)}</p>
        <div class="metrics">
          ${demoBriefMetric("Records", records.length)}
          ${demoBriefMetric("Exceedances", exceedances.length)}
          ${demoBriefMetric("QA Flags", flags.length)}
          ${demoBriefMetric("Trends", trends.length)}
          ${demoBriefMetric("Depth Profiles", profiles.length)}
          ${demoBriefMetric("Mapped Locations", locations.length)}
        </div>
      </section>

      <section>
        <h2>Consulting Value</h2>
        <ul>
          <li>Reduces repetitive spreadsheet sorting, filtering, and manual summary work.</li>
          <li>Standardizes early QA review for missing fields, unit issues, reporting-limit concerns, duplicate-like rows, and missing criteria.</li>
          <li>Keeps calculations deterministic and traceable before any AI drafting support is used.</li>
          <li>Creates exportable tables, memo text, AI-ready prompts, and a self-contained HTML review package.</li>
          <li>Supports faster internal review while preserving the need for consultant judgment.</li>
        </ul>
      </section>

      <section>
        <h2>Demo Script</h2>
        <ol>
          <li>Open E-Rev and load the realistic sample.</li>
          <li>Point out the detected field mapping and editable screening criteria.</li>
          <li>Use the dashboard counts to explain the first-pass review scope.</li>
          <li>Filter to SB-3 Lead to show why same-day boring intervals become depth profiles rather than vertical time-trend lines.</li>
          <li>Show the Map View, then export the review package and AI assistant brief.</li>
        </ol>
      </section>

      <section>
        <h2>AI Positioning</h2>
        <p>The current static prototype does not call a live AI model. E-Rev generates deterministic findings locally, then produces an AI-ready prompt, a local draft brief, and a draft QA checker. A production version would add a secure backend that sends verified E-Rev findings to an AI model for narrative drafting without exposing API keys or project data directly in the browser.</p>
      </section>

      <section>
        <h2>Deployment Fit</h2>
        <p>E-Rev is a static HTML, CSS, and JavaScript project with no required build step. The reliable share path is CSV, TSV, or TXT data. Excel parsing, basemap tiles, and Google Maps handoff are optional online enhancements.</p>
      </section>

      <section>
        <h2>Future Build Path</h2>
        <ul>
          <li>Verified federal, state, client, and project-specific criteria libraries.</li>
          <li>Secure AI backend for memo drafting and review comments.</li>
          <li>Word/PDF exports aligned to client or company templates.</li>
          <li>Project storage, versioned reviews, and reviewer signoff workflow.</li>
          <li>Expanded GIS tools for basemaps, plume figures, and well-network context.</li>
        </ul>
      </section>

      <footer>
        <p>Uses fictitious sample data and placeholder screening criteria. Trend labels and exceedance checks are first-pass review aids, not regulatory conclusions.</p>
      </footer>
    </main>
  </body>
</html>`;
}

function demoBriefMetric(label, value) {
  return `
    <article>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(Number(value).toLocaleString())}</strong>
    </article>
  `;
}

function demoBriefCss() {
  return `
    :root { color-scheme: light; --ink: #18211f; --muted: #64706c; --line: #d9e1dd; --accent: #147d6f; --bg: #f5f7f6; --surface: #fff; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--ink); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .brief { max-width: 980px; margin: 0 auto; padding: 28px; }
    header, section, footer { border: 1px solid var(--line); border-radius: 8px; background: var(--surface); padding: 18px; margin-bottom: 14px; }
    header { border-top: 5px solid var(--accent); }
    header p { margin: 0 0 5px; color: var(--accent); font-size: 0.78rem; font-weight: 800; text-transform: uppercase; }
    h1, h2 { margin: 0; line-height: 1.2; }
    h1 { font-size: 1.8rem; }
    h2 { margin-bottom: 10px; font-size: 1.05rem; }
    p, li { color: #2c3835; font-size: 0.94rem; line-height: 1.55; }
    p { margin: 0 0 8px; }
    p:last-child { margin-bottom: 0; }
    ul, ol { margin: 0; padding-left: 20px; }
    li + li { margin-top: 6px; }
    .meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; color: var(--muted); font-size: 0.84rem; }
    .meta span { border: 1px solid var(--line); border-radius: 999px; padding: 5px 9px; background: #fbfcfc; }
    .metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
    .metrics article { border: 1px solid var(--line); border-radius: 8px; padding: 11px; background: #fbfcfc; }
    .metrics span { display: block; color: var(--muted); font-size: 0.72rem; font-weight: 800; text-transform: uppercase; }
    .metrics strong { display: block; margin-top: 5px; font-size: 1.25rem; }
    footer p { color: var(--muted); font-size: 0.86rem; }
    @media (max-width: 720px) { .brief { padding: 14px; } .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media print { body { background: #fff; } .brief { max-width: none; padding: 0; } header, section, footer { break-inside: avoid; } }
  `;
}

function packageTitle() {
  return `${state.project.projectName || state.project.siteName || "E-Rev"} Review Package`;
}

function packageMetric(label, value) {
  return `
    <article>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(typeof value === "number" ? value.toLocaleString() : value)}</strong>
    </article>
  `;
}

function packageTable(headers, rows, emptyMessage) {
  if (!rows.length) return `<p class="empty">${escapeHtml(emptyMessage)}</p>`;
  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows
            .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function chartSnapshot(selector, label) {
  const canvas = $(selector);
  if (!canvas) return { label, image: "" };
  try {
    return { label, image: canvas.toDataURL("image/png") };
  } catch {
    return { label, image: "" };
  }
}

function packageChartFigure(snapshot) {
  if (!snapshot.image) {
    return `<figure><figcaption>${escapeHtml(snapshot.label)}</figcaption><p class="empty">Chart image was not available for export.</p></figure>`;
  }
  return `
    <figure>
      <figcaption>${escapeHtml(snapshot.label)}</figcaption>
      <img src="${escapeHtml(snapshot.image)}" alt="${escapeHtml(snapshot.label)} snapshot" />
    </figure>
  `;
}

function reviewPackageCss() {
  return `
    :root { color-scheme: light; --ink: #18211f; --muted: #64706c; --line: #d9e1dd; --accent: #147d6f; --surface: #ffffff; --bg: #f5f7f6; --red: #b83232; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--ink); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .report { max-width: 1120px; margin: 0 auto; padding: 28px; }
    .hero, section { border: 1px solid var(--line); border-radius: 8px; background: var(--surface); padding: 18px; margin-bottom: 16px; }
    .hero { border-top: 5px solid var(--accent); }
    .hero p { margin: 0 0 5px; color: var(--accent); font-size: 0.78rem; font-weight: 800; text-transform: uppercase; }
    h1, h2 { margin: 0; line-height: 1.2; }
    h1 { font-size: 1.8rem; }
    h2 { margin-bottom: 12px; font-size: 1.05rem; }
    .meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; color: var(--muted); font-size: 0.85rem; }
    .meta span { border: 1px solid var(--line); border-radius: 999px; padding: 5px 9px; background: #fbfcfc; }
    .lead, .caveat { margin: 0; color: #293532; font-size: 0.96rem; line-height: 1.55; }
    .metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 14px; }
    .metrics article { border: 1px solid var(--line); border-radius: 8px; padding: 12px; background: #fbfcfc; }
    .metrics span { display: block; color: var(--muted); font-size: 0.74rem; font-weight: 800; text-transform: uppercase; }
    .metrics strong { display: block; margin-top: 6px; font-size: 1.25rem; }
    .table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; min-width: 680px; }
    th, td { border-bottom: 1px solid var(--line); padding: 9px; text-align: left; vertical-align: top; font-size: 0.86rem; }
    th { background: #eef4f1; color: #3b4744; font-size: 0.74rem; text-transform: uppercase; }
    tr:last-child td { border-bottom: 0; }
    .charts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    figure { margin: 0; border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: #fbfcfc; }
    figcaption { margin-bottom: 8px; color: #3b4744; font-size: 0.82rem; font-weight: 800; }
    img { display: block; width: 100%; height: auto; border: 1px solid var(--line); border-radius: 6px; background: #fff; }
    pre { overflow: auto; white-space: pre-wrap; border: 1px solid var(--line); border-radius: 8px; background: #fbfcfc; padding: 13px; color: #293532; font-family: "Cascadia Mono", "SFMono-Regular", Consolas, monospace; font-size: 0.8rem; line-height: 1.55; }
    .empty { margin: 0; color: var(--muted); font-size: 0.9rem; line-height: 1.45; }
    @media (max-width: 760px) { .report { padding: 14px; } .metrics, .charts { grid-template-columns: 1fr; } }
    @media print { body { background: #fff; } .report { max-width: none; padding: 0; } section, .hero { break-inside: avoid; box-shadow: none; } }
  `;
}

function memoProjectLines() {
  const lines = [
    ["Project", state.project.projectName],
    ["Site", state.project.siteName],
    ["Client", state.project.clientName],
    ["Reviewer", state.project.reviewerName],
    ["Review Date", state.project.reviewDate],
    ["Data Source", state.sourceName],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`);
  return lines.length ? lines : ["No project setup entered."];
}

function activeFilterDescription() {
  const parts = [];
  if (state.filters.matrix) parts.push(`matrix=${state.filters.matrix}`);
  if (state.filters.location) parts.push(`location=${state.filters.location}`);
  if (state.filters.analyte) parts.push(`analyte=${state.filters.analyte}`);
  if (state.filters.dateFrom) parts.push(`from=${state.filters.dateFrom}`);
  if (state.filters.dateTo) parts.push(`to=${state.filters.dateTo}`);
  if (state.filters.search) parts.push(`search="${state.filters.search}"`);
  if (state.filters.exceedanceOnly) parts.push("exceedances only");
  return parts.length ? parts.join("; ") : "none";
}

function memoTopExceedance(exceedances) {
  const top = exceedances[0];
  if (!top) return "None identified against active criteria.";
  return `${top.analyte} at ${top.location}, ${formatNumber(top.normalizedValue)} ${displayUnit(top.normalizedUnit)} vs ${formatNumber(top.criterion)} ${displayUnit(top.normalizedUnit)} (${formatNumber(top.multiple)}x).`;
}

function memoExceedanceRows(exceedances, limit) {
  if (!exceedances.length) return ["No exceedances identified in the current view."];
  const rows = ["Location | Date | Matrix | Analyte | Result | Criterion | Multiple"];
  exceedances.slice(0, limit).forEach((record) => {
    rows.push(
      `${record.location} | ${record.date} | ${record.matrix} | ${record.analyte} | ${formatNumber(record.normalizedValue)} ${displayUnit(record.normalizedUnit)} | ${formatNumber(record.criterion)} ${displayUnit(record.normalizedUnit)} | ${formatNumber(record.multiple)}x`,
    );
  });
  if (exceedances.length > limit) rows.push(`...${(exceedances.length - limit).toLocaleString()} additional exceedance rows not shown in preview.`);
  return rows;
}

function memoTrendRows(trends, limit) {
  if (!trends.length) return ["No trend series available in the current view."];
  const rows = ["Location | Matrix | Analyte | Status | Change/yr | R2 | Next estimate"];
  trends.slice(0, limit).forEach((trend) => {
    rows.push(
      `${trend.location} | ${trend.matrix} | ${trend.analyte} | ${trend.status} | ${formatNumber(trend.percentPerYear)}% | ${formatNumber(trend.r2)} | ${formatNumber(trend.predictedNext)} ${displayUnit(trend.units)}`,
    );
  });
  if (trends.length > limit) rows.push(`...${(trends.length - limit).toLocaleString()} additional trend rows not shown in preview.`);
  return rows;
}

function memoDepthProfileRows(profiles, limit) {
  if (!profiles.length) return ["No depth profiles available in the current view."];
  const rows = ["Location | Date | Matrix | Analyte | Depth range | Max result"];
  profiles.slice(0, limit).forEach((profile) => {
    rows.push(
      `${profile.location} | ${profile.date} | ${profile.matrix} | ${profile.analyte} | ${formatNumber(profile.shallowDepth)}-${formatNumber(profile.deepDepth)} ft | ${formatNumber(profile.maxValue)} ${displayUnit(profile.units)}`,
    );
  });
  if (profiles.length > limit) rows.push(`...${(profiles.length - limit).toLocaleString()} additional depth profiles not shown in preview.`);
  return rows;
}

function uniqueCount(records, field) {
  return new Set(records.map((record) => record[field]).filter(Boolean)).size;
}

function filteredRecords() {
  return state.records.filter(recordMatchesFilters);
}

function filteredExceedances() {
  return filteredRecords()
    .filter((record) => record.exceedance)
    .sort((a, b) => (b.multiple || 0) - (a.multiple || 0));
}

function filteredFlags() {
  return state.flags.filter((flagRecord) => {
    if (state.filters.matrix && flagRecord.matrix !== state.filters.matrix) return false;
    if (state.filters.location && flagRecord.location !== state.filters.location) return false;
    if (state.filters.analyte && flagRecord.analyte !== state.filters.analyte) return false;
    if (state.filters.dateFrom && flagRecord.date < state.filters.dateFrom) return false;
    if (state.filters.dateTo && flagRecord.date > state.filters.dateTo) return false;
    const search = state.filters.search.trim().toLowerCase();
    if (search) {
      const haystack = [flagRecord.location, flagRecord.date, flagRecord.matrix, flagRecord.analyte, flagRecord.issue, flagRecord.note]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (state.filters.exceedanceOnly) {
      return filteredExceedances().some((record) => record.row === flagRecord.row);
    }
    return true;
  });
}

function filteredTrends() {
  return calculateTrends(recordsForGroupedView(trendGroupKey));
}

function filteredDepthProfiles() {
  return calculateDepthProfiles(recordsForGroupedView(depthGroupKey));
}

function recordsForGroupedView(groupKeyFn) {
  const baseRecords = state.records.filter((record) => recordMatchesFilters(record, { ignoreExceedanceOnly: true }));
  if (!state.filters.exceedanceOnly) return baseRecords;
  const qualifyingGroups = new Set(
    baseRecords
      .filter((record) => record.exceedance)
      .map(groupKeyFn)
      .filter(Boolean),
  );
  return baseRecords.filter((record) => qualifyingGroups.has(groupKeyFn(record)));
}

function mappedLocations(records = filteredRecords(), flags = filteredFlags()) {
  const flagsByRow = flags.reduce((accumulator, flagRecord) => {
    accumulator.set(flagRecord.row, (accumulator.get(flagRecord.row) || 0) + 1);
    return accumulator;
  }, new Map());
  const groups = new Map();
  records.forEach((record) => {
    if (!Number.isFinite(record.latitude) || !Number.isFinite(record.longitude) || !record.location) return;
    if (!groups.has(record.location)) {
      groups.set(record.location, {
        location: record.location,
        latitudeTotal: 0,
        longitudeTotal: 0,
        coordinateCount: 0,
        recordCount: 0,
        detectionCount: 0,
        exceedanceCount: 0,
        qaFlagCount: 0,
        analytes: new Set(),
        matrices: new Set(),
        maxMultiple: null,
        latestDate: "",
      });
    }
    const group = groups.get(record.location);
    group.latitudeTotal += record.latitude;
    group.longitudeTotal += record.longitude;
    group.coordinateCount += 1;
    group.recordCount += 1;
    if (!record.nondetect && record.resultValue !== null) group.detectionCount += 1;
    if (record.exceedance) group.exceedanceCount += 1;
    group.qaFlagCount += flagsByRow.get(record.row) || 0;
    if (record.analyte) group.analytes.add(record.canonicalAnalyte || record.analyte);
    if (record.matrix) group.matrices.add(record.matrix);
    if (record.multiple !== null) group.maxMultiple = Math.max(group.maxMultiple || 0, record.multiple);
    if (record.date && record.date > group.latestDate) group.latestDate = record.date;
  });

  return [...groups.values()]
    .map((group) => ({
      location: group.location,
      latitude: group.latitudeTotal / group.coordinateCount,
      longitude: group.longitudeTotal / group.coordinateCount,
      recordCount: group.recordCount,
      detectionCount: group.detectionCount,
      exceedanceCount: group.exceedanceCount,
      qaFlagCount: group.qaFlagCount,
      analyteCount: group.analytes.size,
      matrixCount: group.matrices.size,
      maxMultiple: group.maxMultiple,
      latestDate: group.latestDate,
      status: group.exceedanceCount ? "Exceeds" : group.qaFlagCount ? "QA review" : "Below / nondetect",
      tone: group.exceedanceCount ? "red" : group.qaFlagCount ? "amber" : "green",
    }))
    .sort((a, b) => b.exceedanceCount - a.exceedanceCount || b.qaFlagCount - a.qaFlagCount || a.location.localeCompare(b.location));
}

function projectMapLocations(locations) {
  if (!locations.length) return [];
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

function trendGroupKey(record) {
  if (!record.location || !record.matrix || !record.canonicalAnalyte) return "";
  return `${record.location}|${record.matrix}|${record.canonicalAnalyte}`;
}

function depthGroupKey(record) {
  if (!record.location || !record.date || !record.matrix || !record.canonicalAnalyte) return "";
  return `${record.location}|${record.date}|${record.matrix}|${record.canonicalAnalyte}`;
}

function recordMatchesFilters(record, options = {}) {
  if (state.filters.matrix && record.matrix !== state.filters.matrix) return false;
  if (state.filters.location && record.location !== state.filters.location) return false;
  if (state.filters.analyte && record.analyte !== state.filters.analyte) return false;
  if (state.filters.dateFrom && record.date < state.filters.dateFrom) return false;
  if (state.filters.dateTo && record.date > state.filters.dateTo) return false;
  if (!options.ignoreExceedanceOnly && state.filters.exceedanceOnly && !record.exceedance) return false;
  const search = state.filters.search.trim().toLowerCase();
  if (search) {
    const haystack = [
      record.sampleId,
      record.location,
      record.date,
      record.matrix,
      record.analyte,
      record.qualifier,
      record.criterionSource,
      record.comparison,
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(search)) return false;
  }
  return true;
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
}

function renderTrendPicker() {
  const select = $("#trendSelect");
  select.innerHTML = "";
  const trends = filteredTrends();
  if (!trends.length) {
    select.innerHTML = '<option value="">No trend series</option>';
    state.selectedTrend = "";
    return;
  }
  trends.forEach((trend) => {
    const option = document.createElement("option");
    option.value = trend.key;
    option.textContent = `${trend.location} | ${trend.analyte} | ${trend.status}`;
    select.append(option);
  });
  if (!trends.some((trend) => trend.key === state.selectedTrend)) {
    state.selectedTrend = trends[0].key;
  }
  select.value = state.selectedTrend;
}

function renderDepthProfilePicker() {
  const select = $("#depthProfileSelect");
  select.innerHTML = "";
  const profiles = filteredDepthProfiles();
  if (!profiles.length) {
    select.innerHTML = '<option value="">No depth profiles</option>';
    state.selectedDepthProfile = "";
    return;
  }
  profiles.forEach((profile) => {
    const option = document.createElement("option");
    option.value = profile.key;
    option.textContent = `${profile.location} | ${profile.analyte} | ${profile.date}`;
    select.append(option);
  });
  if (!profiles.some((profile) => profile.key === state.selectedDepthProfile)) {
    state.selectedDepthProfile = profiles[0].key;
  }
  select.value = state.selectedDepthProfile;
}

function renderActiveView() {
  $$(".tab").forEach((button) => button.classList.toggle("active", button.dataset.view === state.activeView));
  const titleMap = {
    exceedances: "Exceedances",
    qa: "QA Flags",
    trends: "Trends",
    profiles: "Depth Profiles",
    map: "Map Locations",
    clean: "Clean Data",
  };
  $("#tableTitle").textContent = titleMap[state.activeView];
  const records = filteredRecords();
  const exceedances = filteredExceedances();
  const flags = filteredFlags();
  const trends = filteredTrends();
  const profiles = filteredDepthProfiles();
  const locations = mappedLocations(records, flags);

  if (state.activeView === "exceedances") {
    renderTable(
      exceedances.map((record) => ({
        Location: record.location,
        Date: record.date,
        Matrix: record.matrix,
        Analyte: record.analyte,
        Result: `${formatNumber(record.normalizedValue)} ${displayUnit(record.normalizedUnit)}`,
        Criterion: `${formatNumber(record.criterion)} ${displayUnit(record.normalizedUnit)}`,
        Multiple: `${formatNumber(record.multiple)}x`,
        Qualifier: record.qualifier || "",
      })),
      "No exceedances against active criteria.",
    );
  } else if (state.activeView === "qa") {
    renderTable(flags, "No QA flags.");
  } else if (state.activeView === "trends") {
    renderTable(
      trends.map((trend) => ({
        Location: trend.location,
        Matrix: trend.matrix,
        Analyte: trend.analyte,
        Status: trend.status,
        "Change / year": `${formatNumber(trend.percentPerYear)}%`,
        R2: formatNumber(trend.r2),
        Latest: `${formatNumber(trend.latestValue)} ${displayUnit(trend.units)}`,
        "Next estimate": `${formatNumber(trend.predictedNext)} ${displayUnit(trend.units)}`,
      })),
      "At least three dated detections are needed for a trend.",
    );
  } else if (state.activeView === "profiles") {
    renderTable(
      profiles.map((profile) => ({
        Location: profile.location,
        Date: profile.date,
        Matrix: profile.matrix,
        Analyte: profile.analyte,
        Depths: `${formatNumber(profile.shallowDepth)}-${formatNumber(profile.deepDepth)} ft`,
        Points: profile.pointCount,
        "Max result": `${formatNumber(profile.maxValue)} ${displayUnit(profile.units)}`,
        Criterion: profile.criterion === null ? "" : `${formatNumber(profile.criterion)} ${displayUnit(profile.units)}`,
      })),
      "At least two mapped depth intervals are needed for a depth profile.",
    );
  } else if (state.activeView === "map") {
    renderTable(
      locations.map((location) => ({
        Location: location.location,
        Status: location.status,
        Latitude: formatCoordinate(location.latitude),
        Longitude: formatCoordinate(location.longitude),
        Records: location.recordCount,
        Detections: location.detectionCount,
        Exceedances: location.exceedanceCount,
        "QA flags": location.qaFlagCount,
        Analytes: location.analyteCount,
        "Latest date": location.latestDate,
      })),
      "No mapped locations in the current view.",
    );
  } else {
    const previewLimit = 300;
    renderTable(
      records.slice(0, previewLimit).map((record) => ({
        Row: record.row,
        "Sample ID": record.sampleId,
        Location: record.location,
        Date: record.date,
        Matrix: record.matrix,
        Analyte: record.analyte,
        Result: record.rawResult,
        Units: displayUnit(record.units),
        Normalized: record.normalizedValue === null ? "" : `${formatNumber(record.normalizedValue)} ${displayUnit(record.normalizedUnit)}`,
        Depth: record.depth,
        Latitude: record.latitude === null ? "" : formatCoordinate(record.latitude),
        Longitude: record.longitude === null ? "" : formatCoordinate(record.longitude),
        Comparison: record.comparison,
      })),
      "No clean records yet.",
      records.length > previewLimit
        ? `Showing the first ${previewLimit.toLocaleString()} of ${records.length.toLocaleString()} matching records. CSV export includes all matching records.`
        : "",
    );
  }
  refreshIcons();
}

function renderTable(rows, emptyMessage, note = "") {
  const container = $("#activeTable");
  if (!rows.length) {
    container.innerHTML = `<div class="empty-state">${escapeHtml(emptyMessage)}</div>`;
    return;
  }
  const headers = Object.keys(rows[0]);
  const html = `
    <table>
      <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
      <tbody>
        ${rows
          .map(
            (row) =>
              `<tr>${headers
                .map((header) => `<td>${formatCell(header, row[header])}</td>`)
                .join("")}</tr>`,
          )
          .join("")}
      </tbody>
    </table>
  `;
  container.innerHTML = `${note ? `<p class="table-note">${escapeHtml(note)}</p>` : ""}${html}`;
}

function formatCell(header, value) {
  const text = escapeHtml(value ?? "");
  if (header === "Status") {
    const color =
      value === "Increasing" || value === "Exceeds"
        ? "red"
        : value === "Decreasing" || value === "Below / nondetect"
          ? "green"
          : value === "QA review"
            ? "amber"
            : "blue";
    return `<span class="badge ${color}">${text}</span>`;
  }
  if (header === "issue" || header === "Issue") return `<span class="badge amber">${text}</span>`;
  return text;
}

function drawTrendChart() {
  const canvas = $("#trendCanvas");
  const context = canvas.getContext("2d");
  const trend = filteredTrends().find((item) => item.key === (state.selectedTrend || $("#trendSelect").value));
  const ratio = window.devicePixelRatio || 1;
  const bounds = canvas.getBoundingClientRect();
  canvas.width = Math.max(600, Math.floor(bounds.width * ratio));
  canvas.height = Math.floor(360 * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  const width = canvas.width / ratio;
  const height = canvas.height / ratio;
  context.clearRect(0, 0, width, height);

  context.fillStyle = "#fcfefd";
  context.fillRect(0, 0, width, height);

  if (!trend) {
    context.fillStyle = "#64706c";
    context.font = "14px system-ui";
    context.textAlign = "center";
    context.fillText("At least three dated detections are needed for a trend.", width / 2, height / 2);
    return;
  }

  const margin = { top: 34, right: 28, bottom: 86, left: 82 };
  const trendUnit = displayUnit(trend.units);
  const points = trend.points.map((point) => ({
    x: new Date(point.date).getTime(),
    y: point.normalizedValue,
  }));
  const xMin = Math.min(...points.map((point) => point.x));
  const xMax = Math.max(...points.map((point) => point.x));
  const yValues = points.map((point) => point.y).concat(trend.criterion || []);
  const yMax = Math.max(...yValues) * 1.18;
  const yMin = 0;
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const xScale = (value) => margin.left + ((value - xMin) / Math.max(1, xMax - xMin)) * plotW;
  const yScale = (value) => margin.top + plotH - ((value - yMin) / Math.max(1, yMax - yMin)) * plotH;

  context.strokeStyle = "#d9e1dd";
  context.lineWidth = 1;
  context.beginPath();
  for (let i = 0; i <= 4; i += 1) {
    const y = margin.top + (plotH / 4) * i;
    context.moveTo(margin.left, y);
    context.lineTo(width - margin.right, y);
  }
  context.stroke();

  context.fillStyle = "#64706c";
  context.font = "12px system-ui";
  context.textAlign = "right";
  for (let i = 0; i <= 4; i += 1) {
    const value = yMax - (yMax / 4) * i;
    context.fillText(formatNumber(value), margin.left - 10, margin.top + (plotH / 4) * i + 4);
  }
  context.fillStyle = "#3f4d49";
  context.font = "12px system-ui";
  context.textAlign = "center";
  context.fillText("Sample date", margin.left + plotW / 2, height - margin.bottom + 42);
  context.save();
  context.translate(24, margin.top + plotH / 2);
  context.rotate(-Math.PI / 2);
  context.fillText(`Concentration (${trendUnit})`, 0, 0);
  context.restore();

  if (trend.criterion !== null) {
    const y = yScale(trend.criterion);
    context.strokeStyle = "#b83232";
    context.setLineDash([6, 5]);
    context.beginPath();
    context.moveTo(margin.left, y);
    context.lineTo(width - margin.right, y);
    context.stroke();
    context.setLineDash([]);
    context.fillStyle = "#b83232";
    context.textAlign = "left";
    context.fillText("Criterion", margin.left + 8, y - 7);
  }

  context.strokeStyle = "#147d6f";
  context.lineWidth = 2;
  context.beginPath();
  points.forEach((point, index) => {
    const x = xScale(point.x);
    const y = yScale(point.y);
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.stroke();

  context.fillStyle = "#147d6f";
  points.forEach((point) => {
    context.beginPath();
    context.arc(xScale(point.x), yScale(point.y), 4, 0, Math.PI * 2);
    context.fill();
  });

  context.fillStyle = "#18211f";
  context.font = "13px system-ui";
  context.textAlign = "center";
  context.fillText(`${trend.location} | ${trend.analyte} (${trendUnit})`, margin.left + plotW / 2, 20);
  context.fillStyle = "#64706c";
  context.textAlign = "center";
  context.fillText(`${trend.status} | ${formatNumber(trend.percentPerYear)}% per year | R2 ${formatNumber(trend.r2)}`, margin.left + plotW / 2, height - 16);
}

function drawDepthProfileChart() {
  const canvas = $("#depthCanvas");
  const context = canvas.getContext("2d");
  const profile = filteredDepthProfiles().find((item) => item.key === (state.selectedDepthProfile || $("#depthProfileSelect").value));
  const ratio = window.devicePixelRatio || 1;
  const bounds = canvas.getBoundingClientRect();
  canvas.width = Math.max(600, Math.floor(bounds.width * ratio));
  canvas.height = Math.floor(360 * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  const width = canvas.width / ratio;
  const height = canvas.height / ratio;
  context.clearRect(0, 0, width, height);

  context.fillStyle = "#fcfefd";
  context.fillRect(0, 0, width, height);

  if (!profile) {
    context.fillStyle = "#64706c";
    context.font = "14px system-ui";
    context.textAlign = "center";
    context.fillText("At least two mapped depth intervals are needed for a depth profile.", width / 2, height / 2);
    return;
  }

  const margin = { top: 34, right: 34, bottom: 86, left: 86 };
  const profileUnit = displayUnit(profile.units);
  const points = profile.points.map((point) => ({
    depth: point.depth.midpoint,
    label: point.depth.label,
    value: point.normalizedValue,
    nondetect: point.nondetect,
  }));
  const valueMax = Math.max(...points.map((point) => point.value).concat(profile.criterion || []));
  const xMin = 0;
  const xMax = valueMax * 1.18 || 1;
  const depthMin = Math.min(...points.map((point) => point.depth));
  const depthMax = Math.max(...points.map((point) => point.depth));
  const depthPad = Math.max(0.5, (depthMax - depthMin) * 0.12);
  const yMin = Math.max(0, depthMin - depthPad);
  const yMax = depthMax + depthPad;
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const xScale = (value) => margin.left + ((value - xMin) / Math.max(1, xMax - xMin)) * plotW;
  const yScale = (value) => margin.top + ((value - yMin) / Math.max(1, yMax - yMin)) * plotH;

  context.strokeStyle = "#d9e1dd";
  context.lineWidth = 1;
  context.beginPath();
  for (let i = 0; i <= 4; i += 1) {
    const x = margin.left + (plotW / 4) * i;
    context.moveTo(x, margin.top);
    context.lineTo(x, height - margin.bottom);
    const y = margin.top + (plotH / 4) * i;
    context.moveTo(margin.left, y);
    context.lineTo(width - margin.right, y);
  }
  context.stroke();

  context.fillStyle = "#64706c";
  context.font = "12px system-ui";
  context.textAlign = "right";
  points.forEach((point) => {
    context.fillText(point.label, margin.left - 10, yScale(point.depth) + 4);
  });

  context.textAlign = "center";
  for (let i = 0; i <= 4; i += 1) {
    const value = (xMax / 4) * i;
    context.fillText(formatNumber(value), margin.left + (plotW / 4) * i, height - margin.bottom + 22);
  }
  context.fillStyle = "#3f4d49";
  context.font = "12px system-ui";
  context.textAlign = "center";
  context.fillText(`Concentration (${profileUnit})`, margin.left + plotW / 2, height - margin.bottom + 42);
  context.save();
  context.translate(24, margin.top + plotH / 2);
  context.rotate(-Math.PI / 2);
  context.fillText("Depth (ft bgs)", 0, 0);
  context.restore();

  if (profile.criterion !== null) {
    const x = xScale(profile.criterion);
    context.strokeStyle = "#b83232";
    context.setLineDash([6, 5]);
    context.beginPath();
    context.moveTo(x, margin.top);
    context.lineTo(x, height - margin.bottom);
    context.stroke();
    context.setLineDash([]);
    context.fillStyle = "#b83232";
    context.textAlign = "left";
    context.fillText("Criterion", Math.min(x + 8, width - margin.right - 58), margin.top + 14);
  }

  context.strokeStyle = "#2c6fb4";
  context.lineWidth = 2;
  context.beginPath();
  points.forEach((point, index) => {
    const x = xScale(point.value);
    const y = yScale(point.depth);
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.stroke();

  points.forEach((point) => {
    const x = xScale(point.value);
    const y = yScale(point.depth);
    context.beginPath();
    context.arc(x, y, 4.5, 0, Math.PI * 2);
    context.fillStyle = point.nondetect ? "#fcfefd" : "#2c6fb4";
    context.fill();
    context.strokeStyle = "#2c6fb4";
    context.lineWidth = 2;
    context.stroke();
    if (point.nondetect) {
      context.fillStyle = "#64706c";
      context.font = "11px system-ui";
      context.textAlign = "left";
      context.fillText("ND", x + 8, y + 4);
    }
  });

  context.fillStyle = "#18211f";
  context.font = "13px system-ui";
  context.textAlign = "center";
  context.fillText(`${profile.location} | ${profile.analyte} (${profileUnit})`, margin.left + plotW / 2, 20);
  context.fillStyle = "#64706c";
  context.textAlign = "center";
  context.fillText(`${profile.date} | ${profile.pointCount} depths | depth increases downward`, margin.left + plotW / 2, height - 16);
}

function drawMapChart() {
  const canvas = $("#mapCanvas");
  const context = canvas.getContext("2d");
  const locations = mappedLocations();
  const status = $("#mapStatus");
  const renderToken = ++mapRenderToken;
  $("#mapBasemapToggle").checked = state.mapBasemap;
  const ratio = window.devicePixelRatio || 1;
  const bounds = canvas.getBoundingClientRect();
  canvas.width = Math.max(600, Math.floor(bounds.width * ratio));
  canvas.height = Math.floor(420 * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  const width = canvas.width / ratio;
  const height = canvas.height / ratio;
  context.clearRect(0, 0, width, height);

  const hasReviewItems = locations.some((location) => location.exceedanceCount || location.qaFlagCount);
  status.textContent = locations.length ? `${locations.length.toLocaleString()} mapped location${locations.length === 1 ? "" : "s"}` : "No coordinates";
  status.classList.toggle("clean", Boolean(locations.length && !hasReviewItems));
  status.classList.toggle("review", Boolean(hasReviewItems));

  context.fillStyle = "#fcfefd";
  context.fillRect(0, 0, width, height);

  if (!locations.length) {
    context.fillStyle = "#64706c";
    context.font = "14px system-ui";
    context.textAlign = "center";
    context.fillText("Map View needs latitude and longitude fields.", width / 2, height / 2);
    return;
  }

  const margin = { top: 52, right: 78, bottom: 92, left: 92 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const projected = projectMapLocations(locations);
  const originLat = locations.reduce((sum, item) => sum + item.latitude, 0) / locations.length;
  const originLon = locations.reduce((sum, item) => sum + item.longitude, 0) / locations.length;
  const lonScale = 111320 * Math.cos((originLat * Math.PI) / 180);
  const latScale = 110540;
  const xValues = projected.map((location) => location.xMeters);
  const yValues = projected.map((location) => location.yMeters);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const xCenter = (xMin + xMax) / 2;
  const yCenter = (yMin + yMax) / 2;
  const minimumMapRangeMeters = 260;
  const xRange = Math.max(minimumMapRangeMeters, xMax - xMin);
  const yRange = Math.max(minimumMapRangeMeters, yMax - yMin);
  const scale = Math.min(plotW / xRange, plotH / yRange) * 0.82;
  const xScale = (value) => margin.left + plotW / 2 + (value - xCenter) * scale;
  const yScale = (value) => margin.top + plotH / 2 - (value - yCenter) * scale;
  const lonForX = (screenX) => originLon + (xCenter + (screenX - (margin.left + plotW / 2)) / scale) / lonScale;
  const latForY = (screenY) => originLat + (yCenter - (screenY - (margin.top + plotH / 2)) / scale) / latScale;

  const drawOverlay = (showGrid = true) => {
    if (renderToken !== mapRenderToken) return;

    if (showGrid) {
      context.strokeStyle = "#d9e1dd";
      context.lineWidth = 1;
      context.beginPath();
      for (let i = 0; i <= 4; i += 1) {
        const x = margin.left + (plotW / 4) * i;
        context.moveTo(x, margin.top);
        context.lineTo(x, height - margin.bottom);
        const y = margin.top + (plotH / 4) * i;
        context.moveTo(margin.left, y);
        context.lineTo(width - margin.right, y);
      }
      context.stroke();
    }

    context.fillStyle = "#64706c";
    context.font = "11px system-ui";
    context.textAlign = "center";
    for (let i = 0; i <= 4; i += 1) {
      const x = margin.left + (plotW / 4) * i;
      context.fillText(formatCoordinate(lonForX(x)), x, height - margin.bottom + 22);
    }
    context.textAlign = "right";
    for (let i = 0; i <= 4; i += 1) {
      const y = margin.top + (plotH / 4) * i;
      context.fillText(formatCoordinate(latForY(y)), margin.left - 10, y + 4);
    }
    context.fillStyle = "#3f4d49";
    context.font = "12px system-ui";
    context.textAlign = "center";
    context.fillText("Longitude", margin.left + plotW / 2, height - margin.bottom + 46);
    context.save();
    context.translate(22, margin.top + plotH / 2);
    context.rotate(-Math.PI / 2);
    context.fillText("Latitude", 0, 0);
    context.restore();

    const scaleMeters = niceMapScale((plotW / Math.max(scale, 1)) * 0.22);
    const scalePixels = scaleMeters * scale;
    const scaleX = margin.left + 14;
    const scaleY = height - 26;
    context.strokeStyle = "#3f4d49";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(scaleX, scaleY);
    context.lineTo(scaleX + scalePixels, scaleY);
    context.stroke();
    context.fillStyle = "#475551";
    context.font = "12px system-ui";
    context.textAlign = "left";
    context.fillText(`${formatNumber(scaleMeters)} m`, scaleX, scaleY + 15);

    const northX = width - 34;
    const northY = margin.top + 36;
    context.strokeStyle = "#3f4d49";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(northX, northY + 28);
    context.lineTo(northX, northY);
    context.lineTo(northX - 6, northY + 10);
    context.moveTo(northX, northY);
    context.lineTo(northX + 6, northY + 10);
    context.stroke();
    context.fillStyle = "#3f4d49";
    context.font = "12px system-ui";
    context.textAlign = "center";
    context.fillText("N", northX, northY - 7);

    const colorForTone = {
      red: "#b83232",
      amber: "#a8660f",
      green: "#237a42",
    };
    const order = { green: 1, amber: 2, red: 3 };
    projected
      .sort((a, b) => order[a.tone] - order[b.tone])
      .forEach((location) => {
        const x = xScale(location.xMeters);
        const y = yScale(location.yMeters);
        const radius = Math.min(10, 5 + Math.log10(location.recordCount + 1) * 2.5 + (location.exceedanceCount ? 1.5 : 0));
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fillStyle = colorForTone[location.tone];
        context.fill();
        context.strokeStyle = "#ffffff";
        context.lineWidth = 2;
        context.stroke();
      });

    if (projected.length <= 40) {
      context.fillStyle = "#18211f";
      context.font = "11px system-ui";
      context.textAlign = "left";
      projected.forEach((location) => {
        context.fillText(location.location, xScale(location.xMeters) + 8, yScale(location.yMeters) - 8);
      });
    }

    context.fillStyle = "#18211f";
    context.font = "13px system-ui";
    context.textAlign = "center";
    context.fillText("Sample locations from active filters", margin.left + plotW / 2, 20);
  };

  if (state.mapBasemap) {
    drawMapTileBasemap({
      context,
      renderToken,
      margin,
      plotW,
      plotH,
      width,
      height,
      originLat,
      originLon,
      lonScale,
      latScale,
      scale,
      xScale,
      yScale,
      lonForX,
      latForY,
      drawOverlay,
    });
  } else {
    drawOverlay(true);
  }
}

function drawMapTileBasemap(options) {
  const {
    context,
    renderToken,
    margin,
    plotW,
    plotH,
    width,
    height,
    originLat,
    originLon,
    lonScale,
    latScale,
    scale,
    xScale,
    yScale,
    lonForX,
    latForY,
    drawOverlay,
  } = options;
  const zoom = osmZoomForScale(scale, originLat);
  const leftLon = lonForX(margin.left);
  const rightLon = lonForX(width - margin.right);
  const topLat = latForY(margin.top);
  const bottomLat = latForY(height - margin.bottom);
  const minLon = Math.min(leftLon, rightLon);
  const maxLon = Math.max(leftLon, rightLon);
  const minLat = Math.min(topLat, bottomLat);
  const maxLat = Math.max(topLat, bottomLat);
  const topLeft = osmTileCoordinate(minLon, maxLat, zoom);
  const bottomRight = osmTileCoordinate(maxLon, minLat, zoom);
  const tileCount = 2 ** zoom;
  const minTileX = Math.floor(topLeft.x);
  const maxTileX = Math.ceil(bottomRight.x);
  const minTileY = Math.max(0, Math.floor(topLeft.y));
  const maxTileY = Math.min(tileCount - 1, Math.ceil(bottomRight.y));
  let pending = 0;
  let loaded = 0;
  let settled = false;

  context.save();
  context.beginPath();
  context.rect(margin.left, margin.top, plotW, plotH);
  context.clip();
  context.fillStyle = "#eef2ef";
  context.fillRect(margin.left, margin.top, plotW, plotH);
  context.fillStyle = "#64706c";
  context.font = "13px system-ui";
  context.textAlign = "center";
  context.fillText("Basemap loading...", margin.left + plotW / 2, margin.top + plotH / 2);
  context.restore();

  const finish = () => {
    if (settled || renderToken !== mapRenderToken) return;
    settled = true;
    if (!loaded) {
      context.save();
      context.beginPath();
      context.rect(margin.left, margin.top, plotW, plotH);
      context.clip();
      context.fillStyle = "#fcfefd";
      context.fillRect(margin.left, margin.top, plotW, plotH);
      context.fillStyle = "#64706c";
      context.font = "13px system-ui";
      context.textAlign = "center";
      context.fillText("Basemap unavailable; coordinate plot shown.", margin.left + plotW / 2, margin.top + plotH / 2);
      context.restore();
      drawOverlay(true);
    } else {
      drawOverlay(false);
    }
  };

  const completeOne = () => {
    pending -= 1;
    if (pending <= 0) finish();
  };

  for (let tileX = minTileX; tileX <= maxTileX; tileX += 1) {
    for (let tileY = minTileY; tileY <= maxTileY; tileY += 1) {
      pending += 1;
      const wrappedX = ((tileX % tileCount) + tileCount) % tileCount;
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.referrerPolicy = "no-referrer";
      image.onload = () => {
        if (renderToken !== mapRenderToken) return;
        const northwest = osmTileCorner(tileX, tileY, zoom);
        const southeast = osmTileCorner(tileX + 1, tileY + 1, zoom);
        const x1 = xScale((northwest.lon - originLon) * lonScale);
        const y1 = yScale((northwest.lat - originLat) * latScale);
        const x2 = xScale((southeast.lon - originLon) * lonScale);
        const y2 = yScale((southeast.lat - originLat) * latScale);
        context.save();
        context.beginPath();
        context.rect(margin.left, margin.top, plotW, plotH);
        context.clip();
        context.drawImage(image, x1, y1, x2 - x1, y2 - y1);
        context.restore();
        loaded += 1;
        if (settled) drawOverlay(false);
        else completeOne();
      };
      image.onerror = completeOne;
      image.src = `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${tileY}.png`;
    }
  }

  if (!pending) finish();
  window.setTimeout(finish, 1400);
}

function osmZoomForScale(scale, latitude) {
  const metersPerPixel = 1 / Math.max(scale, 0.0001);
  const baseResolution = 156543.03392 * Math.cos((latitude * Math.PI) / 180);
  return Math.max(3, Math.min(19, Math.round(Math.log2(baseResolution / metersPerPixel))));
}

function osmTileCoordinate(longitude, latitude, zoom) {
  const lat = Math.max(-85.0511, Math.min(85.0511, latitude));
  const latRad = (lat * Math.PI) / 180;
  const count = 2 ** zoom;
  return {
    x: ((longitude + 180) / 360) * count,
    y: ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * count,
  };
}

function osmTileCorner(tileX, tileY, zoom) {
  const count = 2 ** zoom;
  const longitude = (tileX / count) * 360 - 180;
  const value = Math.PI - (2 * Math.PI * tileY) / count;
  const latitude = (180 / Math.PI) * Math.atan(Math.sinh(value));
  return { lat: latitude, lon: longitude };
}

function niceMapScale(value) {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const exponent = Math.floor(Math.log10(value));
  const base = 10 ** exponent;
  const fraction = value / base;
  if (fraction >= 5) return 5 * base;
  if (fraction >= 2) return 2 * base;
  return base;
}

function renderCriteria() {
  const container = $("#criteriaList");
  container.innerHTML = "";
  state.criteria.forEach((item) => {
    const row = document.createElement("div");
    row.className = "criterion-item";
    row.innerHTML = `
      <div class="criterion-main">
        <strong>${escapeHtml(item.analyte)}</strong>
        <span>${escapeHtml(item.matrix)} | ${formatNumber(item.value)} ${escapeHtml(displayUnit(item.units))} | ${escapeHtml(item.source || "custom")}</span>
      </div>
      <button class="icon-button compact" type="button" title="Remove criterion" aria-label="Remove criterion" data-criterion-id="${item.id}">
        <i data-lucide="trash-2"></i>
      </button>
    `;
    container.append(row);
  });
  container.querySelectorAll("button[data-criterion-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.criteria = state.criteria.filter((item) => item.id !== button.dataset.criterionId);
      analyze();
      renderCriteria();
      renderAll();
    });
  });
  refreshIcons();
}

function addCriterionFromForm() {
  const analyte = $("#criterionAnalyte").value.trim();
  const matrix = $("#criterionMatrix").value;
  const value = Number($("#criterionValue").value);
  const units = $("#criterionUnits").value.trim() || defaultUnitForMatrix(matrix);
  const source = $("#criterionSource").value.trim() || "Custom";
  if (!analyte || !Number.isFinite(value)) {
    toast("Add an analyte and numeric criterion.");
    return;
  }
  state.criteria.unshift(criterion(analyte, matrix, value, units, source));
  $("#criterionForm").reset();
  $("#criterionUnits").value = "";
  analyze();
  renderCriteria();
  renderAll();
  toast("Criterion added.");
}

async function importCriteria(file) {
  try {
    const text = await file.text();
    const rows = parseDelimited(text).rows;
    const imported = rows
      .map((row) => {
        const normalized = Object.fromEntries(Object.entries(row).map(([key, value]) => [normalizeHeader(key), value]));
        const analyte = normalized.analyte || normalized.chemical || normalized.parameter;
        const matrix = classifyMatrix(normalized.matrix || normalized.media || "water", normalized.units || normalized.unit);
        const value = parseNumber(normalized.value || normalized.criterion || normalized.screening || normalized.limit);
        const units = normalized.units || normalized.unit || defaultUnitForMatrix(matrix);
        const source = normalized.source || normalized.standard || "Imported";
        return analyte && value !== null ? criterion(analyte, matrix, value, units, source) : null;
      })
      .filter(Boolean);
    state.criteria = [...imported, ...state.criteria];
    analyze();
    renderCriteria();
    renderAll();
    toast(`${imported.length} criteria imported.`);
  } catch (error) {
    toast(error.message || "Criteria file could not be read.");
  }
}

function downloadActiveView() {
  const view = state.activeView;
  if (view === "exceedances") downloadCsv(exportFilename("exceedances.csv"), exportExceedances(filteredExceedances()));
  else if (view === "qa") downloadCsv(exportFilename("qa-flags.csv"), filteredFlags());
  else if (view === "trends") downloadCsv(exportFilename("trends.csv"), exportTrends(filteredTrends()));
  else if (view === "profiles") downloadCsv(exportFilename("depth-profiles.csv"), exportDepthProfiles(filteredDepthProfiles()));
  else if (view === "map") downloadCsv(exportFilename("map-locations.csv"), exportMapLocations(mappedLocations()));
  else downloadCsv(exportFilename("clean-environmental-data.csv"), exportCleanRecords(filteredRecords()));
}

function exportFilename(filename) {
  const source = state.project.projectName || state.project.siteName;
  if (!source) return filename;
  const prefix = slugify(source);
  const normalizedFilename = prefix.endsWith("review") && filename.startsWith("review-")
    ? filename.replace(/^review-/, "")
    : filename;
  return `${prefix}-${normalizedFilename}`;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "e-rev";
}

function exportExceedances(records = state.exceedances) {
  return records.map((record) => ({
    sample_id: record.sampleId,
    location: record.location,
    date: record.date,
    matrix: record.matrix,
    analyte: record.analyte,
    result: record.normalizedValue,
    units: record.normalizedUnit,
    criterion: record.criterion,
    criterion_source: record.criterionSource,
    multiple: record.multiple,
    qualifier: record.qualifier,
  }));
}

function exportTrends(trends = state.trends) {
  return trends.map((trend) => ({
    location: trend.location,
    matrix: trend.matrix,
    analyte: trend.analyte,
    status: trend.status,
    percent_per_year: trend.percentPerYear,
    r2: trend.r2,
    latest_value: trend.latestValue,
    predicted_next: trend.predictedNext,
    units: trend.units,
  }));
}

function exportDepthProfiles(profiles = state.depthProfiles) {
  return profiles.flatMap((profile) =>
    profile.points.map((point) => ({
      location: profile.location,
      date: profile.date,
      matrix: profile.matrix,
      analyte: profile.analyte,
      depth_interval_ft: point.depth.label,
      depth_midpoint_ft: point.depth.midpoint,
      result: point.normalizedValue,
      units: profile.units,
      nondetect: point.nondetect,
      qualifier: point.qualifier,
      criterion: profile.criterion,
      criterion_source: profile.source,
      comparison: point.comparison,
    })),
  );
}

function exportMapLocations(locations = mappedLocations()) {
  return locations.map((location) => ({
    location: location.location,
    status: location.status,
    latitude: location.latitude,
    longitude: location.longitude,
    records: location.recordCount,
    detections: location.detectionCount,
    exceedances: location.exceedanceCount,
    qa_flags: location.qaFlagCount,
    analytes: location.analyteCount,
    matrices: location.matrixCount,
    max_multiple: location.maxMultiple,
    latest_date: location.latestDate,
  }));
}

function exportCleanRecords(records = state.records) {
  return records.map((record) => ({
    source_row: record.row,
    sample_id: record.sampleId,
    location: record.location,
    date: record.date,
    matrix: record.matrix,
    analyte: record.analyte,
    raw_result: record.rawResult,
    raw_units: record.units,
    normalized_result: record.normalizedValue,
    normalized_units: record.normalizedUnit,
    nondetect: record.nondetect,
    qualifier: record.qualifier,
    criterion: record.criterion,
    criterion_source: record.criterionSource,
    comparison: record.comparison,
    exceedance: record.exceedance,
    multiple: record.multiple,
    depth: record.depth,
    latitude: record.latitude,
    longitude: record.longitude,
  }));
}

function downloadCsv(filename, rows) {
  if (!rows.length) {
    toast("Nothing to export yet.");
    return;
  }
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");
  downloadFile(filename, csv, "text/csv");
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadSummary() {
  downloadFile(exportFilename("report-note.txt"), buildReportText(), "text/plain");
}

async function copySummary() {
  try {
    await navigator.clipboard.writeText(buildReportText());
    toast("Report note copied.");
  } catch {
    toast("Clipboard access was not available.");
  }
}

function downloadMemo() {
  downloadFile(exportFilename("review-memo.txt"), buildReviewMemo(), "text/plain");
}

async function copyMemo() {
  try {
    await navigator.clipboard.writeText(buildReviewMemo());
    toast("Review memo copied.");
  } catch {
    toast("Clipboard access was not available.");
  }
}

function downloadAiPrompt() {
  downloadFile(exportFilename("ai-review-prompt.txt"), buildAiReviewPrompt(), "text/plain");
}

async function copyAiPrompt() {
  try {
    await navigator.clipboard.writeText(buildAiReviewPrompt());
    toast("AI review prompt copied.");
  } catch {
    toast("Clipboard access was not available.");
  }
}

function downloadAiBrief() {
  downloadFile(exportFilename("ai-assistant-brief.txt"), buildAiBrief(), "text/plain");
}

async function copyAiBrief() {
  try {
    await navigator.clipboard.writeText(buildAiBrief());
    toast("AI assistant brief copied.");
  } catch {
    toast("Clipboard access was not available.");
  }
}

function downloadDemoBrief() {
  downloadFile(exportFilename("portfolio-brief.html"), buildDemoBriefHtml(), "text/html");
}

function downloadReviewPackage() {
  if (!state.records.length) {
    toast("Load data before creating a review package.");
    return;
  }
  downloadFile(exportFilename("review-package.html"), buildReviewPackageHtml(), "text/html");
}

function downloadFile(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function openCurrentMapInGoogle() {
  const locations = mappedLocations();
  if (!locations.length) {
    toast("No mapped locations in the current view.");
    return;
  }
  const latitude = locations.reduce((sum, location) => sum + location.latitude, 0) / locations.length;
  const longitude = locations.reduce((sum, location) => sum + location.longitude, 0) / locations.length;
  window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, "_blank", "noopener");
}

function resetWorkspace() {
  state.rawRows = [];
  state.headers = [];
  state.mapping = {};
  state.records = [];
  state.flags = [];
  state.exceedances = [];
  state.trends = [];
  state.depthProfiles = [];
  state.sourceName = "";
  state.selectedTrend = "";
  state.selectedDepthProfile = "";
  state.mapBasemap = false;
  state.filters = {
    matrix: "",
    location: "",
    analyte: "",
    dateFrom: "",
    dateTo: "",
    search: "",
    exceedanceOnly: false,
  };
  renderMapping();
  renderAll();
  toast("Workspace reset.");
}

function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  const absolute = Math.abs(value);
  if (absolute >= 1000) return Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (absolute >= 10) return Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 });
  if (absolute >= 1) return Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
  return Number(value).toLocaleString(undefined, { maximumSignificantDigits: 2 });
}

function displayUnit(unit) {
  const normalized = normalizeUnit(unit);
  const labels = {
    "ug/l": "\u00b5g/L",
    "ug/m3": "\u00b5g/m\u00b3",
    "mg/m3": "mg/m\u00b3",
    "ng/m3": "ng/m\u00b3",
  };
  return labels[normalized] || String(unit || "");
}

function formatCoordinate(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  return Number(value).toFixed(5);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => element.classList.remove("show"), 3600);
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}
