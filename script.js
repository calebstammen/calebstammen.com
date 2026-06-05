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

  function initHeroParticles() {
    const canvases = Array.from(document.querySelectorAll("[data-particle-canvas], #particle-canvas"));
    if (!canvases.length) return;

    for (const canvas of canvases) {
      if (!(canvas instanceof HTMLCanvasElement)) continue;
      initParticleCanvas(canvas);
    }
  }

  function initParticleCanvas(canvas) {
    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let points = [];
    let pointer = null;

    function createPoint() {
      const speed = 0.08 + Math.random() * 0.18;
      const angle = Math.random() * Math.PI * 2;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 0.9 + Math.random() * 1.3,
      };
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(96, Math.max(42, Math.round((width * height) / 9200)));
      points = Array.from({ length: count }, createPoint);
      draw();
    }

    function drawLine(a, b, maxDistance) {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.hypot(dx, dy);
      if (distance > maxDistance) return;

      const alpha = (1 - distance / maxDistance) * 0.35;
      context.strokeStyle = `rgba(255,255,255,${alpha})`;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.stroke();
    }

    function movePoint(point) {
      point.x += point.vx;
      point.y += point.vy;

      if (point.x < -12) point.x = width + 12;
      if (point.x > width + 12) point.x = -12;
      if (point.y < -12) point.y = height + 12;
      if (point.y > height + 12) point.y = -12;
    }

    function draw() {
      context.clearRect(0, 0, width, height);

      for (let index = 0; index < points.length; index += 1) {
        const point = points[index];
        if (!reducedMotion.matches) movePoint(point);

        for (let next = index + 1; next < points.length; next += 1) {
          drawLine(point, points[next], 105);
        }

        if (pointer) drawLine(point, pointer, 135);

        context.fillStyle = "rgba(255,255,255,0.72)";
        context.beginPath();
        context.arc(point.x, point.y, point.r, 0, Math.PI * 2);
        context.fill();
      }

      if (!reducedMotion.matches) {
        frame = window.requestAnimationFrame(draw);
      }
    }

    canvas.addEventListener("mousemove", (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    });

    canvas.addEventListener("mouseleave", () => {
      pointer = null;
    });

    window.addEventListener("resize", () => {
      window.cancelAnimationFrame(frame);
      resize();
    });

    reducedMotion.addEventListener?.("change", () => {
      window.cancelAnimationFrame(frame);
      draw();
    });

    resize();
  }

  initHeroParticles();

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
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(EMAIL);
      showToast("Email copied");
      return;
    } catch {
      try {
        const fallback = document.createElement("textarea");
        fallback.value = EMAIL;
        fallback.setAttribute("readonly", "");
        fallback.style.position = "fixed";
        fallback.style.top = "-9999px";
        fallback.style.left = "-9999px";
        document.body.appendChild(fallback);
        fallback.focus();
        fallback.select();
        const copied = document.execCommand("copy");
        fallback.remove();
        showToast(copied ? "Email copied" : EMAIL);
      } catch {
        showToast(EMAIL);
      }
    }
  }

  for (const button of document.querySelectorAll("[data-copy-email]")) {
    button.addEventListener("click", copyEmail);
  }

  function initInterestGalleries() {
    const galleries = document.querySelectorAll("[data-interest-gallery]");

    for (const gallery of galleries) {
      const slides = Array.from(gallery.querySelectorAll("[data-gallery-slide]"));
      const status = gallery.querySelector("[data-gallery-status]");
      if (slides.length < 2) continue;

      let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
      if (activeIndex < 0) activeIndex = 0;

      function wrapIndex(index) {
        return (index + slides.length) % slides.length;
      }

      function setActive(nextIndex) {
        activeIndex = wrapIndex(nextIndex);
        const previousIndex = wrapIndex(activeIndex - 1);
        const nextSlideIndex = wrapIndex(activeIndex + 1);

        slides.forEach((slide, index) => {
          const isActive = index === activeIndex;
          const isPrevious = index === previousIndex;
          const isNext = index === nextSlideIndex;
          const isVisible = isActive || isPrevious || isNext;

          slide.classList.toggle("is-active", isActive);
          slide.classList.toggle("is-prev", isPrevious);
          slide.classList.toggle("is-next", isNext);
          slide.tabIndex = isVisible ? 0 : -1;
          slide.setAttribute("aria-hidden", String(!isVisible));

          if (isPrevious) {
            slide.setAttribute("aria-label", "Show previous image");
          } else if (isNext || isActive) {
            slide.setAttribute("aria-label", "Show next image");
          } else {
            slide.setAttribute("aria-label", "Gallery image");
          }
        });

        if (status) {
          status.textContent = `Image ${activeIndex + 1} of ${slides.length}`;
        }
      }

      gallery.addEventListener("click", (event) => {
        if (!(event.target instanceof Element)) return;

        const directionButton = event.target.closest("[data-gallery-direction]");
        if (directionButton) {
          const direction = Number(directionButton.getAttribute("data-gallery-direction")) || 1;
          setActive(activeIndex + direction);
          return;
        }

        const slide = event.target.closest("[data-gallery-slide]");
        if (!slide) return;
        if (slide.classList.contains("is-prev")) {
          setActive(activeIndex - 1);
        } else {
          setActive(activeIndex + 1);
        }
      });

      gallery.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          setActive(activeIndex - 1);
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();
          setActive(activeIndex + 1);
        }
      });

      setActive(activeIndex);
    }
  }

  initInterestGalleries();

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
