const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const cursorLight = document.querySelector(".cursor-light");
const compactViewport = window.matchMedia("(max-width: 680px)");
const flipCards = Array.from(document.querySelectorAll(".flip-card"));

window.addEventListener("pointermove", (event) => {
  if (cursorLight) {
    cursorLight.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
  }
});

flipCards.forEach((card) => {
  const frontLink = card.querySelector(".flip-front");
  const backLink = card.querySelector(".flip-back");

  card.addEventListener("pointerenter", () => {
    if (window.matchMedia("(hover: hover)").matches) card.classList.add("is-flipped");
  });
  card.addEventListener("pointerleave", () => {
    if (window.matchMedia("(hover: hover)").matches) card.classList.remove("is-flipped");
  });

  frontLink?.addEventListener("click", (event) => {
    if (window.matchMedia("(hover: none)").matches && !compactViewport.matches && !card.classList.contains("is-flipped")) {
      event.preventDefault();
      flipCards.forEach((item) => item.classList.toggle("is-flipped", item === card));
    }
  });
  backLink?.addEventListener("click", () => {
    flipCards.forEach((item) => item.classList.remove("is-flipped"));
  });
});

const kineticTrack = document.querySelector(".kinetic-track");
let marqueeX = 0;
let marqueeVelocity = 0;
let marqueeFrame = null;

function animateKineticMarquee() {
  if (!kineticTrack) return;
  marqueeX += marqueeVelocity;
  marqueeVelocity *= 0.9;

  const halfWidth = kineticTrack.scrollWidth / 2;
  if (halfWidth > 0) {
    if (marqueeX < -halfWidth) marqueeX += halfWidth;
    if (marqueeX > 0) marqueeX -= halfWidth;
  }

  kineticTrack.style.setProperty("--marquee-x", `${marqueeX}px`);

  if (Math.abs(marqueeVelocity) > 0.08) {
    marqueeFrame = window.requestAnimationFrame(animateKineticMarquee);
  } else {
    marqueeVelocity = 0;
    marqueeFrame = null;
  }
}

if (kineticTrack) {
  const originalItems = Array.from(kineticTrack.children);
  originalItems.forEach((item) => kineticTrack.appendChild(item.cloneNode(true)));

  window.addEventListener(
    "wheel",
    (event) => {
      if (prefersReducedMotion) return;
      const direction = event.deltaY || event.deltaX;
      marqueeVelocity += Math.max(-34, Math.min(34, -direction * 0.075));
      if (!marqueeFrame) marqueeFrame = window.requestAnimationFrame(animateKineticMarquee);
    },
    { passive: true }
  );
}


const revealTargets = [
  ".kinetic-marquee",
  ".scroll-statement .section-kicker",
  ".statement-note",
  ".case-block",
  ".case-visual",
  ".case-content",
  ".detail-grid > div",
  ".portfolio-player",
  ".contact-section .section-kicker",
  ".contact-section h2",
  ".contact-row a"
];

