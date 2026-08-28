/* ============================================================
   Intelligence Designed To Evolve — main.js
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Mobile menu ---------- */
  const burger = document.querySelector(".burger");
  const overlay = document.getElementById("overlay");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-menu a");

  function openMenu() {
    document.body.classList.add("menu-open");
    burger.setAttribute("aria-expanded", "true");
    overlay.hidden = false;
    mobileMenu.hidden = false;
  }

  function closeMenu() {
    document.body.classList.remove("menu-open");
    burger.setAttribute("aria-expanded", "false");
    overlay.hidden = true;
    mobileMenu.hidden = true;
  }

  if (burger) {
    burger.addEventListener("click", function () {
      const open = burger.getAttribute("aria-expanded") === "true";
      if (open) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener("click", closeMenu);
  }

  mobileLinks.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 720) closeMenu();
  });

  /* ---------- Count-up stats ---------- */
  const numbers = document.querySelectorAll(".stat-value");

  const easeOutCubic = function (t) {
    return 1 - Math.pow(1 - t, 3);
  };

  function animateNumber(el) {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    const idx = Array.prototype.indexOf.call(numbers, el);
    const duration = 1500 + idx * 80;
    const startOffset = 480 + idx * 90;
    const start = performance.now() + startOffset;

    function frame(now) {
      const elapsed = now - start;
      if (elapsed < 0) {
        requestAnimationFrame(frame);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const value = target * eased;
      const formatted = value.toFixed(decimals);
      el.textContent = formatted + " " + suffix;
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = target.toFixed(decimals) + " " + suffix;
      }
    }

    requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateNumber(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    numbers.forEach(function (el) {
      io.observe(el);
    });
  } else {
    numbers.forEach(function (el) {
      const target = parseFloat(el.dataset.target);
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      el.textContent = target.toFixed(decimals) + " " + (el.dataset.suffix || "");
    });
  }
})();
