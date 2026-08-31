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
  "crystal-mountain-ski-slope-panorama.jpg",
  "beach-sunset-shoreline.jpg",
  "forest-trail-closeup.jpg",
  "RCF-sunset.jpg",
  "mountain-leconte.jpg",
  "parliament-river-dusk.jpg",
  "snow-slope-hike.jpg",
  "arabian-sea-night-view.jpg",
  "rocky-cliff.jpg",
  "eiffel-tower-night.jpg",
  "red-lexus-rcf-park.jpg",
  "waterfall-hike-wide.jpg",
  "lake-cliff-sunset.jpg",
  "ornate-hall-interior.jpg",
  "rocky-mountain-overlook.jpg",
  "winter-hike-franconia-ridge.jpg",
  "notre-dame-exterior.jpg",
  "franconia-ridge.jpg",
  "eiffle-tower-sunset-city-view.jpg",
  "winter-falls-basin.jpg",
  "red-river-gorge-trail.jpg",
  "snowy-summit.jpg",
];

const galleryOrderIndex = new Map(galleryOrder.map((file, index) => [file, index]));

const altOverrides = new Map([
  ["RCF-sunset.jpg", "Lexus RCF at sunset"],
  ["angels-landing.png", "Angels Landing rising above Zion Canyon"],
  ["alpine-canyon-pines.jpg", "Pine trees and granite walls in an alpine canyon"],
  ["alpine-stream-and-wildflowers.jpg", "Alpine stream flowing past wildflowers and granite boulders"],
  ["arches-desert-sunrise.jpg", "Sunrise above the Arches desert"],
  ["arabian-sea-night-view.jpg", "Arabian Sea and resort pool at night"],
  ["balanced-rock.jpg", "Balanced Rock beneath a clear Utah sky"],
  ["beach-sunset-shoreline.jpg", "Gulf shores, AL - shoreline at sunset"],
  ["bighorn-sheep-in-meadow.png", "Bighorn sheep standing in a dry meadow"],
  ["bryce-canyon-hoodoos.jpg", "Dense hoodoos across Bryce Canyon"],
  ["bryce-canyon-sunset.jpg", "Bryce Canyon hoodoos in the evening light"],
  ["canyonlands-and-la-sal-mountains.jpg", "Canyonlands mesas beneath the La Sal Mountains"],
  ["crystal-mountain-ski-slope-panorama.jpg", "Crystal Mountain ski slope panorama"],
  ["delicate-arch-wide-view.jpg", "Delicate Arch above the Utah desert"],
  ["delicate-arch-with-me.jpg", "Person standing beneath Delicate Arch"],
  ["desert-petroglyph-panel.jpg", "Petroglyph figures carved into a desert rock panel"],
  ["dinosaur-track-fossil.jpg", "Fossilized dinosaur track preserved in stone"],
  ["double-arch-skyward-view.jpg", "Skyward view through the openings of Double Arch"],
  ["eiffel-tower-night.jpg", "Eiffel Tower at night"],
  ["eiffle-tower-sunset-city-view.jpg", "Paris city view toward the Eiffel Tower at sunset"],
  ["franconia-ridge.jpg", "Franconia Ridge, New Hampshire"],
  ["forest-lake-overlook.jpg", "Forest lake viewed from a high mountain slope"],
  ["forest-river-bend.jpg", "River bending through a dense mountain forest"],
  ["forest-trail-millipede.jpg", "Millipede crossing a forest trail"],
  ["grand-teton-campsite.jpg", "Orange backpacking tent facing the Grand Teton range"],
  ["grand-teton-pastel-sunrise.jpg", "Pastel sunrise across the Grand Teton range"],
  ["grand-teton-sunrise.jpg", "Sunrise over the Grand Teton range"],
  ["hollywood-beach-family-pic.jpg", "Group gathered near a Hollywood Beach sign"],
  ["landscape-arch.jpg", "Landscape Arch spanning a sunlit Utah sandstone ridge"],
  ["lake-cliff-sunset.jpg", "Put in Bay at sunset"],
  ["moose-family.jpg", "Moose and two calves feeding among willows"],
  ["mountain-lake-overlook.jpg", "Washington mountain lake"],
  ["mountain-lake-swim.jpg", "Swimmer crossing a mountain lake beneath granite peaks"],
  ["mountain-leconte.jpg", "Mount LeConte in Great Smoky Mountains National Park"],
  ["mountain-meadow-sunrise.jpg", "Fiery sunrise above a mountain meadow"],
  ["mountain-timpanagos-cirque-under-clouds.jpg", "Mount Timpanogos cirque beneath low clouds"],
  ["mountain-trail.jpg", "Franconia, NH"],
  ["mountain-trail-hiker.jpg", "Franconia, NH"],
  ["notre-dame-exterior.jpg", "Notre-Dame exterior at sunset"],
  ["notre-dame-interior-organ.jpg", "Notre-Dame interior"],
  ["ornate-hall-interior.jpg", "Ornate historic hall interior"],
  ["parliament-river-dusk.jpg", "Parliament and Big Ben across the river at dusk"],
  ["red-rock-monoliths-golden-hour.jpg", "Red rock monoliths in the Utah desert at golden hour"],
  ["red-lexus-rcf-park.jpg", "Red Lexus RCF parked beside a green park"],
  ["roadtrip-coupes.jpg", "Red Lexus RCF and blue Mustang parked on a road trip stop"],
  ["rocky-alpine-valley-overlook.jpg", "Rocky alpine valley descending toward distant lakes"],
  ["rocky-cliff.jpg", "Red River Gorge"],
  ["rocky-cliff-hiker.jpg", "Red River Gorge"],
  ["rocky-mountain-overlook.jpg", "Chimney Peak, WV"],
  ["rocky-teton-pass.jpg", "Rock-strewn pass between steep Teton walls"],
  ["red-river-gorge-trail.jpg", "Trail through Red River Gorge"],
  ["rocky-trail-hiker.jpg", "Red River Gorge pt. 2"],
  ["snow-slope-hike.jpg", "Franconia Ridge in late November"],
  ["winter-hike-franconia-ridge.jpg", "Winter hike across Franconia Ridge beneath dramatic sky"],
  ["snowy-summit.jpg", "Mount Lafayette summit in winter"],
  ["snowy-summit-hiker.jpg", "Mount Lafayette summit in winter"],
  ["teton-alpine-pass.jpg", "Granite walls and talus descending from a Teton alpine pass"],
  ["teton-alpine-ridge-dad-selfie.jpg", "Backpacker on a high Teton ridge above snowfields"],
  ["teton-snowfield-ridge.jpg", "Snowfields below a rugged Teton ridgeline"],
  ["teton-sunset-over-forest.jpg", "Grand Teton silhouette above the forest at sunset"],
  ["utah-arch-sunset-window.jpg", "Desert sunset framed by a sandstone arch"],
  ["utah-desert-factory-butte.jpg", "Factory Butte beneath towering summer clouds"],
  ["utah-red-rock-strata.jpg", "Layered red rock strata across a Utah desert wall"],
  ["wasatch-mountain-valley-clouds.jpg", "Wasatch mountain valley beneath dramatic clouds"],
  ["waterfall-sundance.jpg", "Waterfall descending through a layered Utah canyon"],
  ["waterfall-hike-wide.jpg", "Waterfall"],
  ["winter-falls-basin.jpg", "Winter waterfall basin"],
  ["zion-canyon-overlook-sunset.jpg", "Zion Canyon overlook at sunset"],
  ["zion-canyon-overlook.jpg", "Zion Canyon viewed from a high sandstone overlook"],
  ["zion-milky-way.jpg", "Milky Way crossing the night sky above Zion"],
  ["zion-narrows-river-canyon.jpg", "River flowing between the towering walls of the Zion Narrows"],
  ["sundance-mountain-resort-at-dusk.jpg", "Sundance Mountain Resort glowing at dusk"],
  ["sundance-mountain-resort-courtyard.jpg", "Timber courtyard at Sundance Mountain Resort"],
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
