/* ============================================================
   DEEPX event popup (dark, sleek seminar announcement)
   ------------------------------------------------------------
   - Appears shortly after load with a smooth entrance.
   - "Don't show again"  -> persisted in localStorage (never again).
   - "Close" / X / ESC / backdrop -> just closes; it reappears on the
     next page load (no per-session suppression).
   - Accessible: role=dialog, aria-modal, focus trap, focus restore,
     body scroll lock. Text is translated by i18n.js automatically.
   ============================================================ */
(function () {
  "use strict";

  var DISMISS_KEY = "dpxEventPopup:v1";        // permanent (localStorage)
  var SHOW_DELAY = 1100;

  function ls(get, val) {
    try {
      if (get) return localStorage.getItem(DISMISS_KEY);
      localStorage.setItem(DISMISS_KEY, val);
    } catch (e) {}
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  // SVG helpers (stroke icons).
  function svg(path) {
    return '<svg class="dpx-pop__meta-ico" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
  }
  var ICO_DATE  = svg('<rect x="3" y="4" width="18" height="18" rx="2"/>' +
                      '<path d="M16 2v4M8 2v4M3 10h18"/>');
  var ICO_PIN   = svg('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>' +
                      '<circle cx="12" cy="10" r="3"/>');
  var ICO_TICK  = svg('<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>' +
                      '<path d="m9 11 3 3L22 4"/>');

  function build() {
    var backdrop = document.createElement("div");
    backdrop.className = "dpx-pop-backdrop";
    backdrop.id = "dpx-event-popup";

    backdrop.innerHTML =
      '<div class="dpx-pop" role="dialog" aria-modal="true" aria-labelledby="dpx-pop-title">' +
        '<div class="dpx-pop__beam"></div>' +
        '<div class="dpx-pop__glow"></div>' +
        '<button type="button" class="dpx-pop__x" data-act="session" aria-label="Close">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" ' +
          'stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
          '<path d="M18 6 6 18M6 6l12 12"/></svg>' +
        '</button>' +
        '<div class="dpx-pop__body">' +
          '<span class="dpx-pop__badge">DEEPX EVENT</span>' +
          '<h2 class="dpx-pop__title" id="dpx-pop-title">DEEPX <em>Tech Seminar</em> 2026</h2>' +
          '<p class="dpx-pop__lead">Discover how the DX-M1 NPU delivers GPU-level ' +
            'on-device AI — with live demos and a Q&amp;A session with our engineers.</p>' +
          '<div class="dpx-pop__meta">' +
            '<div class="dpx-pop__meta-row">' + ICO_DATE +
              '<b>Date</b><span>Thu, Jul 16, 2026 · 2:00 PM KST</span></div>' +
            '<div class="dpx-pop__meta-row">' + ICO_PIN +
              '<b>Venue</b><span>COEX Grand Ballroom, Seoul</span></div>' +
            '<div class="dpx-pop__meta-row">' + ICO_TICK +
              '<b>Entry</b><span>Free · Pre-registration required</span></div>' +
          '</div>' +
          '<a class="dpx-pop__cta" href="#" data-act="cta">Reserve Your Seat' +
            '<span class="dpx-pop__cta-arrow" aria-hidden="true">→</span></a>' +
        '</div>' +
        '<div class="dpx-pop__foot">' +
          '<button type="button" class="dpx-pop__foot-btn" data-act="never">Don\'t show again</button>' +
          '<button type="button" class="dpx-pop__foot-btn dpx-pop__foot-btn--close" data-act="session">Close</button>' +
        '</div>' +
      '</div>';

    return backdrop;
  }

  function init() {
    if (ls(true) === "1") return;  // permanently dismissed
    if (document.getElementById("dpx-event-popup")) return;

    var backdrop = build();
    document.body.appendChild(backdrop);
    var card = backdrop.querySelector(".dpx-pop");
    var lastFocus = null;

    function focusables() {
      return Array.prototype.slice.call(
        card.querySelectorAll('a[href], button:not([disabled])'));
    }

    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); close("session"); return; }
      if (e.key !== "Tab") return;
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }

    function open() {
      lastFocus = document.activeElement;
      document.body.classList.add("dpx-pop-lock");
      // Force reflow so the transition runs from the hidden state.
      void backdrop.offsetWidth;
      backdrop.classList.add("is-open");
      document.addEventListener("keydown", onKey, true);
      var f = focusables();
      (f[0] || card).focus();
    }

    function close(kind) {
      if (kind === "never") ls(false, "1");  // only this persists across loads
      backdrop.classList.remove("is-open");
      document.removeEventListener("keydown", onKey, true);
      document.body.classList.remove("dpx-pop-lock");
      if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
      var done = function () {
        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        backdrop.removeEventListener("transitionend", done);
      };
      backdrop.addEventListener("transitionend", done);
      setTimeout(done, 600);  // fallback if transitionend doesn't fire
    }

    // Click handling: backdrop (outside card) + action buttons.
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) { close("session"); return; }
      var act = e.target.closest && e.target.closest("[data-act]");
      if (!act) return;
      var kind = act.getAttribute("data-act");
      if (kind === "cta") {
        e.preventDefault();
        // Mock registration: in a real build this would route to the form.
        close("session");
      } else {
        close(kind);
      }
    });

    setTimeout(open, SHOW_DELAY);
  }

  ready(init);
})();
