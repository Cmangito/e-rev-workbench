# E-Rev Workbench

A local Environmental Consulting Review workbench for early-stage site data review. It reads lab or field result tables, maps common environmental columns, normalizes units, compares against editable starter criteria, labels exceedances, checks QA items, builds simple concentration trends, separates same-day boring data into depth profiles, and plots sample locations from coordinates.

The app is also set up as a portfolio-ready prototype. It includes a short walkthrough, consulting value summary, project story, future build path, AI drafting support explanation, and a downloadable one-page portfolio brief.

## Open

Open `index.html` in a browser.

For a live portfolio link, publish the folder as a static site. See `DEPLOYMENT.md` for GitHub Pages and Netlify notes.

## Data

Supported local formats:

- CSV
- TSV
- TXT delimited tables

CSV, TSV, and TXT are the primary share formats and run fully in the local browser. Excel `.xlsx` files are supported when the browser can load the optional SheetJS parser from the internet. If that parser cannot load, save the workbook tab as CSV and upload the CSV.

E-Rev scores likely header rows during import, so common lab-export title or project-information rows above the table can be skipped automatically.

## Workflow

The main review path is:

1. Upload data
2. Add project context
3. Confirm detected fields
4. Review QA flags and dashboard summaries
5. Review exceedances, trends, depth profiles, and mapped locations
6. Export the active view, review memo, AI review prompt, AI assistant brief, portfolio brief, or HTML review package

Filters apply to the dashboard, result tables, trend calculations, depth profiles, mapped locations, report notes, review memo, and CSV exports. Use the clear button to return to the full dataset. When `Exceedances only` is active, tables narrow to exceedance records; trend and depth views preserve the full matching series for any group with an exceedance.

Use the Help button in the top-right corner for the in-app Data Guide, and the calculator button for the Math Guide. The upload band also includes shortcut buttons for a blank results template, a criteria template, the small sample, and the larger realistic sample.

The Math Guide documents the formulas and rules behind record parsing, unit normalization, criteria screening, QA flags, trends, depth profiles, map projection, and filtered views.

The Portfolio Brief panel explains what the project is, why it matters in consulting, how AI should be positioned, what skills it demonstrates, and what the production roadmap could include.

Project Setup is stored in the browser for the local page and is used in report notes and export filenames. The Review Dashboard summarizes top exceedances, primary QA issues, trend mix, detection focus, QA breakdown, trend status, detection frequency, and ranked exceedances by analyte and location.

The Review Memo export uses the current project setup and active filters. It includes project header, dataset summary, QA summary, screening summary, top exceedances, trend summary, depth profile summary, notes, and the screening criteria caveat.

The AI Review Prompt export packages the same deterministic findings into a drafting prompt for an AI assistant. It is intended for narrative drafting support; calculations and screening logic remain in E-Rev.

The AI Review Assistant panel creates a local consultant-style draft brief from the current E-Rev findings and checks pasted AI-written language for missing counts, missing criteria caveats, missing QA references, and common overconfident regulatory wording. It does not send data to an outside AI service.

The Review Package export creates a self-contained HTML file with project context, current filtered summaries, key tables, chart snapshots, memo text, AI prompt, AI assistant brief, and caveats. Open the HTML file in a browser or print it to PDF.

The Portfolio Brief export creates a one-page HTML handout for portfolio review, live demos, or project discussions. If data is loaded, it includes a current snapshot of the active review counts.

## Portfolio Positioning

E-Rev is best framed as a workflow prototype, not a finished regulatory tool. The strongest explanation is:

> I built E-Rev to explore how deterministic environmental spreadsheet review could be paired with AI-supported drafting in a way that stays auditable.

What it demonstrates:

- Environmental consulting workflow judgment
- Spreadsheet intake and field-mapping logic
- Screening-level QA and criteria review
- Trend, depth-profile, and map visualization
- Responsible AI positioning: verified calculations first, drafting support second

## Deployment

E-Rev is a static HTML, CSS, and JavaScript app. It does not need a build step for the core CSV/sample workflow.

Recommended path:

1. Use GitHub Pages first if this is mainly a portfolio project, because the live app and the code can live together.
2. Use Netlify if you want the fastest drag-and-drop live link or easy preview deploys.

Core CSV, TSV, TXT, and sample-data workflows run in the browser. Excel parsing, online basemap tiles, and Google Maps handoff require internet access.

## Walkthrough Script

1. Open `index.html` and load the realistic sample.
2. Point out detected field mapping and editable screening criteria.
3. Use the dashboard counts to frame the first-pass review.
4. Filter to `SB-3` and `Lead` to explain depth profiles versus time trends.
5. Show Map View and export the review package.
6. Explain that the current AI features are local drafting support; a production version would use a secure backend for live model calls.

Trend labels require at least three unique sample dates. Nondetects are excluded from the trend fit. When the same location, matrix, and analyte has multiple results on one date, E-Rev keeps the highest result for that date so duplicate rows or soil boring depth intervals do not create vertical time-trend lines. Same-day soil boring depth intervals are not treated as time trends.

Depth profiles require a mapped depth field and at least two unique depth intervals for the same location, date, matrix, and analyte. Direct interval columns such as `0-2 ft` are supported, and separate `From` / `To` columns are combined into intervals. They plot concentration against depth for same-day vertical sampling review.

Map View requires mapped latitude and longitude fields. Coordinates are projected to a simple local east/north plot with equal scale so the north arrow and axis labels preserve local site geometry. The map includes latitude/longitude axis labels, an optional online basemap tile mode with a practical minimum window for single-location filters, and a button to open the current filtered map center in Google Maps.

## Criteria

The built-in screening criteria are starter placeholders for workflow testing. Add or import project-specific federal, state, client, or risk-based values before using results in a report.

Criteria CSV imports should include recognizable columns such as:

- `analyte`
- `matrix`
- `value` or `criterion`
- `units`
- `source`

## Sample

Use `sample-data/sample-environmental-results.csv` or the flask button in the app to load a small groundwater, soil, and soil-gas example.

For a more realistic upload test, use `sample-data/large-realistic-environmental-results.csv`. It is generated from `sample-data/generate-realistic-sample.js` and includes quarterly groundwater results, soil boring results, soil-gas results, coordinates, qualifiers, reporting limits, and groundwater elevations.

## Regression and Audit Checks

`tests/run-regression-tests.js` exercises the core browser workflow for header-row detection, `From` / `To` depth interval handling, grouped trend behavior under `Exceedances only`, and the Clean Data preview note. It uses Playwright with Chrome.

`tests/run-math-audit.js` independently recomputes the large sample counts, unit conversions, exceedances, QA flags, trend statuses, depth profiles, mapped locations, and selected edge cases. Audit notes are in `share/E-Rev_Workbench_Audit_Notes.md`.
