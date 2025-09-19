import fs from 'fs';
import path from 'path';

// Note: Using built-in fetch API available in Node.js 18+
// Google Sheets configuration
const SHEET_ID = "1I1SSM6K2FVho8nmbOPa7YpRaaGeeBVnwbDQt79721Og";

// All worksheets to fetch
const SHEET_NAMES = [
  "Overview",
  "weights", 
  "output_Global",
  "output_EMEA",
  "output_UK",
  "output_NPA",
  "output_Israel",
  "output_Germany",
  "output_MENA",
  "output_Nordics",
  "output_France",
  "output_Spain",
  "output_Benelux",
  "output_Italy"
];

// Filename mapping for each worksheet
const FILENAME_MAPPING = {
  "Overview": "Overview.json",
  "weights": "weights.json",
  "output_Global": "output_Global.json",
  "output_EMEA": "output_EMEA.json",
  "output_UK": "output_UK.json",
  "output_NPA": "output_NPA.json",
  "output_Israel": "output_Israel.json",
  "output_Germany": "output_Germany.json",
  "output_MENA": "output_MENA.json",
  "output_Nordics": "output_Nordics.json",
  "output_France": "output_France.json",
  "output_Spain": "output_Spain.json",
  "output_Benelux": "output_Benelux.json",
  "output_Italy": "output_Italy.json"
};

async function fetchGoogleSheetData(sheetName) {
  const timestamp = Date.now();
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&range=A1:BH1048576&headers=1&timestamp=${timestamp}`;
  
  console.log(`Fetching ${sheetName}...`);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${sheetName}: ${response.statusText}`);
  }
  
  const text = await response.text();
  
  // Parse Google Sheets JSONP response
  const jsonStartIndex = text.indexOf('(') + 1;
  const jsonEndIndex = text.lastIndexOf('}') + 1;
  const jsonText = text.substring(jsonStartIndex, jsonEndIndex);
  const data = JSON.parse(jsonText);
  
  if (!data.table || !data.table.rows) {
    throw new Error(`No data found in ${sheetName}`);
  }
  
  // Convert to our format
  const headers = data.table.cols?.map(col => col.label || '') || [];
  const rows = data.table.rows.map(row => 
    row.c?.map(cell => cell?.v || '') || []
  );
  
  return {
    headers,
    rows,
    weightedColumns: sheetName === 'weights' ? 
      rows[0]?.map(cell => cell && typeof cell === 'string' && cell.toLowerCase().includes('weighted')) || [] :
      Array(headers.length).fill(false)
  };
}

async function main() {
  try {
    console.log('🔄 Fetching fresh Google Sheets data...');
    
    // Create cache directory
    const cacheDir = path.join(process.cwd(), 'public', 'cached-data');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    // Fetch all sheets and save each as a separate JSON file
    const allData = {};
    const savedFiles = [];
    
    for (const sheetName of SHEET_NAMES) {
      try {
        const sheetData = await fetchGoogleSheetData(sheetName);
        allData[sheetName] = sheetData;
        console.log(`✅ ${sheetName}: ${sheetData.rows.length} rows`);
        
        // Save individual JSON file for this worksheet
        const filename = FILENAME_MAPPING[sheetName];
        const filePath = path.join(cacheDir, filename);
        fs.writeFileSync(filePath, JSON.stringify(sheetData, null, 2));
        savedFiles.push(filename);
        console.log(`📁 Saved: ${filename}`);
        
      } catch (error) {
        console.error(`❌ Failed to fetch ${sheetName}:`, error.message);
        // Continue with other sheets instead of failing completely
        console.log(`⚠️ Skipping ${sheetName} and continuing...`);
      }
    }
    
    console.log(`\n✅ Cache updated successfully!`);
    console.log(`📊 Total sheets cached: ${Object.keys(allData).length}`);
    console.log(`📄 Individual files saved: ${savedFiles.length}`);
    savedFiles.forEach(file => console.log(`   • ${file}`));
    console.log(`🕒 Timestamp: ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error('❌ Cache update failed:', error);
    process.exit(1);
  }
}

main();
