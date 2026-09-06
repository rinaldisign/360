/* =========================================================
   Panorama Studio — Proposal Landing Page
   File: js/main.js
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* Sticky header shadow on scroll */
  var header = document.getElementById('appHeader');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 8) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  /* Scroll reveal animation for sections */
  var reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function (el) { io.observe(el); });
  } else {
    // Fallback for older browsers without IntersectionObserver
    reveals.forEach(function (el) { el.classList.add('in-view'); });
  }

});
