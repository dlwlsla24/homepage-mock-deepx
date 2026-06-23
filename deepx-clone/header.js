/* ============================================================
   DEEPX clone — accessible header controller
   ------------------------------------------------------------
   Builds a hand-authored navigation header and replaces the
   mirrored Elementor/JetMenu header (hidden via header.css).

   Responsibilities:
     • Render promo strip + main bar + mega dropdowns from data
     • Desktop: hover + full keyboard operation of mega menus
       (Enter/Space/ArrowDown open, ArrowUp/Down move, Esc close)
     • Mobile: off-canvas drawer with accordion, focus trap and
       body scroll-lock
     • Sticky scroll state (solid bg + collapse promo)
     • In-bar KO/EN toggle that drives window.DeepxI18n

   Text is authored in ENGLISH so the existing i18n dictionary
   translates the whole header automatically. This file loads
   BEFORE i18n.js and sets __DEEPX_HEADER_PRESENT__ so i18n.js
   suppresses its standalone floating language pill.
   ============================================================ */
(function () {
  "use strict";

  // Signal to i18n.js (loaded right after) not to draw its floating pill.
  window.__DEEPX_HEADER_PRESENT__ = true;

  /* ---- Navigation model -------------------------------- */
  var LOGO = "cdn/wp-content/uploads/Logo.svg";
  var CTA = { label: "Shop Now", href: "site/shop_now/index.html" };
  var PROMO = { text: "AI Chips Available for Evaluation", cta: "Apply Now", href: "#" };

  var MENU = [
    {
      label: "Products",
      href: "site/products/dx-m1/index.html",
      desc: "AI accelerators engineered for maximum efficiency.",
      children: [
        { label: "DX-M1", href: "site/products/dx-m1/index.html" },
        { label: "DX-M1M", href: "site/products/dx-m1m/index.html" },
        { label: "DX-H1 Quattro", href: "site/products/dx-h1-quattro/index.html" },
        { label: "DX-H1 V-NPU", href: "site/products/dx-h1-v-npu/index.html" },
        { label: "DX-AIPlayer", href: "site/products/dx-aiplayer/index.html" },
        { label: "DXNN® SDK", href: "site/products/dxnn-sdk/index.html" }
      ]
    },
    {
      label: "Solutions",
      href: "site/solutions/success-stories/index.html",
      desc: "Real-world deployments across industries.",
      children: [
        { label: "Edge Computing", href: "site/solutions/success-stories/edge-computing/index.html" },
        { label: "Smart Mobility", href: "site/solutions/success-stories/smart-mobility/index.html" },
        { label: "Smart Factory", href: "site/solutions/success-stories/smart-factory/index.html" },
        { label: "Smart City", href: "site/solutions/success-stories/smart-city/index.html" },
        { label: "Video Management Systems", href: "site/solutions/success-stories/video-management-systems/index.html" }
      ]
    },
    { label: "Developers", href: "https://developer.deepx.ai/", external: true },
    {
      label: "About Us",
      href: "site/company/our-story/index.html",
      desc: "Get started with DEEPX silicon.",
      children: [
        { label: "Our Story", href: "site/company/our-story/index.html" },
        { label: "Newsroom", href: "site/company/news/index.html" },
        { label: "Career", href: "https://deepx.career.greetinghr.com/ko/career", external: true },
        { label: "Contact Us", href: "site/contact-us/sales-support/index.html" }
      ]
    },
    { label: "CES On!", href: "site/ces-on/index.html" }
  ];

  var UTIL = [
    { label: "DX TechBridge Program", href: "site/buy-now/dx-techbridge-kit/index.html" },
    { label: "Sales Distributors", href: "site/sales-distributors/index.html" }
  ];

  /* ---- Small DOM helpers ------------------------------- */
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    }
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  var CARET =
    '<svg class="dpx-nav__caret" viewBox="0 0 12 12" aria-hidden="true" focusable="false">' +
    '<path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ACC_CARET =
    '<svg class="dpx-acc__caret" viewBox="0 0 12 12" aria-hidden="true" focusable="false">' +
    '<path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ============================================================
     Build markup
     ============================================================ */
  function buildHeader() {
    var header = el("header", { id: "dpx-header", role: "banner" });
    var uid = 0;

    /* Promo strip */
    header.appendChild(el("div", { class: "dpx-promo", role: "region", "aria-label": "Announcement" },
      '<span class="dpx-promo__dot" aria-hidden="true"></span>' +
      '<span class="dpx-promo__text">' + esc(PROMO.text) + "</span>" +
      '<a class="dpx-promo__cta" href="' + esc(PROMO.href) + '">' + esc(PROMO.cta) + "</a>"
    ));

    /* Main bar */
    var bar = el("div", { class: "dpx-bar" });

    bar.appendChild(el("a", { class: "dpx-logo", href: "index.html", "aria-label": "DEEPX — home" },
      '<img src="' + esc(LOGO) + '" alt="DEEPX" />'));

    /* Primary nav */
    var nav = el("nav", { class: "dpx-nav", "aria-label": "Main navigation" });
    var list = el("ul", { class: "dpx-nav__list" });

    MENU.forEach(function (item) {
      var li = el("li", { class: "dpx-nav__item" });
      if (item.children) {
        var panelId = "dpx-mega-" + (++uid);
        var btn = el("button", {
          type: "button",
          class: "dpx-nav__link",
          "aria-haspopup": "true",
          "aria-expanded": "false",
          "aria-controls": panelId
        }, esc(item.label) + CARET);
        li.appendChild(btn);

        var mega = el("div", { class: "dpx-mega", id: panelId, role: "region", "aria-label": item.label });
        var inner = el("div", { class: "dpx-mega__inner" });
        inner.appendChild(el("div", { class: "dpx-mega__lead" },
          "<h2>" + esc(item.label) + "</h2>" +
          (item.desc ? "<p>" + esc(item.desc) + "</p>" : "")));
        item.children.forEach(function (c) {
          var a = el("a", { class: "dpx-mega__link", href: c.href }, "<b>" + esc(c.label) + "</b>");
          if (c.external) { a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener noreferrer"); }
          inner.appendChild(a);
        });
        mega.appendChild(inner);
        li.appendChild(mega);
      } else {
        var a = el("a", { class: "dpx-nav__link", href: item.href }, esc(item.label));
        if (item.external) { a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener noreferrer"); }
        li.appendChild(a);
      }
      list.appendChild(li);
    });
    nav.appendChild(list);
    bar.appendChild(nav);

    /* Right-side actions */
    var actions = el("div", { class: "dpx-actions" });

    var util = el("div", { class: "dpx-util" });
    UTIL.forEach(function (u) {
      var a = el("a", { class: "dpx-util__link", href: u.href }, esc(u.label));
      if (u.external) { a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener noreferrer"); }
      util.appendChild(a);
    });
    actions.appendChild(util);

    actions.appendChild(langToggle("dpx-lang-bar"));

    actions.appendChild(el("a", { class: "dpx-cta", href: CTA.href }, esc(CTA.label)));

    var burger = el("button", {
      type: "button", class: "dpx-burger",
      "aria-label": "Open menu", "aria-expanded": "false", "aria-controls": "dpx-drawer"
    }, '<span class="dpx-burger__bars" aria-hidden="true"></span>');
    actions.appendChild(burger);

    bar.appendChild(actions);
    header.appendChild(bar);

    return { header: header, burger: burger };
  }

  function langToggle(idPrefix) {
    var wrap = el("div", { class: "dpx-lang", role: "group", "aria-label": "Language" });
    wrap.innerHTML =
      '<button class="dpx-lang__btn" type="button" data-lang="en" aria-pressed="true">EN</button>' +
      '<button class="dpx-lang__btn" type="button" data-lang="ko" aria-pressed="false" lang="ko">한국어</button>';
    return wrap;
  }

  /* ---- Mobile drawer markup ---------------------------- */
  function buildDrawer() {
    var backdrop = el("div", { class: "dpx-backdrop", hidden: "" });
    var drawer = el("aside", {
      id: "dpx-drawer", class: "dpx-drawer", role: "dialog", "aria-modal": "true",
      "aria-label": "Main menu", hidden: ""
    });

    var head = el("div", { class: "dpx-drawer__head" });
    head.appendChild(el("img", { src: LOGO, alt: "DEEPX" }));
    var close = el("button", { type: "button", class: "dpx-drawer__close", "aria-label": "Close menu" }, "×");
    head.appendChild(close);
    drawer.appendChild(head);

    var body = el("div", { class: "dpx-drawer__body" });
    var uid = 0;
    MENU.forEach(function (item) {
      var sec = el("div", { class: "dpx-acc" });
      if (item.children) {
        var pid = "dpx-acc-" + (++uid);
        var trg = el("button", {
          type: "button", class: "dpx-acc__trigger",
          "aria-expanded": "false", "aria-controls": pid
        }, "<span>" + esc(item.label) + "</span>" + ACC_CARET);
        var panel = el("div", { class: "dpx-acc__panel", id: pid });
        var pin = el("div", { class: "dpx-acc__panel-inner" });
        item.children.forEach(function (c) {
          var a = el("a", { class: "dpx-acc__sublink", href: c.href }, esc(c.label));
          if (c.external) { a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener noreferrer"); }
          pin.appendChild(a);
        });
        panel.appendChild(pin);
        sec.appendChild(trg);
        sec.appendChild(panel);
      } else {
        var top = el("a", { class: "dpx-acc__top", href: item.href }, esc(item.label));
        if (item.external) { top.setAttribute("target", "_blank"); top.setAttribute("rel", "noopener noreferrer"); }
        sec.appendChild(top);
      }
      body.appendChild(sec);
    });
    drawer.appendChild(body);

    var foot = el("div", { class: "dpx-drawer__foot" });
    foot.appendChild(el("a", { class: "dpx-cta", href: CTA.href }, esc(CTA.label)));
    var futil = el("div", { class: "dpx-drawer__util" });
    UTIL.forEach(function (u) {
      var a = el("a", { href: u.href }, esc(u.label));
      if (u.external) { a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener noreferrer"); }
      futil.appendChild(a);
    });
    foot.appendChild(futil);
    foot.appendChild(langToggle("dpx-lang-drawer"));
    drawer.appendChild(foot);

    return { backdrop: backdrop, drawer: drawer, close: close };
  }

  /* ============================================================
     Behaviour wiring
     ============================================================ */
  function init() {
    var built = buildHeader();
    var header = built.header;
    var burger = built.burger;
    var d = buildDrawer();

    // Skip link (first focusable element in the DOM).
    var skip = el("a", { class: "dpx-skip", href: "#dpx-main" }, "Skip to content");
    document.body.insertBefore(skip, document.body.firstChild);
    document.body.insertBefore(header, skip.nextSibling);
    document.body.appendChild(d.backdrop);
    document.body.appendChild(d.drawer);

    // Give the main content a skip-link target if none exists.
    var main = document.querySelector("main, #content, .jupiterx-main");
    if (main && !main.id) main.id = "dpx-main";
    else if (!main) {
      // fall back: anchor just after the header
      var anchor = el("span", { id: "dpx-main", tabindex: "-1" });
      header.insertAdjacentElement("afterend", anchor);
    }

    offsetBody(header);
    wireScrollState(header);
    wireDesktopMenus(header);
    wireDrawer(burger, d);
    wireLang(header, d.drawer);
    wireHeroScroll();

    window.addEventListener("resize", function () { offsetBody(header); }, { passive: true });
  }

  // Scroll-down cue on the intro hero video: jump past the video to content.
  function wireHeroScroll() {
    var btn = document.querySelector(".dpx-hero-video__scroll");
    var hero = document.getElementById("dpx-hero-video");
    if (!btn || !hero) return;
    btn.addEventListener("click", function () {
      var target = hero.getBoundingClientRect().bottom + window.pageYOffset
        - (parseFloat(getComputedStyle(document.body).paddingTop) || 0);
      window.scrollTo({ top: target, behavior: "smooth" });
    });
  }

  /* Push page content below the fixed header. */
  function offsetBody(header) {
    // Use the unscrolled height so content doesn't jump when the promo
    // strip collapses on scroll.
    var wasScrolled = header.classList.contains("is-scrolled");
    if (wasScrolled) header.classList.remove("is-scrolled");
    var h = header.offsetHeight;
    if (wasScrolled) header.classList.add("is-scrolled");
    document.body.style.paddingTop = h + "px";
  }

  function wireScrollState(header) {
    var onScroll = function () {
      var s = (window.pageYOffset || document.documentElement.scrollTop) > 8;
      header.classList.toggle("is-scrolled", s);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Desktop mega menus ------------------------------ */
  function wireDesktopMenus(header) {
    var items = header.querySelectorAll(".dpx-nav__item");
    var openItem = null;

    function open(li) {
      if (openItem && openItem !== li) close(openItem);
      li.classList.add("is-open");
      var btn = li.querySelector(".dpx-nav__link");
      if (btn && btn.tagName === "BUTTON") btn.setAttribute("aria-expanded", "true");
      openItem = li;
    }
    function close(li) {
      li.classList.remove("is-open");
      var btn = li.querySelector(".dpx-nav__link");
      if (btn && btn.tagName === "BUTTON") btn.setAttribute("aria-expanded", "false");
      if (openItem === li) openItem = null;
    }
    function closeAll() { if (openItem) close(openItem); }

    items.forEach(function (li) {
      var btn = li.querySelector("button.dpx-nav__link");
      if (!btn) return; // simple link, nothing to wire
      var links = li.querySelectorAll(".dpx-mega__link");

      // Pointer
      li.addEventListener("mouseenter", function () { open(li); });
      li.addEventListener("mouseleave", function () { close(li); });

      // Button keyboard / click
      btn.addEventListener("click", function () {
        if (li.classList.contains("is-open")) close(li);
        else open(li);
      });
      btn.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          open(li);
          if (links[0]) links[0].focus();
        } else if (e.key === "Escape") {
          close(li);
        }
      });

      // Roving focus within the panel
      links.forEach(function (lnk, i) {
        lnk.addEventListener("keydown", function (e) {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            (links[i + 1] || links[0]).focus();
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            (links[i - 1] || links[links.length - 1]).focus();
          } else if (e.key === "Escape") {
            e.preventDefault();
            close(li);
            btn.focus();
          } else if (e.key === "Tab" && !e.shiftKey && i === links.length - 1) {
            close(li); // let focus leave naturally to next header control
          } else if (e.key === "Home") {
            e.preventDefault(); links[0].focus();
          } else if (e.key === "End") {
            e.preventDefault(); links[links.length - 1].focus();
          }
        });
      });

      // Close when focus leaves the whole item.
      li.addEventListener("focusout", function (e) {
        if (!li.contains(e.relatedTarget)) close(li);
      });
    });

    // Click outside / global Esc.
    document.addEventListener("click", function (e) {
      if (openItem && !openItem.contains(e.target)) closeAll();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll();
    });
  }

  /* ---- Mobile drawer ----------------------------------- */
  function wireDrawer(burger, d) {
    var drawer = d.drawer, backdrop = d.backdrop, closeBtn = d.close;
    var lastFocus = null;

    function focusables() {
      return Array.prototype.filter.call(
        drawer.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
        function (n) { return n.offsetParent !== null || n === document.activeElement; }
      );
    }

    function openDrawer() {
      lastFocus = document.activeElement;
      backdrop.hidden = false; drawer.hidden = false;
      // next frame so the transition runs
      requestAnimationFrame(function () {
        backdrop.classList.add("is-open");
        drawer.classList.add("is-open");
      });
      burger.setAttribute("aria-expanded", "true");
      burger.setAttribute("aria-label", "Close menu");
      document.body.classList.add("dpx-no-scroll");
      var f = focusables();
      if (f[0]) f[0].focus();
    }
    function closeDrawer() {
      backdrop.classList.remove("is-open");
      drawer.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Open menu");
      document.body.classList.remove("dpx-no-scroll");
      var done = function () {
        drawer.hidden = true; backdrop.hidden = true;
        drawer.removeEventListener("transitionend", done);
      };
      drawer.addEventListener("transitionend", done);
      // Fallback in case transitionend doesn't fire (reduced motion).
      setTimeout(function () { drawer.hidden = true; backdrop.hidden = true; }, 400);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    burger.addEventListener("click", function () {
      if (drawer.classList.contains("is-open")) closeDrawer(); else openDrawer();
    });
    closeBtn.addEventListener("click", closeDrawer);
    backdrop.addEventListener("click", closeDrawer);

    // Focus trap + Esc.
    drawer.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); closeDrawer(); return; }
      if (e.key !== "Tab") return;
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // Accordion sections.
    var triggers = drawer.querySelectorAll(".dpx-acc__trigger");
    triggers.forEach(function (t) {
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      t.addEventListener("click", function () {
        var open = t.getAttribute("aria-expanded") === "true";
        t.setAttribute("aria-expanded", String(!open));
        panel.style.maxHeight = open ? "0px" : panel.scrollHeight + "px";
      });
    });

    // Close the drawer after tapping any navigation link inside it.
    drawer.querySelectorAll('a[href]').forEach(function (a) {
      a.addEventListener("click", function () {
        // External links open a new tab; still close the menu.
        closeDrawer();
      });
    });
  }

  /* ---- Language toggles -------------------------------- */
  function wireLang(header, drawer) {
    var btns = [].concat(
      Array.prototype.slice.call(header.querySelectorAll(".dpx-lang__btn")),
      Array.prototype.slice.call(drawer.querySelectorAll(".dpx-lang__btn"))
    );

    function reflect(lang) {
      btns.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
      });
    }

    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var lang = b.getAttribute("data-lang");
        if (window.DeepxI18n && window.DeepxI18n.set) window.DeepxI18n.set(lang);
        reflect(lang); // optimistic; event will confirm
      });
    });

    // Stay in sync with i18n (initial announce + later changes).
    document.addEventListener("deepx:langchange", function (e) {
      reflect(e.detail && e.detail.lang ? e.detail.lang : "en");
    });

    // If i18n already initialised before this listener attached.
    if (window.DeepxI18n && window.DeepxI18n.get) reflect(window.DeepxI18n.get());
    else {
      try { reflect(localStorage.getItem("deepx_lang") === "ko" ? "ko" : "en"); } catch (e) {}
    }
  }

  // This script is injected right after <body>, so document.body already
  // exists even while the rest of the page is still streaming in. Build the
  // header immediately rather than waiting for DOMContentLoaded — that's what
  // keeps it from "popping in" late once the whole page has parsed.
  if (document.body) init();
  else document.addEventListener("DOMContentLoaded", init);
})();
