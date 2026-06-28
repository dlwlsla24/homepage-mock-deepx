/* ============================================================
   Scroll-reveal controller (furiosa.ai-style)
   Adds the .dpx-reveal hidden state to main content widgets and
   reveals them with a staggered fade+rise as they scroll into view.
   Uses IntersectionObserver; degrades gracefully (everything shown)
   when the API is missing or the user prefers reduced motion.
   ============================================================ */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var reduce = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var main = document.querySelector("main, .jupiterx-main, #content");
    if (!main) return;

    // Content units to animate. Elementor v3 leaf widgets are the natural
    // granularity — headings, images, text, buttons, etc.
    var nodes = main.querySelectorAll(".elementor-widget");

    // Fallback: if IO is unavailable or motion is reduced, do nothing —
    // the markup is fully visible by default.
    if (reduce || !("IntersectionObserver" in window) || !nodes.length) return;

    var items = [];
    nodes.forEach(function (node) {
      // Skip widgets nested inside another widget we're already animating,
      // so a block and its inner pieces don't double-animate.
      if (node.parentElement && node.parentElement.closest(".elementor-widget")) {
        return;
      }
      // Skip nodes that aren't rendered (display:none, e.g. Elementor's
      // responsive-hidden variants). They never fire IntersectionObserver,
      // and hiding them would strand them invisible if shown on resize.
      if (!node.getClientRects().length) {
        return;
      }
      items.push(node);
    });
    if (!items.length) items = Array.prototype.slice.call(nodes);

    // Assign hidden state + a per-element variant and stagger delay.
    items.forEach(function (node) {
      node.classList.add("dpx-reveal");

      // Stagger by position among siblings sharing the same parent so a
      // row of cards cascades instead of popping in all at once.
      var parent = node.parentElement;
      var idx = 0;
      if (parent) {
        var sibs = Array.prototype.filter.call(parent.children, function (c) {
          return c.classList && c.classList.contains("dpx-reveal");
        });
        idx = sibs.indexOf(node);
        if (idx < 0) idx = 0;
      }
      var delay = Math.min(idx * 0.09, 0.45);
      node.style.setProperty("--dpx-reveal-delay", delay + "s");

      // Light directional variety: images zoom, the rest rise.
      if (node.classList.contains("elementor-widget-image") ||
          node.querySelector("img")) {
        node.classList.add("dpx-reveal--zoom");
      }
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      // Trigger a touch before the element is fully in view.
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.08
    });

    items.forEach(function (node) { io.observe(node); });
  });
})();
