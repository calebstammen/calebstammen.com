import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync, watch, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const imageDir = path.join(repoRoot, "assets", "interests");
const manifestPath = path.join(imageDir, "manifest.json");
const watchMode = process.argv.includes("--watch");
const supportedExtensions = new Set([".avif", ".jpeg", ".jpg", ".png", ".webp"]);

const altOverrides = new Map([
  ["RCF-sunset.jpg", "Red coupe parked near a country road at sunset"],
  ["beach-sunset-shoreline.jpg", "Beach shoreline at sunset"],
  ["eiffel-tower-night-close.jpg", "Eiffel Tower lit at night"],
  ["hollywood-beach-family-pic.jpg", "Group gathered near a Hollywood Beach sign"],
  ["lake-cliff-sunset.jpg", "Rocky lakeshore cliff at sunset"],
  ["mountain-lake-overlook.jpg", "Mountain lake overlook beneath open sky"],
  ["mountain-ridge-view.jpg", "Mountain ridge view with layered terrain"],
  ["mountain-trail.jpg", "Mountain trail hiker near snow patches"],
  ["mountain-trail-hiker.jpg", "Mountain trail hiker near snow patches"],
  ["notre-dame-exterior.jpg", "Notre-Dame exterior at sunset"],
  ["notre-dame-interior-organ.jpg", "Notre-Dame interior with organ and vaulted ceiling"],
  ["ocean-pool-night-view.jpg", "Oceanfront pool and shoreline at night"],
  ["ornate-hall-interior.jpg", "Ornate historic hall interior"],
  ["paris-sunset-city-view.jpg", "Paris city view over the river at sunset"],
  ["parliament-river-dusk.jpg", "Parliament and Big Ben across the river at dusk"],
  ["rocky-cliff.jpg", "Hiker standing on a rocky cliff overlook"],
  ["rocky-cliff-hiker.jpg", "Hiker standing on a rocky cliff overlook"],
  ["rocky-mountain-overlook.jpg", "Rocky mountain overlook from a high ridge"],
  ["rocky-trail.jpg", "Hiker standing on a rocky trail overlook"],
  ["rocky-trail-hiker.jpg", "Hiker standing on a rocky trail overlook"],
  ["ski-slope-panorama.jpg", "Snowy ski slope with mountain views"],
  ["snow-slope-hike.jpg", "Snowy mountain slope hiking scene"],
  ["snowy-mountain-panorama.jpg", "Snowy mountain panorama beneath dramatic sky"],
  ["snowy-summit.jpg", "Snowy summit hike under a cloudy sky"],
  ["snowy-summit-hiker.jpg", "Snowy summit hike under a cloudy sky"],
  ["waterfall-hike-wide.jpg", "Wide waterfall hiking scene with boulders"],
  ["winter-falls-basin.jpg", "Winter waterfall basin with layered rock"],
]);

function titleCase(value) {
  return value.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function altFromFile(file) {
  if (altOverrides.has(file)) return altOverrides.get(file);

  const baseName = path.basename(file, path.extname(file));
  return titleCase(baseName.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim());
}

function getDimensions(filePath) {
  const output = execFileSync("/usr/bin/sips", ["-g", "pixelWidth", "-g", "pixelHeight", filePath], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const width = Number(output.match(/pixelWidth:\s*(\d+)/)?.[1]);
  const height = Number(output.match(/pixelHeight:\s*(\d+)/)?.[1]);

  if (!width || !height) {
    throw new Error(`Could not read image dimensions for ${filePath}`);
  }

  return { width, height };
}

function listImages() {
  if (!existsSync(imageDir)) return [];

  return readdirSync(imageDir)
    .filter((file) => supportedExtensions.has(path.extname(file).toLowerCase()))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" }));
}

export function syncInterests() {
  const images = listImages().map((file) => {
    const filePath = path.join(imageDir, file);
    const { width, height } = getDimensions(filePath);
    return {
      src: `/assets/interests/${file}`,
      alt: altFromFile(file),
      width,
      height,
    };
  });

  writeFileSync(manifestPath, `${JSON.stringify({ images }, null, 2)}\n`);
  return images.length;
}

function runOnce() {
  const count = syncInterests();
  console.log(`Synced ${count} interest image${count === 1 ? "" : "s"}.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runOnce();

  if (watchMode) {
    let timer = null;
    const scheduleSync = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          runOnce();
        } catch (error) {
          console.error(error);
        }
      }, 150);
    };

    console.log("Watching assets/interests for changes...");
    watch(imageDir, { persistent: true }, (eventType, file) => {
      if (!file || file === path.basename(manifestPath)) return;
      const fullPath = path.join(imageDir, file);
      if (!existsSync(fullPath) || statSync(fullPath).isFile()) {
        scheduleSync();
      }
    });
  }
}
