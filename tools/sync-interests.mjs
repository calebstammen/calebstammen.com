import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync, watch, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const imageDir = path.join(repoRoot, "assets", "interests");
const manifestPath = path.join(imageDir, "manifest.json");
const watchMode = process.argv.includes("--watch");
const supportedExtensions = new Set([".avif", ".jpeg", ".jpg", ".png", ".webp"]);

const galleryOrder = [
  "mountain-lake-overlook.jpg",
  "roadtrip-coupes.jpg",
  "notre-dame-interior-organ.jpg",
  "ski-slope-panorama.jpg",
  "beach-sunset-shoreline.jpg",
  "forest-trail-closeup.jpg",
  "RCF-sunset.jpg",
  "mountain-ridge-view.jpg",
  "parliament-river-dusk.jpg",
  "snow-slope-hike.jpg",
  "ocean-pool-night-view.jpg",
  "rocky-cliff.jpg",
  "eiffel-tower-night-close.jpg",
  "red-lexus-rcf-park.jpg",
  "waterfall-hike-wide.jpg",
  "lake-cliff-sunset.jpg",
  "ornate-hall-interior.jpg",
  "rocky-mountain-overlook.jpg",
  "snowy-mountain-panorama.jpg",
  "notre-dame-exterior.jpg",
  "mountain-trail.jpg",
  "paris-sunset-city-view.jpg",
  "winter-falls-basin.jpg",
  "rocky-trail.jpg",
  "snowy-summit.jpg",
];

const galleryOrderIndex = new Map(galleryOrder.map((file, index) => [file, index]));

const altOverrides = new Map([
  ["RCF-sunset.jpg", "Lexus RCF at sunset"],
  ["beach-sunset-shoreline.jpg", "Gulf shores, AL - shoreline at sunset"],
  ["eiffel-tower-night-close.jpg", "Eiffel Tower at night"],
  ["forest-trail-closeup.jpg", "Forest trail close-up on a tree trunk"],
  ["hollywood-beach-family-pic.jpg", "Group gathered near a Hollywood Beach sign"],
  ["lake-cliff-sunset.jpg", "Put in Bay at sunset"],
  ["mountain-lake-overlook.jpg", "Washington mountain lake"],
  ["mountain-ridge-view.jpg", "Great Smoky Mountain National Park"],
  ["mountain-trail.jpg", "Franconia, NH"],
  ["mountain-trail-hiker.jpg", "Franconia, NH"],
  ["notre-dame-exterior.jpg", "Notre-Dame exterior at sunset"],
  ["notre-dame-interior-organ.jpg", "Notre-Dame interior"],
  ["ocean-pool-night-view.jpg", "Leela Kovalam in Kerala, India"],
  ["ornate-hall-interior.jpg", "Ornate historic hall interior"],
  ["paris-sunset-city-view.jpg", "Paris city view over the river at sunset"],
  ["parliament-river-dusk.jpg", "Parliament and Big Ben across the river at dusk"],
  ["red-lexus-rcf-park.jpg", "Red Lexus RCF parked beside a green park"],
  ["roadtrip-coupes.jpg", "Red Lexus RCF and blue Mustang parked on a road trip stop"],
  ["rocky-cliff.jpg", "Red River Gorge"],
  ["rocky-cliff-hiker.jpg", "Red River Gorge"],
  ["rocky-mountain-overlook.jpg", "Chimney Peak, WV"],
  ["rocky-trail.jpg", "Red River Gorge pt. 2"],
  ["rocky-trail-hiker.jpg", "Red River Gorge pt. 2"],
  ["ski-slope-panorama.jpg", "Crystal Mountain"],
  ["snow-slope-hike.jpg", "Franconia Ridge in late November"],
  ["snowy-mountain-panorama.jpg", "Franconia Ridge beneath dramatic sky"],
  ["snowy-summit.jpg", "Mount Lafayette summit in winter"],
  ["snowy-summit-hiker.jpg", "Mount Lafayette summit in winter"],
  ["waterfall-hike-wide.jpg", "Waterfall"],
  ["winter-falls-basin.jpg", "Winter waterfall basin"],
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

function compareImageNames(left, right) {
  const leftIndex = galleryOrderIndex.get(left) ?? Number.MAX_SAFE_INTEGER;
  const rightIndex = galleryOrderIndex.get(right) ?? Number.MAX_SAFE_INTEGER;

  if (leftIndex !== rightIndex) return leftIndex - rightIndex;
  return left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
}

function listImages() {
  if (!existsSync(imageDir)) return [];

  return readdirSync(imageDir)
    .filter((file) => supportedExtensions.has(path.extname(file).toLowerCase()))
    .sort(compareImageNames);
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
