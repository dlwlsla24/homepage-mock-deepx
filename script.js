const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = window.matchMedia("(pointer: fine)").matches;

// ---- Sticky nav ----
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > window.innerHeight * 0.75);

// ---- Scroll progress bar ----
const progress = document.getElementById("progress");
const updateProgress = () => {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
};
const onScrollAll = () => { onScroll(); updateProgress(); };
onScrollAll();
window.addEventListener("scroll", onScrollAll, { passive: true });

// ---- Scroll reveal ----
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// Stagger inside grids
document.querySelectorAll(".grid, .impact__grid, .products__grid").forEach((grid) => {
  [...grid.children].forEach((child, i) => {
    child.style.transitionDelay = `${Math.min(i * 70, 420)}ms`;
  });
});

// ---- Animated counters ----
const animateCount = (el) => {
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || "0", 10);
  const suffix = el.dataset.suffix || "";
  const duration = 1500;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = (target * eased).toFixed(decimals) + suffix;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target.toFixed(decimals) + suffix;
  };
  requestAnimationFrame(tick);
};
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll(".stat__num").forEach((el) => countObserver.observe(el));

// ---- Story filtering ----
const filters = document.querySelectorAll(".filter");
const cards = document.querySelectorAll(".card");
filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    filters.forEach((f) => f.classList.remove("is-active"));
    btn.classList.add("is-active");
    const cat = btn.dataset.filter;
    cards.forEach((card) => {
      card.classList.toggle("is-hidden", !(cat === "all" || card.dataset.cat === cat));
    });
  });
});

// ---- Spotlight follow on cards ----
if (fine && !reduced) {
  document.querySelectorAll(".spotlight").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  // ---- Subtle 3D tilt ----
  document.querySelectorAll(".tilt").forEach((el) => {
    el.style.transformStyle = "preserve-3d";
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(800px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-5px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });
}
