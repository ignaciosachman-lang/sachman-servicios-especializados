(function () {
  var TOTAL = 5;
  var current = 0;
  var track = document.getElementById('track');
  var counter = document.getElementById('counter');
  var progressFill = document.getElementById('progressFill');
  var dotsWrap = document.getElementById('dots');
  for (var i = 0; i < TOTAL; i++) {
    var b = document.createElement('button');
    b.setAttribute('aria-label', 'Ir a la pantalla ' + (i + 1));
    (function (idx) { b.addEventListener('click', function () { go(idx); }); })(i);
    dotsWrap.appendChild(b);
  }
  function render() {
    track.style.transform = 'translateY(-' + (current * 100) + 'vh)';
    counter.textContent = String(current + 1).padStart(2, '0') + ' — ' + String(TOTAL).padStart(2, '0');
    progressFill.style.width = (((current + 1) / TOTAL) * 100) + '%';
    var dotBtns = dotsWrap.querySelectorAll('button');
    dotBtns.forEach(function (btn, idx) { btn.classList.toggle('active', idx === current); });
  }
  function go(i) { current = Math.max(0, Math.min(TOTAL - 1, i)); render(); }
  document.getElementById('prevBtn').addEventListener('click', function () { go(current - 1); });
  document.getElementById('nextBtn').addEventListener('click', function () { go(current + 1); });
  window.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); go(current + 1); }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); go(current - 1); }
  });
  var lastWheel = 0;
  window.addEventListener('wheel', function (e) {
    var now = Date.now();
    if (now - lastWheel < 700) return;
    lastWheel = now;
    if (e.deltaY > 30) go(current + 1);
    else if (e.deltaY < -30) go(current - 1);
  }, { passive: true });
  var touchStartY = 0;
  window.addEventListener('touchstart', function (e) { touchStartY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchend', function (e) {
    var dy = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 50) go(current + (dy > 0 ? 1 : -1));
  }, { passive: true });
  render();

  var navToggle = document.getElementById('slideNavToggle');
  var slideNav = document.getElementById('slideNav');
  if (navToggle && slideNav) {
    navToggle.addEventListener('click', function () {
      var open = slideNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    slideNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { slideNav.classList.remove('open'); });
    });
  }
})();
