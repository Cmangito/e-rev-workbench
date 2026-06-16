# E-Rev Workbench Audit Notes

## Scope

This audit reviewed E-Rev as a portfolio prototype for preliminary environmental consulting spreadsheet review. It checked math, assumptions, UI wording, and alignment with common environmental review boundaries.

E-Rev should be described as a first-pass screening and review assistant. It is not a substitute for a QAPP/SAP, formal laboratory data validation, risk assessment, cleanup-level selection, regulatory closure decision, or formal groundwater statistical compliance evaluation.

## Official Reference Points

- EPA Regional Screening Levels: https://www.epa.gov/risk/regional-screening-levels-rsls
- EPA Guidance for Data Quality Assessment: https://www.epa.gov/quality/guidance-data-quality-assessment
- EPA CLP National Functional Guidelines for Data Review: https://www.epa.gov/clp/superfund-clp-national-functional-guidelines-data-review
- EPA Statistical Analysis of Groundwater Monitoring Data at RCRA Facilities, Unified Guidance: https://archive.epa.gov/epawaste/hazard/web/pdf/unified-guid.pdf

## Math Checks Completed

The independent math audit recomputed the large sample outside the browser app and confirmed:

- 992 records
- 893 detections
- 157 exceedances
- 110 QA flags
- 70 trend series
- 9 increasing trends
- 20 decreasing trends
- 41 stable trends
- 36 depth profiles
- 19 mapped locations

Additional checks confirmed:

- Water `mg/L` to `ug/L`
- Soil `ug/kg` to `mg/kg`
- Air `mg/m3` to `ug/m3`
- Micro-symbol unit display and normalization
- Nondetect reporting limits above criteria are flagged without counting as exceedances
- Same-day soil boring intervals are not treated as time trends
- Map projection keeps north positive and east positive
- Synthetic doubling concentrations produce an approximately 100% per year increasing log-linear trend

## App Corrections Made During Audit

- Added QA flags for negative detected results.
- Added QA flags for zero detected results.
- Excluded zero and negative detected values from log-trend fitting.
- Excluded negative detected values from depth-profile charting.
- Strengthened help text explaining that E-Rev performs preliminary spreadsheet-level review, not formal validation or regulatory decision-making.
- Added in-app reference links to EPA screening, DQA, data review, and groundwater statistics guidance.

## Standards Boundary

E-Rev aligns with a preliminary consulting review workflow:

1. Confirm spreadsheet fields.
2. Normalize units where simple direct conversion is appropriate.
3. Compare detected results to active criteria.
4. Flag records needing review.
5. Separate time trends from same-day depth profiles.
6. Map sample locations from coordinates.
7. Export tables and draft-support materials.

E-Rev intentionally does not attempt to perform:

- Full CLP-style data validation
- Blank/calibration/surrogate/holding-time validation
- Formal DQA decision testing
- Mann-Kendall or Sen's slope trend testing
- Prediction limit, tolerance limit, control chart, or confidence interval compliance testing
- Plume modeling or geostatistics
- Human health or ecological risk assessment
- Cleanup standard selection

## Bottom Line

The app is mathematically consistent for its stated screening-level purpose. The assumptions are now clearer and more defensible for portfolio use, as long as E-Rev is presented as an auditable prototype that supports consultant review rather than replacing professional judgment or regulatory procedures.
