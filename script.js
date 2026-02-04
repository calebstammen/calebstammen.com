document.documentElement.classList.add("js");

const EMAIL = "me@calebstammen.com";

const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("is-visible");

  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1700);
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  ta.style.top = "0";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  ta.remove();
}

for (const el of document.querySelectorAll("[data-copy-email]")) {
  el.addEventListener("click", async () => {
    try {
      await copyText(EMAIL);
      showToast("Email copied");
    } catch {
      showToast("Copy failed");
    }
  });
}

// Mobile nav toggle
const navToggle = document.querySelector(".nav-toggle");
const primaryNav = document.getElementById("primary-nav");

if (navToggle && primaryNav) {
  const closeNav = () => {
    primaryNav.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = primaryNav.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  for (const link of primaryNav.querySelectorAll("a")) {
    link.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 1200px)").matches) closeNav();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });

  window.addEventListener("resize", () => {
    if (!window.matchMedia("(max-width: 1200px)").matches) closeNav();
  });
}

function handlePhotoError(img) {
  const fallback = img.dataset.fallback;
  if (fallback && !img.dataset.fallbackTried) {
    img.dataset.fallbackTried = "true";
    img.removeAttribute("srcset");
    img.removeAttribute("sizes");
    img.src = fallback;
    return;
  }

  const card = img.closest(".photo-card");
  if (card) card.classList.add("is-missing");
  img.remove();
}

function setupPhotoFallbacks() {
  const images = document.querySelectorAll(".photo-card img");
  if (!images.length) return;

  for (const img of images) {
    img.addEventListener("error", () => handlePhotoError(img));
    if (img.complete && img.naturalWidth === 0) handlePhotoError(img);
  }
}

setupPhotoFallbacks();

// Scroll reveal
const revealEls = Array.from(document.querySelectorAll(".reveal"));
const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

if (revealEls.length) {
  if (reducedMotion) {
    for (const el of revealEls) el.classList.add("is-visible");
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -12% 0px" }
    );

    for (const el of revealEls) revealObserver.observe(el);
  }
}

// Active nav highlighting (in-page anchors only)
const navLinks = Array.from(document.querySelectorAll(".nav-links a[href^=\"#\"]"));
const sectionEntries = navLinks
  .map((a) => {
    const id = a.getAttribute("href")?.slice(1);
    if (!id) return null;
    const section = document.getElementById(id);
    if (!section) return null;
    return { id, a, section };
  })
  .filter(Boolean);

function setActiveNav(id) {
  for (const entry of sectionEntries) {
    const isActive = entry.id === id;
    entry.a.classList.toggle("active", isActive);
    if (isActive) entry.a.setAttribute("aria-current", "location");
    else entry.a.removeAttribute("aria-current");
  }
}

if (sectionEntries.length) {
  for (const entry of sectionEntries) {
    entry.a.addEventListener("click", () => setActiveNav(entry.id));
  }

  let activeEntry = null;

  function updateActiveByScroll() {
    const cutoff = window.innerHeight * 0.35;
    let best = null;
    for (const entry of sectionEntries) {
      const top = entry.section.getBoundingClientRect().top;
      if (top <= cutoff) {
        if (!best || top > best.top) best = { entry, top };
      }
    }

    const nextEntry = best ? best.entry : sectionEntries[0];
    if (nextEntry && nextEntry !== activeEntry) {
      activeEntry = nextEntry;
      setActiveNav(activeEntry.id);
    }
  }

  window.addEventListener("scroll", updateActiveByScroll, { passive: true });
  window.addEventListener("resize", updateActiveByScroll);
  updateActiveByScroll();

  // Initialize based on hash, if present.
  const hash = window.location.hash?.slice(1);
  if (hash) setActiveNav(hash);

  window.addEventListener("hashchange", () => {
    const nextHash = window.location.hash?.slice(1);
    if (nextHash) setActiveNav(nextHash);
  });
}

// Travel maps
const US_STATE_ABBR = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
  "District of Columbia": "DC",
};

const US_STATE_BY_NAME = Object.fromEntries(
  Object.entries(US_STATE_ABBR).map(([name, code]) => [name.toLowerCase(), code])
);
const US_STATE_CODES = new Set(Object.values(US_STATE_ABBR));

function normalizeStateInput(value) {
  if (!value) return null;
  const clean = value.trim();
  if (!clean) return null;
  const upper = clean.toUpperCase();
  if (US_STATE_CODES.has(upper)) return upper;
  const lower = clean.toLowerCase();
  return US_STATE_BY_NAME[lower] || null;
}

