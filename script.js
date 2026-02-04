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
  const activeObserver = new IntersectionObserver(
    (entries) => {
      // Pick the top-most intersecting section (stable on fast scroll)
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      setActiveNav(visible.target.id);
    },
    { threshold: 0.12, rootMargin: "-30% 0px -60% 0px" }
  );

  for (const { section } of sectionEntries) activeObserver.observe(section);

  // Initialize based on hash, if present.
  const hash = window.location.hash?.slice(1);
  if (hash) setActiveNav(hash);
}

