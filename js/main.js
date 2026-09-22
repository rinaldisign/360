/* =========================================================
   Interactive Virtual Tour — main.js
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Data proyek portofolio ---------- */
  /* GANTI url dan thumb dengan link/gambar tur 360 Anda sendiri jika berbeda.
     "thumb" = gambar preview (OG image) proyek, dipakai di grid supaya ringan.
     Tur 360 langsung (iframe) hanya dimuat di hero saat kartu diklik. */
  var PROJECTS = [
    { id: "bellevue", name: "Bellevue Residences", url: "https://bellevue.vt.rinaldisign.com/", thumb: "https://bellevue.vt.rinaldisign.com/assets/social-share.jpg", cat: "cat_residential", loc: null },
    { id: "fhouse",   name: "F-House",              url: "https://fhouse.vt.rinaldisign.com/",   thumb: "https://fhouse.vt.rinaldisign.com/assets/social-share.jpg",   cat: "cat_private_house", loc: null },
    { id: "cbar",     name: "Coboy Bar",             url: "https://cbar.vt.rinaldisign.com/",     thumb: "https://cbar.vt.rinaldisign.com/assets/social-share.jpg",     cat: "cat_bar", loc: "loc_mexico" },
    { id: "lab",      name: "Labougainvillea",       url: "https://lab.vt.rinaldisign.com/",      thumb: "https://lab.vt.rinaldisign.com/assets/social-share.jpg",      cat: "cat_resort", loc: "loc_bahamas" },
    { id: "luma",     name: "Luma Hotel",            url: "https://luma.vt.rinaldisign.com/",     thumb: "https://luma.vt.rinaldisign.com/assets/social-share.jpg",     cat: "cat_hotel", loc: "loc_sf" }
  ];

  var currentLang = "id";
  var grid = document.getElementById("portfolioGrid");
  var heroFrame = document.getElementById("heroFrame");
  var heroEmbed = document.getElementById("heroEmbed");
  var heroKicker = document.getElementById("heroKicker");
  var heroOpenFull = document.getElementById("heroOpenFull");
  var heroThumb = document.getElementById("heroThumb");
  var heroEmbedMobile = document.getElementById("heroEmbedMobile");
  var mobileQuery = window.matchMedia("(max-width: 760px)");
  var currentProject = null;

  function isMobile() { return mobileQuery.matches; }

  /* ---------- Render kartu portofolio ---------- */
  function metaLine(p) {
    var cat = (I18N[currentLang] && I18N[currentLang][p.cat]) || "";
    var loc = p.loc ? (I18N[currentLang] && I18N[currentLang][p.loc]) : null;
    return loc ? cat + " · " + loc : cat;
  }

  function renderGrid() {
    grid.innerHTML = "";
    PROJECTS.forEach(function (p, i) {
      var card = document.createElement("div");
      card.className = "port-card reveal-card";
      card.setAttribute("data-project", p.id);

      card.innerHTML =
        '<div class="port-frame">' +
          '<div class="port-badge">360°</div>' +
          '<a class="port-full" href="' + p.url + '" target="_blank" rel="noopener" aria-label="Open full tour">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4h6v6M20 4l-8 8M10 4H4v16h16v-6"/></svg>' +
          '</a>' +
          '<img src="' + p.thumb + '" alt="' + p.name + '" loading="lazy" decoding="async" ' +
            'onerror="this.onerror=null; var alt=this.src.replace(/social-share\\.jpg$/, \'floorplan.jpg\'); if (this.src !== alt) { this.src = alt; } else { this.closest(\'.port-frame\').classList.add(\'no-thumb\'); }">' +
          '<div class="port-play" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
          '</div>' +
        '</div>' +
        '<div class="port-body">' +
          '<div class="port-name">' + p.name + '</div>' +
          '<div class="port-meta" data-meta>' + metaLine(p) + '</div>' +
        '</div>';

      card.addEventListener("click", function (e) {
        if (e.target.closest(".port-full")) return; // biarkan link buka tab baru
        setHero(p);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      grid.appendChild(card);
    });
    observeCards();
  }

  function updateMetaLines() {
    var lines = grid.querySelectorAll("[data-meta]");
    lines.forEach(function (el, i) {
      el.textContent = metaLine(PROJECTS[i]);
    });
  }

  /* ---------- Hero swap ---------- */
  function setHero(p) {
    currentProject = p;
    heroEmbed.classList.add("switching");
    setTimeout(function () {
      if (!isMobile()) {
        heroFrame.src = p.url;
        heroFrame.title = p.name;
      }
      heroThumb.src = p.thumb;
      heroThumb.alt = p.name;
      heroEmbedMobile.href = p.url;
      heroKicker.textContent = p.name;
      heroOpenFull.href = p.url;
      heroEmbed.classList.remove("switching");
    }, 260);
  }

  /* ---------- Muat iframe hero jika berpindah dari mobile ke desktop ---------- */
  mobileQuery.addEventListener("change", function (e) {
    if (!e.matches && currentProject && !heroFrame.src) {
      heroFrame.src = currentProject.url;
      heroFrame.title = currentProject.name;
    }
  });

  /* ---------- Reveal kartu portofolio (satu momen animasi) ---------- */
  function observeCards() {
    var cards = grid.querySelectorAll(".reveal-card");
    if (!("IntersectionObserver" in window)) {
      cards.forEach(function (c) { c.classList.add("in-view"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var idx = Array.prototype.indexOf.call(cards, entry.target);
          setTimeout(function () { entry.target.classList.add("in-view"); }, Math.max(idx, 0) * 90);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -40px 0px" });
    cards.forEach(function (c) { io.observe(c); });
  }

  /* ---------- Bahasa ---------- */
  function applyLang(lang) {
    var dict = I18N[lang];
    if (!dict) return;
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-lang", lang);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key] != null) el.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (dict[key] != null) el.setAttribute("aria-label", dict[key]);
    });

    var titleEl = document.getElementById("pageTitle");
    var descEl = document.getElementById("pageDesc");
    if (titleEl && dict.meta_title) titleEl.textContent = dict.meta_title;
    if (descEl && dict.meta_desc) descEl.setAttribute("content", dict.meta_desc);

    document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang-btn") === lang);
    });

    updateMetaLines();

    try { localStorage.setItem("rinaldi360_lang", lang); } catch (e) {}
  }

  function detectInitialLang() {
    try {
      var saved = localStorage.getItem("rinaldi360_lang");
      if (saved && I18N[saved]) return saved;
    } catch (e) {}
    var nav = (navigator.language || "id").toLowerCase();
    if (nav.indexOf("ja") === 0) return "ja";
    if (nav.indexOf("zh") === 0) return "zh";
    if (nav.indexOf("en") === 0) return "en";
    return "id";
  }

  document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLang(btn.getAttribute("data-lang-btn"));
    });
  });

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById("siteHeader");
  window.addEventListener("scroll", function () {
    header.classList.toggle("scrolled", window.scrollY > 8);
  }, { passive: true });

  /* ---------- Menu mobile ---------- */
  var menuToggle = document.getElementById("menuToggle");
  var mainNav = document.getElementById("mainNav");
  menuToggle.addEventListener("click", function () {
    var open = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  mainNav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Init ---------- */
  document.getElementById("footerYear").textContent = "© " + new Date().getFullYear();

  renderGrid();
  currentProject = PROJECTS[0];
  if (!isMobile()) {
    heroFrame.src = PROJECTS[0].url; // muat langsung tanpa fade di load awal (desktop saja)
    heroFrame.title = PROJECTS[0].name;
  }
  heroThumb.src = PROJECTS[0].thumb;
  heroThumb.alt = PROJECTS[0].name;
  heroEmbedMobile.href = PROJECTS[0].url;
  heroKicker.textContent = PROJECTS[0].name;
  heroOpenFull.href = PROJECTS[0].url;

  applyLang(detectInitialLang());
})();
