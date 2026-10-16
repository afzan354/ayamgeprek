/* =============================================================
   Ayam Geprek Senthil — Interaksi
   ============================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- NAV: shadow saat scroll ---------- */
  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');
  var mobileNav = document.getElementById('mobileNav');

  function onScroll() {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- NAV: menu mobile ---------- */
  if (burger && mobileNav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      burger.setAttribute('aria-label', open ? 'Buka menu navigasi' : 'Tutup menu navigasi');
      mobileNav.classList.toggle('is-open', !open);
      mobileNav.hidden = open;
    });

    mobileNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Buka menu navigasi');
        mobileNav.classList.remove('is-open');
        mobileNav.hidden = true;
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) {
        burger.setAttribute('aria-expanded', 'false');
        mobileNav.hidden = true;
        mobileNav.classList.remove('is-open');
      }
    });
  }

  /* ---------- REVEAL saat scroll ---------- */
  var revealables = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------- COUNTER statistik ---------- */
  var counters = document.querySelectorAll('[data-count]');

  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    if (reduceMotion) {
      el.textContent = target.toLocaleString('id-ID');
      return;
    }
    var duration = 1400;
    var start = null;

    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('id-ID');
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = (parseFloat(el.getAttribute('data-count')) || 0).toLocaleString('id-ID'); });
  }

  /* ---------- COUNTDOWN promo 15.00 - 17.00 ---------- */
  var cd = document.getElementById('countdown');

  if (cd) {
    var hEl = cd.querySelector('[data-cd="h"]');
    var mEl = cd.querySelector('[data-cd="m"]');
    var sEl = cd.querySelector('[data-cd="s"]');
    var START_HOUR = 15;
    var END_HOUR = 17;

    function pad(n) { return String(n).padStart(2, '0'); }

    function tick() {
      var now = new Date();
      var start = new Date(now);
      start.setHours(START_HOUR, 0, 0, 0);
      var end = new Date(now);
      end.setHours(END_HOUR, 0, 0, 0);

      // Kalau sudah lewat jam 17, hitung ke besok
      if (now >= end) start.setDate(start.getDate() + 1);

      var diff = Math.max(0, start - now);
      var totalSec = Math.floor(diff / 1000);

      hEl.textContent = pad(Math.floor(totalSec / 3600));
      mEl.textContent = pad(Math.floor((totalSec % 3600) / 60));
      sEl.textContent = pad(totalSec % 60);
    }

    tick();
    setInterval(tick, 1000);
  }

  /* ---------- FORM pemesanan ---------- */
  var form = document.getElementById('orderForm');

  if (form) {
    var done = document.createElement('div');
    done.className = 'form__done';
    done.innerHTML =
      '<span class="done__ico" aria-hidden="true">&#127881;</span>' +
      '<h3>Pesanan terkirim!</h3>' +
      '<p>Terima kasih. Tim kami akan menghubungi kamu lewat WhatsApp dalam 5 menit untuk konfirmasi.</p>' +
      '<a class="btn btn--ghost" href="#menu">Lihat menu lagi</a>';
    form.parentNode.insertBefore(done, form.nextSibling);

    function setError(input, message) {
      var field = input.closest('.field');
      if (!field) return;
      field.classList.add('has-error');
      var err = field.querySelector('.field__err');
      if (!err) {
        err = document.createElement('span');
        err.className = 'field__err';
        field.appendChild(err);
      }
      err.textContent = message;
    }

    function clearError(input) {
      var field = input.closest('.field');
      if (field) field.classList.remove('has-error');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nama = form.elements.nama;
      var hp = form.elements.hp;
      var porsi = form.elements.porsi;
      var ok = true;

      [nama, hp, porsi].forEach(clearError);

      if (!nama.value.trim()) {
        setError(nama, 'Nama wajib diisi.');
        ok = false;
      }

      var digits = hp.value.replace(/\D/g, '');
      if (digits.length < 9) {
        setError(hp, 'Nomor WhatsApp belum valid.');
        ok = false;
      }

      var p = parseInt(porsi.value, 10);
      if (!p || p < 1) {
        setError(porsi, 'Minimal 1 porsi.');
        ok = false;
      }

      if (!ok) {
        var firstErr = form.querySelector('.field.has-error input');
        if (firstErr) firstErr.focus();
        return;
      }

      form.hidden = true;
      done.classList.add('is-on');
      done.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    });

    form.addEventListener('input', function (e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') clearError(e.target);
    });
  }
})();