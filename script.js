(() => {
  document.documentElement.classList.add("js");

  const EMAIL = "me@calebstammen.com";
  const nav = document.querySelector("#primary-nav");
  const toggle = document.querySelector(".nav-toggle");
  const toast = document.querySelector("#toast");
  let toastTimer = 0;

  for (const year of document.querySelectorAll("[data-year]")) {
    year.textContent = String(new Date().getFullYear());
  }

  function setNavOpen(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  toggle?.addEventListener("click", () => {
    setNavOpen(!nav?.classList.contains("is-open"));
  });

  document.addEventListener("click", (event) => {
    if (!nav?.classList.contains("is-open")) return;
    if (!(event.target instanceof Node)) return;
    if (nav.contains(event.target) || toggle?.contains(event.target)) return;
    setNavOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    setNavOpen(false);
    toggle?.focus({ preventScroll: true });
  });

  for (const link of document.querySelectorAll("#primary-nav a")) {
    link.addEventListener("click", () => setNavOpen(false));
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1700);
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      showToast("Email copied");
    } catch {
      showToast("Copy failed");
    }
  }

  for (const button of document.querySelectorAll("[data-copy-email]")) {
    button.addEventListener("click", copyEmail);
  }

  const revealItems = Array.from(document.querySelectorAll(".reveal"));
  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
})();
