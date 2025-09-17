# Power Law Ranking Data Cache

This repository contains automatically updated cache data for the power law ranking application.

## How it works

1. **GitHub Action** runs daily at 2 AM UTC
2. **Fetches fresh data** from Google Sheets
3. **Updates cache files** in `public/cached-data/`
4. **Commits changes** back to the repository

## Files

- `output_UK.json`, `output_Global.json`, etc. - Regional cache files used by the application
- `Overview.json` - Overview data
- `weights.json` - Weights configuration
- `fetch-cache-data.js` - Script to fetch and update cache data
- `.github/workflows/refresh-cache.yml` - GitHub Action workflow

## Manual Update

You can manually trigger a cache update:

1. Go to the "Actions" tab in GitHub
2. Click "Auto-refresh Google Sheets cache" 
3. Click "Run workflow"

## Cache Structure

Each cache file contains data from a specific Google Sheets worksheet with the following structure:

```json
{
  "headers": ["investor_name", "country", "launch_year", ...],
  "rows": [["Investor 1", "UK", "2020", ...], ...],
  "weightedColumns": [false, false, true, ...]
}
```

## Access

The cache files are publicly accessible via GitHub raw files:
- `https://raw.githubusercontent.com/dealroom-caching/power-law-ranking-data/main/public/cached-data/output_UK.json`
- `https://raw.githubusercontent.com/dealroom-caching/power-law-ranking-data/main/public/cached-data/output_Global.json`
- `https://raw.githubusercontent.com/dealroom-caching/power-law-ranking-data/main/public/cached-data/Overview.json`
- And all other regional JSON files...
