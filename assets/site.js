var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // sticky header state + scroll progress
  var hdr = document.getElementById('hdr');
  var prog = document.getElementById('prog');
  var onScroll = function () {
    if (window.scrollY > 8) { hdr.classList.add('scrolled'); }
    else { hdr.classList.remove('scrolled'); }
    if (prog) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // reveal on enter
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Count the stat figures up when the strip arrives. The markup already holds
  // the real numbers, so this only ever runs when it can finish the job: no JS,
  // reduced motion, or a strip that is already past — all keep the plain values.
  var strip = document.querySelector('.stats');
  var figures = [].slice.call(document.querySelectorAll('.stat-num[data-count]'));
  if (strip && figures.length && !reduced && 'IntersectionObserver' in window &&
      strip.getBoundingClientRect().top > window.innerHeight) {
    figures.forEach(function (el) { el.textContent = '0'; });
    var runCount = function () {
      figures.forEach(function (el) {
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        if (target === 0) { el.textContent = '0'; return; }
        var dur = 900, t0 = performance.now();
        var tick = function (now) {
          var k = Math.min(1, (now - t0) / dur);
          el.textContent = String(Math.round(target * (1 - Math.pow(1 - k, 3))));
          if (k < 1) { requestAnimationFrame(tick); }
        };
        requestAnimationFrame(tick);
      });
    };
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { so.disconnect(); runCount(); }
      });
    }, { threshold: 0.3 });
    so.observe(strip);
  }

  // pointer-tracked card tint
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('pointermove', function (ev) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
      card.style.setProperty('--my', (ev.clientY - r.top) + 'px');
    });
  });

  // Watchdog: if no observer callback has landed, the content must not stay
  // hidden. Anything still unrevealed after 1.5s is shown outright.
  setTimeout(function () {
    if (!document.querySelector('.reveal.in')) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    }
  }, 1500);