function normalizeKey(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function setMapMessage(container, message, className) {
  if (!container) return;
  container.innerHTML = `<p class="${className}">${message}</p>`;
}

async function fetchWithFallback(fetcher, urls) {
  const attempts = Array.isArray(urls) ? urls : [urls];
  let lastError;
  for (const url of attempts) {
    try {
      return await fetcher(url);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Failed to load data.");
}

const topoCache = new Map();

async function loadTopology(urls) {
  const key = Array.isArray(urls) ? urls.join("|") : String(urls);
  if (topoCache.has(key)) return topoCache.get(key);
  const promise = fetchWithFallback(d3.json, urls);
  topoCache.set(key, promise);
  return promise;
}

const mapOverlay = document.getElementById("map-overlay");
const mapOverlayTitle = document.getElementById("map-overlay-title");
const mapOverlayFrame = mapOverlay?.querySelector("[data-map-overlay-frame]");
const mapOverlayReset = mapOverlay?.querySelector("[data-map-overlay-reset]");

const travelModal = document.getElementById("travel-modal");
const travelModalTitle = document.getElementById("travel-modal-title");
const travelModalSubtitle = document.getElementById("travel-modal-subtitle");
const travelModalExcerpt = document.getElementById("travel-modal-excerpt");
const travelModalGallery = document.getElementById("travel-modal-gallery");

function openModal(el) {
  if (!el) return;
  el.classList.add("is-open");
  el.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeModal(el) {
  if (!el) return;
  el.classList.remove("is-open");
  el.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function closeMapOverlay() {
  closeModal(mapOverlay);
  if (mapOverlayFrame) mapOverlayFrame.innerHTML = "";
}

function closeTravelModal() {
  closeModal(travelModal);
  if (travelModalGallery) travelModalGallery.innerHTML = "";
}

function openTravelModal(story, fallbackName) {
  if (!travelModal || !travelModalTitle || !travelModalExcerpt || !travelModalGallery) return;

  closeMapOverlay();

  const title = story?.title || fallbackName || "Visited";
  const subtitle = story?.subtitle || story?.location || "";
  const excerpt = story?.excerpt || "Visited — story coming soon.";

  travelModalTitle.textContent = title;
  if (travelModalSubtitle) {
    travelModalSubtitle.textContent = subtitle;
    travelModalSubtitle.style.display = subtitle ? "block" : "none";
  }
  travelModalExcerpt.textContent = excerpt;

  travelModalGallery.innerHTML = "";
  const images = Array.isArray(story?.images) ? story.images.slice(0, 3) : [];
  if (images.length) {
    for (const [index, item] of images.entries()) {
      const src = typeof item === "string" ? item : item?.src;
      if (!src) continue;
      const alt =
        typeof item === "string"
          ? `${title} photo ${index + 1}`
          : item?.alt || `${title} photo ${index + 1}`;
      const figure = document.createElement("figure");
      const img = document.createElement("img");
      img.src = src;
      img.alt = alt;
      img.loading = "lazy";
      img.decoding = "async";
      figure.appendChild(img);
      travelModalGallery.appendChild(figure);
    }
    travelModalGallery.classList.remove("is-empty");
  } else {
    travelModalGallery.classList.add("is-empty");
  }

  openModal(travelModal);
}

for (const closeEl of document.querySelectorAll("[data-overlay-close]")) {
  closeEl.addEventListener("click", closeMapOverlay);
}

for (const closeEl of document.querySelectorAll("[data-travel-close]")) {
  closeEl.addEventListener("click", closeTravelModal);
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (mapOverlay?.classList.contains("is-open")) closeMapOverlay();
  if (travelModal?.classList.contains("is-open")) closeTravelModal();
});

async function renderTravelMap(config) {
  const container = config.container;
  if (!container) return;
  setMapMessage(container, "Loading map...", "map-loading");

  try {
    const topology = await loadTopology(config.topoUrl);
    const collection = topojson.feature(topology, topology.objects[config.objectName]);
    let features = collection.features;

    for (const feature of features) {
      const name = feature.properties?.name || String(feature.id);
      feature.properties = { ...(feature.properties || {}), name };
    }

    if (config.filter) {
      features = features.filter((feature) => config.filter(feature));
    }

    const width = config.size[0];
    const height = config.size[1];
    const projection = config.projection().fitSize(
      [width, height],
      { type: "FeatureCollection", features }
    );
    const path = d3.geoPath(projection);

    let visitedCount = 0;
    for (const feature of features) {
      feature._visited = Boolean(config.isVisited(feature));
      if (feature._visited) visitedCount += 1;
    }

    const svg = d3
      .create("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("class", "map-svg")
      .attr("role", "img")
      .attr("aria-label", config.label);

    const group = svg.append("g").attr("class", "map-group");

    const region = group
      .selectAll("path")
      .data(features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", (feature) =>
        feature._visited ? "map-region is-visited" : "map-region"
      )
      .attr("data-name", (feature) => feature.properties.name);

    if (config.onRegionClick) {
      region
        .filter((feature) => feature._visited)
        .attr("role", "button")
        .attr("tabindex", "0")
        .style("cursor", "pointer")
        .on("click", (event, feature) => {
          if (event.defaultPrevented) return;
          event.stopPropagation();
          config.onRegionClick(feature);
        })
        .on("keydown", (event, feature) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          config.onRegionClick(feature);
        });
    }

    region
      .append("title")
      .text((feature) =>
        feature._visited
          ? `${feature.properties.name} (visited)`
          : feature.properties.name
      );

    container.innerHTML = "";
    container.appendChild(svg.node());
    container.classList.toggle("is-zoomable", Boolean(config.enableZoom));

    if (config.enableZoom) {
      const zoom = d3
        .zoom()
        .scaleExtent([1, config.maxZoom || 6])
        .on("zoom", (event) => {
          group.attr("transform", event.transform);
        });

      svg.call(zoom);
      svg.on("dblclick.zoom", null);

      if (config.resetEl) {
        config.resetEl.onclick = () => {
          svg.transition().duration(200).call(zoom.transform, d3.zoomIdentity);
        };
      }
    }

    if (config.countEl) config.countEl.textContent = String(visitedCount);
    if (config.totalEl) config.totalEl.textContent = String(features.length);
  } catch (error) {
    console.error("Map failed to load:", error);
    const isFileProtocol = window.location.protocol === "file:";
    setMapMessage(
      container,
      isFileProtocol
        ? "Map failed to load. Run a local web server instead of file preview."
        : "Map failed to load. Check network access or CDN availability.",
      "map-fallback"
    );
  }
}

function initTravelMaps() {
  const containers = Array.from(document.querySelectorAll("[data-map]"));
  if (!containers.length) return;

  const hasD3 = Boolean(window.d3 && typeof window.d3.geoPath === "function");
  const hasTopo = Boolean(window.topojson && typeof window.topojson.feature === "function");

  if (!hasD3 || !hasTopo) {
    for (const container of containers) {
      setMapMessage(container, "Map data is unavailable.", "map-fallback");
    }
    return;
  }

const visitedStatesInput = [
  "CA",
  "CT",
  "FL",
  "GA",
  "IL",
  "IN",
  "KS",
  "KY",
  "MA",
  "MD",
  "MI",
  "MO",
  "NC",
  "NH",
  "NV",
  "NY",
  "OH",
  "PA",
  "SC",
  "TN",
  "VA",
  "VT",
  "WA",
  "WV",
];

const visitedCountriesInput = [
  "France",
  "India",
  "United Kingdom",
  "United States of America",
];

const travelStories = {
  us: [
    {
      state: "CA",
      title: "California",
      subtitle: "Silicon Valley, San Diego, Anaheim, and more.",
      excerpt: "Tech conferences, my bachelor's degree graduation, Disneyland, beaches, and I've only scratched the surface of this huge state.",
      // images: ["assets/travel/california-1.jpg", "assets/travel/california-2.jpg"],
    },
    {
      state: "CT",
      title: "Connecticut",
      // subtitle: "New Haven, Hartford, and the Litchfield Hills",
      // excerpt: "A week of city exploration, scenic views, and local cuisine.",
      // images: ["assets/travel/connecticut-1.jpg", "assets/travel/connecticut-2.jpg"],
    },
    {
      state: "FL",
      title: "Florida",
      // subtitle: "Miami, Orlando, and the Everglades",
      // excerpt: "A week of beach walks, city exploration, and wildlife viewing.",
      // images: ["assets/travel/florida-1.jpg", "assets/travel/florida-2.jpg"],
    },
    {
      state: "GA",
      title: "Georgia",
      // subtitle: "Atlanta, Savannah, and the Blue Ridge Mountains",
      // excerpt: "A week of city exploration, historic sites, and scenic mountain views.",
      // images: ["assets/travel/georgia-1.jpg", "assets/travel/georgia-2.jpg"],
    },
    {
      state: "IL",
      title: "Illinois",
      subtitle: "Chicago, a few times. Heard the pizza was good. I can confirm.",
      // excerpt: "A week of city exploration, scenic views, and local cuisine.",
      // images: ["assets/travel/illinois-1.jpg", "assets/travel/illinois-2.jpg"],
    },
    {
      state: "IN",
      title: "Indiana",
      subtitle: "Indianapolis, Fort Wayne, and much more.",
      excerpt: "I grew up on the Ohio-Indiana border and have visited Indiana many times over the years. One of my favorite places is Ouabache State Park and the surrounding areas.",
      // images: ["assets/travel/indiana-1.jpg", "assets/travel/indiana-2.jpg"],
    },
    {
      state: "KS",
      title: "Kansas",
      // subtitle: "Wichita, Topeka, and the Flint Hills",
      // excerpt: "A week of city exploration, scenic views, and local cuisine.",
      // images: ["assets/travel/kansas-1.jpg", "assets/travel/kansas-2.jpg"],
    },
    {
      state: "KY",
      title: "Kentucky",
      // subtitle: "Lexington, Louisville, and the Bluegrass State",
      // excerpt: "A week of bourbon tours, horse farms, and scenic mountain views.",
      // images: ["assets/travel/kentucky-1.jpg", "assets/travel/kentucky-2.jpg"],
    },
    {
      state: "MA",
      title: "Massachusetts",
      subtitle: "A few loved ones joined me in Boston for my Masters graduation.",
      excerpt: "Great city with so much history. We toured around the Freedom Trail, the Museum of Science, enjoyed some amazing seafood, and visited MIT and Harvard campuses.",
      // images: ["assets/travel/massachusetts-1.jpg", "assets/travel/massachusetts-2.jpg"],
    },
    {
      state: "MD",
      title: "Maryland",
      // subtitle: "Baltimore, Annapolis, and the Eastern Shore",
      // excerpt: "A week of city exploration, scenic views, and local cuisine.",
      // images: ["assets/travel/maryland-1.jpg", "assets/travel/maryland-2.jpg"],
    },
    {
      state: "MI",
      title: "X-ichigan",
      subtitle: "If you're from Ohio, you spell it X-ichigan!",
      excerpt: "From the Great Lakes to Detroit to Ann Arbor, I've visited Michigan multiple times for sporting events, hikes in the beautiful Upper Peninsula, road trips, casinos, and more.",
      // images: ["assets/travel/michigan-1.jpg", "assets/travel/michigan-2.jpg"],
    },
    {
      state: "MO",
      title: "Missouri",
      // subtitle: "St. Louis, Kansas City, and the Ozarks",
      // excerpt: "A week of city exploration, scenic views, and local cuisine.",
      // images: ["assets/travel/missouri-1.jpg", "assets/travel/missouri-2.jpg"],
    },
    {
      state: "NC",
      title: "North Carolina",
      // subtitle: "Asheville, Charlotte, and the Blue Ridge Mountains",
      // excerpt: "A week of hiking, city exploration, and scenic mountain views.",
      // images: ["assets/travel/northcarolina-1.jpg", "assets/travel/northcarolina-2.jpg"],
    },
    {
      state: "NH",
      title: "New Hampshire",
      subtitle: "An epic weekend road trip with a good friend to the White Mountains.",
      excerpt: "14 hours of driving, one way, late November, terrible weather, but so worth it. We left home on a Friday after work and drove straight through the night to get there early Saturday morning. We hiked the Franconia Ridge Loop, one of the most beautiful hikes I've ever done. We camped overnight and hoped to summit Mount Washington the next day, but a snowstorm rolled in while we slept, and we decided to head home. We'll be back!",
      images: ["assets/travel/NH1.jpg", "assets/travel/NH2.jpg"],
    },
    {
      state: "NV",
      title: "Nevada",
      // subtitle: "Las Vegas, Reno, and the Great Basin",
      // excerpt: "A week of city exploration, scenic views, and local cuisine.",
      // images: ["assets/travel/nevada-1.jpg", "assets/travel/nevada-2.jpg"],
    },
    {
      state: "NY",
      title: "New York",
      subtitle: "Part of the epic NH road trip. Looking forward to spending more time in the Adirondacks!",
      // excerpt: "A week of city exploration, scenic views, and local cuisine.",
      // images: ["assets/travel/newyork-1.jpg", "assets/travel/newyork-2.jpg"],
    },
    {
      state: "OH",
      title: "Ohio",
      subtitle: "My home!",
      excerpt: "Born and raised in Ohio. Visited almost every corner of the state over the years, from Cleveland to Cincinnati to Columbus and beyond.",
      // images: ["assets/travel/ohio-1.jpg", "assets/travel/ohio-2.jpg"],
    },
    {
      state: "PA",
      title: "Pennsylvania",
      // subtitle: "Philadelphia, Pittsburgh, and the Allegheny Mountains",
      // excerpt: "A week of city exploration, mountain views, and local food.",
      // images: ["assets/travel/pennsylvania-1.jpg", "assets/travel/pennsylvania-2.jpg"],
    },
    {
      state: "SC",
      title: "South Carolina",
      subtitle: "Visited on many occasions with family. Charleston is a favorite spot (I have a sibling there! Hi Clair.)",
      // excerpt: "A week of historic sites, coastal exploration, and local cuisine.",
      // images: ["assets/travel/southcarolina-1.jpg", "assets/travel/southcarolina-2.jpg"],
    },
    {
      state: "TN",
      title: "Tennessee",
      subtitle: "I've been fortunate to have visited Tennessee many times.",
      excerpt: "From Nashville to Norris Lake to Gatlinburg and the Smoky Mountains, I've enjoyed much of what TN has to offer: beautiful nature and Southern hospitality.",
      // images: ["assets/travel/tennessee-1.jpg", "assets/travel/tennessee-2.jpg"],
    },
    {
      state: "VA",
      title: "Virginia",
      // subtitle: "Richmond, Williamsburg, and the Blue Ridge Mountains",
      // excerpt: "A week of city exploration, scenic views, and local cuisine.",
      // images: ["assets/travel/virginia-1.jpg", "assets/travel/virginia-2.jpg"],
    },
    {
      state: "VT",
      title: "Vermont",
      // subtitle: "Burlington, Montpelier, and the Green Mountains",
      // excerpt: "A week of scenic mountain views, historic sites, and local cuisine.",
      // images: ["assets/travel/vermont-1.jpg", "assets/travel/vermont-2.jpg"],
    },
    {
      state: "WA",
      title: "Washington",
      subtitle: "Seattle, Tacoma, and the surrounding areas on a few separate occasions.",
      excerpt: "Visited with family and friends while exploring the Pacific Northwest. Toured the Space Needle and Pike Place Market, skied at Crystal Mountain, and hiked in the mountains.",
      // images: ["assets/travel/washington-1.jpg", "assets/travel/washington-2.jpg"],
    },
    {
      state: "WV",
      title: "West Virginia",
      subtitle: "A road trip with a friend to the Seneca Rocks area for hiking and climbing.",
      excerpt: "We hiked multiple trails and climbed on the rocks. This was my first overnight hiking trip, and it was a blast!",
      // images: ["assets/travel/westvirginia-1.jpg", "assets/travel/westvirginia-2.jpg"],
    },
  ],
  world: [
    {
      country: "France",
      title: "Paris, France - January 2025",
      subtitle: "A quick trip to Paris with my brother Seth and his wife Mandy. We took the train from London.",
      excerpt: "Toured around the city, seeing (and going up) the Eiffel Tower, the Louvre Museum, Notre-Dame Cathedral, and more.",
      // images: ["assets/travel/france-1.jpg"],
    },
    {
      country: "India",
      title: "Wedding in Thiruvananthapuram, India - January 2025",
      subtitle: "A quick layover in Delhi on our way to Trivandrum Airport for my cousin's wedding.",
      excerpt: "We stayed at The Leela Kovalam and I had a blast at my first Indian wedding. The food was incredible, the ceremonies were beautiful, and the people were so warm and welcoming.",
      // images: ["assets/travel/iceland-1.jpg"],
    },
    {
      country: "United Kingdom",
      title: "London, United Kingdom - January 2025",
      subtitle: "Visited London with my brother Seth and his wife Mandy.",
      excerpt: "We toured around the city, seeing historical landmarks and museums: Big Ben, Buckingham Palace, the Tower of London, the British Museum, beautiful cathedrals, and more.",
      // images: ["assets/travel/iceland-1.jpg"],
    },
    {
      country: "United States of America",
      title: "The US of A",
      subtitle: "This is home for me.",
    },
  ],
};


  const storyByState = new Map();
  for (const story of travelStories.us) {
    const code = normalizeStateInput(story.state);
    if (!code) continue;
    storyByState.set(code, { ...story, code });
  }

  const storyByCountry = new Map();
  for (const story of travelStories.world) {
    const key = normalizeKey(story.country);
    if (!key) continue;
    storyByCountry.set(key, { ...story, key });
  }

  const visitedStates = new Set(
    visitedStatesInput.map(normalizeStateInput).filter(Boolean)
  );
  const visitedCountries = new Set(
    visitedCountriesInput.map((value) => normalizeKey(value)).filter(Boolean)
  );

  for (const code of storyByState.keys()) visitedStates.add(code);
  for (const key of storyByCountry.keys()) visitedCountries.add(key);

  const usContainer = document.querySelector("[data-map=\"us\"]");
  const worldContainer = document.querySelector("[data-map=\"world\"]");
  const usReset = document.querySelector("[data-map-reset=\"us\"]");
  const worldReset = document.querySelector("[data-map-reset=\"world\"]");

  function openMapOverlay(mapConfig) {
    if (!mapOverlay || !mapOverlayFrame || !mapOverlayTitle) return;
    closeTravelModal();
    mapOverlayTitle.textContent = mapConfig.label;
    mapOverlayFrame.innerHTML = "";
    renderTravelMap({
      ...mapConfig,
      container: mapOverlayFrame,
      size: mapConfig.overlaySize || mapConfig.size,
      countEl: null,
      totalEl: null,
      resetEl: mapOverlayReset || null,
      enableZoom: true,
      maxZoom: mapConfig.maxZoom || 7,
    });
    openModal(mapOverlay);
  }

  const maps = [
    {
      key: "us",
      label: usContainer?.dataset.mapLabel || "United States map",
      container: usContainer,
      countEl: document.querySelector("[data-map-count=\"us\"]"),
      totalEl: document.querySelector("[data-map-total=\"us\"]"),
      resetEl: usReset,
      topoUrl: [
        "assets/maps/us-states-10m.json",
        "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json",
        "https://unpkg.com/us-atlas@3/states-10m.json",
      ],
      objectName: "states",
      size: [640, 400],
      overlaySize: [980, 620],
      projection: () => d3.geoAlbersUsa(),
      enableZoom: true,
      filter: (feature) => feature.properties?.name !== "District of Columbia",
      isVisited: (feature) => {
        const code = US_STATE_ABBR[feature.properties.name];
        return code ? visitedStates.has(code) : false;
      },
      onRegionClick: (feature) => {
        const code = US_STATE_ABBR[feature.properties.name];
        const story = code ? storyByState.get(code) : null;
        openTravelModal(story, feature.properties.name);
      },
    },
    {
      key: "world",
      label: worldContainer?.dataset.mapLabel || "World map",
      container: worldContainer,
      countEl: document.querySelector("[data-map-count=\"world\"]"),
      totalEl: document.querySelector("[data-map-total=\"world\"]"),
      resetEl: worldReset,
      topoUrl: [
        "assets/maps/world-countries-110m.json",
        "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
        "https://unpkg.com/world-atlas@2/countries-110m.json",
      ],
      objectName: "countries",
      size: [640, 360],
      overlaySize: [980, 520],
      projection: () => d3.geoNaturalEarth1(),
      enableZoom: true,
      filter: (feature) => feature.properties?.name !== "Antarctica",
      isVisited: (feature) => {
        const nameKey = normalizeKey(feature.properties.name || "");
        const idKey = normalizeKey(String(feature.id));
        return visitedCountries.has(nameKey) || visitedCountries.has(idKey);
      },
      onRegionClick: (feature) => {
        const nameKey = normalizeKey(feature.properties.name || "");
        const story = storyByCountry.get(nameKey);
        openTravelModal(story, feature.properties.name);
      },
    },
  ];

  for (const map of maps) {
    renderTravelMap(map);
  }

  const mapByKey = new Map(maps.map((map) => [map.key, map]));
  for (const button of document.querySelectorAll("[data-map-expand]")) {
    button.addEventListener("click", () => {
      const key = button.getAttribute("data-map-expand");
      if (!key) return;
      const config = mapByKey.get(key);
      if (config) openMapOverlay(config);
    });
  }
}

initTravelMaps();
