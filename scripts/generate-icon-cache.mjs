/**
 * Icon Cache Generator
 *
 * Build-time script that converts AWS Architecture SVG icons to base64
 * for embedding in server-rendered SVGs without filesystem access.
 *
 * Usage: node scripts/generate-icon-cache.mjs
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

const ICONS_DIR = join(
  projectRoot,
  "node_modules/aws-icons/icons/architecture-service"
);
const OUTPUT_PATH = join(projectRoot, "src/lib/icon-cache.json");

function generateIconCache() {
  console.log("Generating icon cache...");

  // Check if icons directory exists
  if (!existsSync(ICONS_DIR)) {
    console.error(`Icons directory not found: ${ICONS_DIR}`);
    console.error("Run 'npm install' first to install aws-icons package.");
    process.exit(1);
  }

  // Ensure output directory exists
  const outputDir = dirname(OUTPUT_PATH);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Read all SVG files
  const files = readdirSync(ICONS_DIR).filter((f) => f.endsWith(".svg"));
  console.log(`Found ${files.length} SVG icons`);

  const cache = {};
  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const iconName = file.replace(".svg", "");
    const filePath = join(ICONS_DIR, file);

    try {
      const svgContent = readFileSync(filePath, "utf-8");
      // Store as base64
      cache[iconName] = Buffer.from(svgContent).toString("base64");
      successCount++;
    } catch (err) {
      console.warn(`Failed to read ${file}: ${err.message}`);
      errorCount++;
    }
  }

  // Write cache file
  writeFileSync(OUTPUT_PATH, JSON.stringify(cache, null, 2));

  console.log(`Icon cache generated successfully!`);
  console.log(`  - Output: ${OUTPUT_PATH}`);
  console.log(`  - Icons cached: ${successCount}`);
  if (errorCount > 0) {
    console.log(`  - Errors: ${errorCount}`);
  }

  // Calculate approximate file size
  const stats = JSON.stringify(cache).length;
  console.log(`  - Cache size: ${(stats / 1024).toFixed(1)} KB`);
}

generateIconCache();