const revealItems = Array.from(document.querySelectorAll(revealTargets.join(",")));
revealItems.forEach((item, index) => {
  item.classList.add("scroll-reveal");
  if (item.matches(".case-visual, .portfolio-player")) item.classList.add("reveal-image");
  if (item.matches(".case-content, .statement-note, .contact-section h2")) item.classList.add("reveal-text-block");
  item.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 90}ms`);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      } else {
        entry.target.classList.remove("is-visible");
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -6%" }
);
revealItems.forEach((item) => revealObserver.observe(item));

const lineTimers = new WeakMap();
const lineObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const lines = Array.from(entry.target.querySelectorAll("span"));
      const timers = lineTimers.get(entry.target) || [];
      timers.forEach((timer) => window.clearTimeout(timer));
      lineTimers.set(entry.target, []);

      if (entry.isIntersecting) {
        const nextTimers = lines.map((line, index) => window.setTimeout(() => line.classList.add("is-visible"), index * 115));
        lineTimers.set(entry.target, nextTimers);
      } else {
        lines.forEach((line) => line.classList.remove("is-visible"));
      }
    });
  },
  { threshold: 0.24 }
);
document.querySelectorAll(".statement-lines").forEach((block) => lineObserver.observe(block));
const detailButtons = Array.from(document.querySelectorAll(".details-toggle"));

function setDetailState(button, open, shouldScroll = false) {
  const details = document.getElementById(button.getAttribute("aria-controls"));
  if (!details) return;

  const isOpen = button.getAttribute("aria-expanded") === "true";
  if (isOpen === open && open) {
    if (shouldScroll) details.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    return;
  }

  button.setAttribute("aria-expanded", String(open));
  button.textContent = open ? "收起站内案例" : "进入站内案例";

  if (prefersReducedMotion) {
    details.hidden = !open;
    if (open && shouldScroll) details.scrollIntoView({ behavior: "auto", block: "start" });
    return;
  }

  if (!open) {
    const animation = details.animate(
      [
        { opacity: 1, transform: "translateY(0)", height: `${details.scrollHeight}px` },
        { opacity: 0, transform: "translateY(18px)", height: "0px" }
      ],
      { duration: 520, easing: "cubic-bezier(.19, 1, .22, 1)" }
    );
    animation.onfinish = () => {
      details.hidden = true;
    };
    return;
  }

  details.hidden = false;
  details.animate(
    [
      { opacity: 0, transform: "translateY(28px)", filter: "blur(8px)", height: "0px" },
      { opacity: 1, transform: "translateY(0)", filter: "blur(0)", height: `${details.scrollHeight}px` }
    ],
    { duration: 900, easing: "cubic-bezier(.19, 1, .22, 1)" }
  );

  details.querySelectorAll(".detail-grid > div, .portfolio-player, .secondary-link").forEach((item, index) => {
    item.animate(
      [
        { opacity: 0, transform: "translateY(24px)" },
        { opacity: 1, transform: "translateY(0)" }
      ],
      { duration: 780, delay: 120 + index * 90, easing: "cubic-bezier(.19, 1, .22, 1)", fill: "both" }
    );
  });

  if (shouldScroll) {
    window.setTimeout(() => details.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  }
}

detailButtons.forEach((button) => {
  button.textContent = "进入站内案例";
  button.addEventListener("click", () => {
    const isOpen = button.getAttribute("aria-expanded") === "true";
    setDetailState(button, !isOpen, false);
  });
});

document.querySelectorAll(".detail-jump").forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("data-controls");
    const button = detailButtons.find((item) => item.getAttribute("aria-controls") === targetId);
    if (!button) return;
    event.preventDefault();
    setDetailState(button, true, true);
  });
});
function setupPortfolioPlayer(player) {
  const slides = Array.from(player.querySelectorAll(".player-slide"));
  const stage = player.querySelector(".player-stage");
  const counter = player.querySelector(".player-counter");
  const previous = player.querySelector('[data-action="prev"]');
  const next = player.querySelector('[data-action="next"]');
  let active = 0;
  let loadRequest = 0;

  if (!slides.length || !stage) return;

  const status = document.createElement("p");
  status.className = "player-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  stage.appendChild(status);

  slides.forEach((slide, slideIndex) => {
    slide.decoding = "async";
    slide.setAttribute("aria-hidden", String(slideIndex !== 0));

    if (slideIndex !== 0) {
      const source = slide.getAttribute("src");
      if (source) {
        slide.dataset.src = source;
        slide.removeAttribute("src");
      }
      slide.removeAttribute("loading");
    } else {
      slide.loading = "eager";
      slide.fetchPriority = "high";
    }
  });

  function setBusy(busy, message = "") {
    player.classList.toggle("is-loading", busy);
    previous?.toggleAttribute("disabled", busy);
    next?.toggleAttribute("disabled", busy);
    status.textContent = message;
  }

  function loadSlide(slide, priority = "high") {
    const source = slide.dataset.src || slide.getAttribute("src");
    if (!source) return Promise.reject(new Error("missing image source"));
    if (slide.complete && slide.naturalWidth > 0) return Promise.resolve(slide);

    if (slide.complete && slide.naturalWidth === 0 && slide.getAttribute("src")) {
      slide.removeAttribute("src");
    }

    slide.loading = "eager";
    slide.fetchPriority = priority;

    return new Promise((resolve, reject) => {
      const cleanup = () => {
        slide.removeEventListener("load", onLoad);
        slide.removeEventListener("error", onError);
      };
      const onLoad = () => {
        cleanup();
        resolve(slide);
      };
      const onError = () => {
        cleanup();
        reject(new Error(`failed to load ${source}`));
      };

      slide.addEventListener("load", onLoad, { once: true });
      slide.addEventListener("error", onError, { once: true });
      if (slide.getAttribute("src") !== source) slide.src = source;
    });
  }

  function preload(index) {
    const target = slides[(index + slides.length) % slides.length];
    if (!target || (target.complete && target.naturalWidth > 0)) return;
    loadSlide(target, "low").catch(() => {});
  }

  async function render(index) {
    const targetIndex = (index + slides.length) % slides.length;
    if (targetIndex === active) return;

    const target = slides[targetIndex];
    const previousActive = active;
    const request = ++loadRequest;
    player.classList.remove("has-error");
    setBusy(true, `正在载入 ${String(targetIndex + 1).padStart(2, "0")} / ${slides.length}`);

    try {
      await loadSlide(target);
      if (target.decode) await target.decode().catch(() => {});
      if (request !== loadRequest) return;
    } catch (error) {
      if (request !== loadRequest) return;
      player.classList.add("has-error");
      setBusy(false, "图片暂时未载入，请点击翻页按钮重试");
      return;
    }

    active = targetIndex;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === active);
      slide.classList.toggle("is-leaving", slideIndex === previousActive && previousActive !== active);
      slide.setAttribute("aria-hidden", String(slideIndex !== active));
      if (slideIndex !== previousActive) slide.classList.remove("is-leaving");
    });

    window.setTimeout(() => {
      slides.forEach((slide) => slide.classList.remove("is-leaving"));
    }, 680);

    if (counter) counter.textContent = `${String(active + 1).padStart(2, "0")} / ${slides.length}`;
    setBusy(false);
    window.setTimeout(() => preload(active + 1), 180);
  }

  previous?.addEventListener("click", () => render(active - 1));
  next?.addEventListener("click", () => render(active + 1));
  slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === 0));
  if (counter) counter.textContent = `${String(active + 1).padStart(2, "0")} / ${slides.length}`;
  loadSlide(slides[0]).then(() => preload(1)).catch(() => {
    player.classList.add("has-error");
    status.textContent = "首页图片暂时未载入，请刷新后重试";
  });
}

document.querySelectorAll(".portfolio-player").forEach(setupPortfolioPlayer);


const backToTopButton = document.querySelector(".back-to-top");
if (backToTopButton) {
  const toggleBackToTop = () => {
    backToTopButton.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.55);
  };
  window.addEventListener("scroll", toggleBackToTop, { passive: true });
  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
  toggleBackToTop();
}








