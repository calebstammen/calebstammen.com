(() => {
  document.documentElement.classList.add("js");

  const EMAIL = "me@calebstammen.com";
  const NAV_BREAKPOINT = "(max-width: 1280px)";
  const reduceMotionQuery =
    window.matchMedia?.("(prefers-reduced-motion: reduce)") ?? null;
  const motionSubscribers = new Set();
  const bodyLocks = new Set();

  let prefersReducedMotion = Boolean(reduceMotionQuery?.matches);
  let toastTimer = 0;

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const noop = () => {};

  const rafThrottle = (callback) => {
    let frameId = 0;

    return (...args) => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        callback(...args);
      });
    };
  };

  const onMediaChange = (query, handler) => {
    if (!query) return noop;

    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", handler);
      return () => query.removeEventListener("change", handler);
    }

    query.addListener(handler);
    return () => query.removeListener(handler);
  };

  function syncBodyLock() {
    document.body.style.overflow = bodyLocks.size ? "hidden" : "";
  }

  function lockBody(key) {
    bodyLocks.add(key);
    syncBodyLock();
  }

  function unlockBody(key) {
    bodyLocks.delete(key);
    syncBodyLock();
  }

  function notifyMotionChange(nextValue) {
    prefersReducedMotion = nextValue;
    document.documentElement.classList.toggle("reduced-motion", nextValue);

    for (const subscriber of motionSubscribers) {
      subscriber(nextValue);
    }
  }

  function subscribeToMotion(subscriber) {
    motionSubscribers.add(subscriber);
    subscriber(prefersReducedMotion);
    return () => motionSubscribers.delete(subscriber);
  }

  onMediaChange(reduceMotionQuery, (event) => {
    notifyMotionChange(Boolean(event.matches));
  });

  document.documentElement.classList.toggle("reduced-motion", prefersReducedMotion);

  function fillYears() {
    for (const yearEl of qsa("#year")) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  function showToast(message) {
    const toast = qs("#toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("is-visible");

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 1800);
  }

  async function copyText(text) {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch (error) {
        console.warn("Clipboard API copy failed, trying fallback:", error);
      }
    }

    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.select();

    const copied = document.execCommand?.("copy");
    textArea.remove();

    if (!copied) {
      throw new Error("Clipboard copy failed.");
    }
  }

  function initCopyEmailButtons() {
    for (const button of qsa("[data-copy-email]")) {
      button.addEventListener("click", async () => {
        try {
          await copyText(EMAIL);
          showToast("Email copied");
        } catch (error) {
          console.error("Copy failed:", error);
          showToast("Copy failed");
        }
      });
    }
  }

  function initNavigation() {
    const nav = qs("#primary-nav");
    const toggle = qs(".nav-toggle");
    const mobileQuery = window.matchMedia?.(NAV_BREAKPOINT) ?? null;

    if (!nav || !toggle || !mobileQuery) {
      return { close: noop };
    }

    const isOpen = () => nav.classList.contains("is-open");

    const setOpen = (nextValue) => {
      const open = mobileQuery.matches && nextValue;

      nav.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));

      if (mobileQuery.matches) {
        nav.setAttribute("aria-hidden", String(!open));
      } else {
        nav.removeAttribute("aria-hidden");
      }

      if (open) lockBody("nav");
      else unlockBody("nav");
    };

    const close = () => setOpen(false);

    toggle.addEventListener("click", () => {
      setOpen(!isOpen());
    });

    document.addEventListener("click", (event) => {
      if (!mobileQuery.matches || !isOpen()) return;
      if (!(event.target instanceof Node)) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      close();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !isOpen()) return;
      close();
      toggle.focus({ preventScroll: true });
    });

    for (const link of qsa("a", nav)) {
      link.addEventListener("click", () => {
        if (mobileQuery.matches) close();
      });
    }

    onMediaChange(mobileQuery, (event) => {
      if (!event.matches) {
        close();
        nav.removeAttribute("aria-hidden");
        return;
      }

      nav.setAttribute("aria-hidden", String(!isOpen()));
    });

    if (mobileQuery.matches) {
      nav.setAttribute("aria-hidden", "true");
    }

    return { close };
  }

  function initInPageScroll(closeNav) {
    for (const anchor of qsa('a[href^="#"]:not([href="#"])')) {
      const href = anchor.getAttribute("href");
      if (!href) continue;

      const targetId = decodeURIComponent(href.slice(1));
      if (!targetId) continue;

      const target = document.getElementById(targetId);
      if (!target) continue;

      anchor.addEventListener("click", (event) => {
        if (event.defaultPrevented) return;
        if (event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        event.preventDefault();
        closeNav();

        window.requestAnimationFrame(() => {
          const behavior =
            prefersReducedMotion || anchor.classList.contains("skip-link")
              ? "auto"
              : "smooth";

          target.scrollIntoView({
            behavior,
            block: "start",
          });
        });

        if (window.location.hash !== href) {
          window.history.pushState(null, "", href);
        }
      });
    }
  }

  function initActiveNav() {
    const navLinks = qsa('.site-nav a[href^="#"]');
    if (!navLinks.length) return;

    const sectionMap = new Map();

    for (const link of navLinks) {
      const href = link.getAttribute("href");
      const id = href?.slice(1);
      if (!id) continue;

      const section = document.getElementById(id);
      if (!section) continue;

      if (!sectionMap.has(id)) {
        sectionMap.set(id, { id, section, links: [] });
      }

      sectionMap.get(id).links.push(link);
    }

    const trackedSections = Array.from(sectionMap.values());
    if (!trackedSections.length) return;

    const setActive = (activeId) => {
      for (const entry of trackedSections) {
        const isActive = entry.id === activeId;

        for (const link of entry.links) {
          link.classList.toggle("active", isActive);

          if (isActive) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        }
      }
    };

    const updateActive = () => {
      const headerHeight = qs(".site-header")?.getBoundingClientRect().height ?? 0;
      const cutoff = headerHeight + window.innerHeight * 0.18;

      let activeId = null;
      let lastPassedId = null;

      for (const entry of trackedSections) {
        const rect = entry.section.getBoundingClientRect();

        if (rect.top <= cutoff) {
          lastPassedId = entry.id;
        }

        if (rect.top <= cutoff && rect.bottom > cutoff) {
          activeId = entry.id;
          break;
        }
      }

      setActive(activeId || lastPassedId);
    };

    const requestUpdate = rafThrottle(updateActive);

    for (const entry of trackedSections) {
      for (const link of entry.links) {
        link.addEventListener("click", () => setActive(entry.id));
      }
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("hashchange", requestUpdate);

    window.requestAnimationFrame(updateActive);
  }

  function initReveal() {
    const revealItems = qsa(".reveal");
    if (!revealItems.length) return;

    const revealAll = () => {
      for (const item of revealItems) {
        item.classList.add("is-visible");
        item.style.removeProperty("transition-delay");
      }
    };

    if (!("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    let observer = null;

    const start = () => {
      if (observer) return;

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        },
        {
          threshold: 0.16,
          rootMargin: "0px 0px -10% 0px",
        }
      );

      revealItems.forEach((item, index) => {
        if (item.classList.contains("is-visible")) return;

        const delay = (index % 4) * 40;
        if (delay) {
          item.style.transitionDelay = `${delay}ms`;
        }

        observer.observe(item);
      });
    };

    const stop = () => {
      observer?.disconnect();
      observer = null;
    };

    subscribeToMotion((reduced) => {
      if (reduced) {
        stop();
        revealAll();
        return;
      }

      start();
    });
  }

  function initScrollProgress() {
    const progressBar = qs("[data-scroll-progress]");
    if (!progressBar) return;

    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max <= 0 ? 1 : Math.min(1, Math.max(0, window.scrollY / max));
      progressBar.style.transform = `scaleX(${ratio})`;
    };

    const requestUpdate = rafThrottle(updateProgress);

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("load", requestUpdate);

    updateProgress();
  }

  function initParallax() {
    const parallaxItems = qsa("[data-parallax]");
    if (!parallaxItems.length) return;

    const updateParallax = () => {
      const viewportHeight = window.innerHeight || 1;

      for (const item of parallaxItems) {
        const rect = item.getBoundingClientRect();
        const centerOffset = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
        const translateY = Math.max(-18, Math.min(18, centerOffset * -24));
        item.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(1.02)`;
      }
    };

    const requestUpdate = rafThrottle(updateParallax);
    let active = false;

    const start = () => {
      if (active) return;
      active = true;

      for (const item of parallaxItems) {
        item.style.willChange = "transform";
      }

      window.addEventListener("scroll", requestUpdate, { passive: true });
      window.addEventListener("resize", requestUpdate);
      updateParallax();
    };

    const stop = () => {
      if (active) {
        window.removeEventListener("scroll", requestUpdate);
        window.removeEventListener("resize", requestUpdate);
      }

      active = false;

      for (const item of parallaxItems) {
        item.style.transform = "";
        item.style.willChange = "";
      }
    };

    subscribeToMotion((reduced) => {
      if (reduced) {
        stop();
        return;
      }

      start();
    });
  }

  fillYears();

  const navigation = initNavigation();
  initCopyEmailButtons();
  initInPageScroll(navigation.close);
  initActiveNav();
  initReveal();
  initScrollProgress();
  initParallax();
})();
