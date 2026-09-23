/* =========================================================
   Interactive Virtual Tour — main.js
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Data proyek portofolio ---------- */
  /* GANTI url dan thumb dengan link/gambar tur 360 Anda sendiri jika berbeda.
     "thumb" = gambar preview (OG image) proyek, dipakai di slider supaya ringan.
     Tur 360 langsung (iframe) hanya dimuat di hero saat slide diklik. */
  var PROJECTS = [
    { id: "bellevue", name: "Bellevue Residences 3D", url: "https://bellevue.vt.rinaldisign.com/", thumb: "https://bellevue.vt.rinaldisign.com/assets/social-share.jpg", cat: "cat_residential", loc: "loc_austria" },
    { id: "miao", name: "Miniami Aoyama Apartments 3D", url: "https://aoyama.vt.rinaldisign.com/", thumb: "https://aoyama.vt.rinaldisign.com/assets/social-share.jpg", cat: "cat_residential", loc: "loc_tokyo" },
    { id: "fhouse",   name: "F-House 3D",              url: "https://fhouse.vt.rinaldisign.com/",   thumb: "https://fhouse.vt.rinaldisign.com/assets/social-share.jpg",   cat: "cat_private_house", loc: "loc_indonesia" },
    { id: "cbar",     name: "Coboy Bar",             url: "https://cbar.vt.rinaldisign.com/",     thumb: "https://cbar.vt.rinaldisign.com/assets/social-share.jpg",     cat: "cat_bar", loc: "loc_mexico" },
    { id: "lab",      name: "Labougainvillea",       url: "https://lab.vt.rinaldisign.com/",      thumb: "https://lab.vt.rinaldisign.com/assets/social-share.jpg",      cat: "cat_resort", loc: "loc_bahamas" },
    { id: "luma",     name: "Luma Hotel",            url: "https://luma.vt.rinaldisign.com/",     thumb: "https://luma.vt.rinaldisign.com/assets/social-share.jpg",     cat: "cat_hotel", loc: "loc_sf" }
  ];

  var currentLang = "id";
  var slider = document.getElementById("portfolioSlider");
  var track = document.getElementById("portfolioTrack");
  var btnPrev = document.getElementById("portPrev");
  var btnNext = document.getElementById("portNext");
  var heroFrame = document.getElementById("heroFrame");
  var heroEmbed = document.getElementById("heroEmbed");
  var heroKicker = document.getElementById("heroKicker");
  var heroOpenFull = document.getElementById("heroOpenFull");
  var heroThumb = document.getElementById("heroThumb");
  var heroEmbedMobile = document.getElementById("heroEmbedMobile");
  var mobileQuery = window.matchMedia("(max-width: 760px)");
  var currentProject = null;

  function isMobile() { return mobileQuery.matches; }

  /* ---------- Kartu / slide portofolio ---------- */
  function metaLine(p) {
    var cat = (I18N[currentLang] && I18N[currentLang][p.cat]) || "";
    var loc = p.loc ? (I18N[currentLang] && I18N[currentLang][p.loc]) : null;
    return loc ? cat + " · " + loc : cat;
  }

  function makeSlideEl(p, idx, isClone) {
    var el = document.createElement("div");
    el.className = "port-slide";
    el.setAttribute("data-idx", String(idx));
    if (isClone) el.setAttribute("aria-hidden", "true");

    el.innerHTML =
      '<img src="' + p.thumb + '" alt="' + p.name + '" loading="lazy" decoding="async" draggable="false" ' +
        'onerror="this.onerror=null; var alt=this.src.replace(/social-share\\.jpg$/, \'floorplan.jpg\'); if (this.src !== alt) { this.src = alt; } else { this.closest(\'.port-slide\').classList.add(\'no-thumb\'); }">' +
      '<div class="port-slide-scrim" aria-hidden="true"></div>' +
      '<div class="port-slide-360" aria-hidden="true"><img src="assets/icon-360.png" alt="" draggable="false"></div>' +
      '<a class="port-slide-full" href="' + p.url + '" target="_blank" rel="noopener" aria-label="Open full tour" tabindex="' + (isClone ? "-1" : "0") + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4h6v6M20 4l-8 8M10 4H4v16h16v-6"/></svg>' +
      '</a>' +
      '<div class="port-slide-caption">' +
        '<div class="port-slide-title">' + p.name + '</div>' +
        '<div class="port-slide-meta" data-meta>' + metaLine(p) + '</div>' +
      '</div>';

    return el;
  }

  var slideEls = [];

  function buildSlides() {
    track.innerHTML = "";
    var frag = document.createDocumentFragment();
    var n = PROJECTS.length;
    frag.appendChild(makeSlideEl(PROJECTS[n - 1], n - 1, true));   // clone terakhir di depan
    PROJECTS.forEach(function (p, i) { frag.appendChild(makeSlideEl(p, i, false)); });
    frag.appendChild(makeSlideEl(PROJECTS[0], 0, true));           // clone pertama di belakang
    track.appendChild(frag);
    slideEls = Array.prototype.slice.call(track.querySelectorAll(".port-slide"));
  }

  function updateSlideMeta() {
    var lines = track.querySelectorAll("[data-meta]");
    lines.forEach(function (el) {
      var slideEl = el.closest(".port-slide");
      var idx = parseInt(slideEl.getAttribute("data-idx"), 10);
      el.textContent = metaLine(PROJECTS[idx]);
    });
  }

  /* ---------- Slider (drag / next-prev / infinite loop) ---------- */
  var slideWidthPx = 0;
  var pos = 1;              // posisi di array yang sudah termasuk clone: 0 = clone-akhir, 1..n = asli, n+1 = clone-awal
  var isAnimating = false;
  var isDragging = false;
  var dragMoved = false;
  var dragStartX = 0;
  var dragStartPx = 0;
  var suppressNextClick = false;

  function basePx() { return -(pos * slideWidthPx); }

  function setTransformRaw(px) {
    track.style.transform = "translateX(" + px + "px)";
  }

  function layout() {
    var w = slider.clientWidth;
    slideWidthPx = w;
    slideEls.forEach(function (el) { el.style.width = w + "px"; });
    track.style.width = (slideEls.length * w) + "px";
    track.style.transition = "none";
    setTransformRaw(basePx());
    track.offsetHeight; // force reflow
    track.style.transition = "";
  }

  function goTo(newPos) {
    if (isAnimating) return;
    isAnimating = true;
    track.style.transition = "";
    pos = newPos;
    setTransformRaw(basePx());
  }

  function snapInstant(newPos) {
    pos = newPos;
    track.style.transition = "none";
    setTransformRaw(basePx());
    track.offsetHeight; // force reflow
    track.style.transition = "";
  }

  function next() { goTo(pos + 1); }
  function prev() { goTo(pos - 1); }

  track.addEventListener("transitionend", function (e) {
    if (e.target !== track || e.propertyName !== "transform") return;
    isAnimating = false;
    var total = slideEls.length;
    if (pos === 0) { snapInstant(total - 2); }        // sudah sampai clone-akhir di depan -> lompat diam-diam ke asli terakhir
    else if (pos === total - 1) { snapInstant(1); }    // sudah sampai clone-awal di belakang -> lompat diam-diam ke asli pertama
  });

  btnPrev.addEventListener("click", prev);
  btnNext.addEventListener("click", next);

  /* ---------- Drag / swipe (pointer events, mouse + touch) ---------- */
  function onPointerDown(e) {
    if (isAnimating) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    isDragging = true;
    dragMoved = false;
    dragStartX = e.clientX;
    dragStartPx = basePx();
    track.style.transition = "none";
    if (track.setPointerCapture) {
      try { track.setPointerCapture(e.pointerId); } catch (err) {}
    }
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    var dx = e.clientX - dragStartX;
    if (Math.abs(dx) > 4) dragMoved = true;
    setTransformRaw(dragStartPx + dx);
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    var dx = e.clientX - dragStartX;
    track.style.transition = "";
    var threshold = Math.max(50, slideWidthPx * 0.15);
    if (dx <= -threshold) { goTo(pos + 1); }
    else if (dx >= threshold) { goTo(pos - 1); }
    else if (dx !== 0) { goTo(pos); } // snap back only if the track actually moved; a pure click needs no transition (and no transitionend would fire to clear isAnimating)
    if (track.releasePointerCapture) {
      try { track.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    if (dragMoved) { suppressNextClick = true; }
  }

  track.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);

  /* ---------- Klik slide -> tampilkan di hero ---------- */
  track.addEventListener("click", function (e) {
    if (suppressNextClick) {
      suppressNextClick = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (e.target.closest(".port-slide-full")) return; // biarkan link buka tab baru
    var slideEl = e.target.closest(".port-slide");
    if (!slideEl) return;
    var idx = parseInt(slideEl.getAttribute("data-idx"), 10);
    var p = PROJECTS[idx];
    if (!p) return;
    setHero(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 120);
  });

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

    updateSlideMeta();

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

  buildSlides();
  layout();

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
