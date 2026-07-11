const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const cursorLight = document.querySelector(".cursor-light");
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
    if (window.matchMedia("(hover: none)").matches && !card.classList.contains("is-flipped")) {
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
  const counter = player.querySelector(".player-counter");
  const previous = player.querySelector('[data-action="prev"]');
  const next = player.querySelector('[data-action="next"]');
  let active = 0;

  function render(index) {
    const previousActive = active;
    active = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === active);
      slide.classList.toggle("is-leaving", slideIndex === previousActive && previousActive !== active);
      if (slideIndex !== previousActive) slide.classList.remove("is-leaving");
    });

    window.setTimeout(() => {
      slides.forEach((slide) => slide.classList.remove("is-leaving"));
    }, 680);

    if (counter) counter.textContent = `${String(active + 1).padStart(2, "0")} / ${slides.length}`;
  }

  previous?.addEventListener("click", () => render(active - 1));
  next?.addEventListener("click", () => render(active + 1));
  slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === 0));
  if (counter) counter.textContent = `${String(active + 1).padStart(2, "0")} / ${slides.length}`;
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








