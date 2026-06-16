# E-Rev Workbench Deployment Notes

E-Rev is a static browser app. The core review workflow uses `index.html`, `styles.css`, `app.js`, `vendor/`, and `sample-data/`.

## Recommendation

Use GitHub Pages first for a portfolio project. It gives you:

- A live app link
- A visible code repository
- A README and case study in the same place
- A simple story: "I designed and built this workflow prototype"

Use Netlify when you want the quickest live preview link or drag-and-drop publishing.

## GitHub Pages

1. Create a GitHub repository, such as `e-rev-workbench`.
2. Upload the contents of this folder to the repository root.
3. In GitHub, open **Settings** > **Pages**.
4. Choose **Deploy from a branch**.
5. Select the main branch and the root folder.
6. Save, then wait for GitHub to publish the site.

The app URL will usually look like:

`https://YOUR-USERNAME.github.io/e-rev-workbench/`

## Netlify

For the fastest first publish:

1. Open Netlify Drop.
2. Drag this project folder into the deploy area.
3. Netlify will publish the static files and give you a live URL.

For a longer-term setup, connect the GitHub repository to Netlify. The included `netlify.toml` tells Netlify to publish the project root and use no build step.

## What Works Offline

These parts work as local/static browser features:

- CSV, TSV, and TXT uploads
- Built-in realistic sample data
- Field mapping
- QA checks
- Criteria screening with local criteria values
- Tables, charts, review memo, AI prompt, AI assistant brief, and HTML review package exports

These parts may need internet access:

- Excel `.xlsx` parsing through the optional SheetJS loader
- Online basemap tiles
- Google Maps handoff button

## Portfolio Notes

Before sharing publicly, keep the positioning clear:

- The sample data is fictitious.
- Starter criteria are placeholders.
- Trend labels are first-pass screening aids.
- The current AI features are local drafting support, not live AI model calls.
