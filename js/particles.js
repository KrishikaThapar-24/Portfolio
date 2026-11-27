/* Hero particle network. Reacts to the cursor; pauses when the hero is off screen. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var cv = document.getElementById('net');
  if (!cv || !cv.getContext) return;
  var hero = cv.parentNode, ctx = cv.getContext('2d');
  var W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1), P = [], mx = -999, my = -999, run = true;

  function size() {
    W = hero.clientWidth; H = hero.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.max(24, Math.min(90, Math.round(W / 16)));
    P = [];
    for (var k = 0; k < n; k++) {
      P.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, c: Math.random() < .2 ? '157,140,255' : '212,255,79' });
    }
  }
  size();
  window.addEventListener('resize', size);

  hero.addEventListener('pointermove', function (e) {
    var b = hero.getBoundingClientRect();
    mx = e.clientX - b.left; my = e.clientY - b.top;
  });
  hero.addEventListener('pointerleave', function () { mx = my = -999; });

  /* orbit parallax follows the pointer */
  var orb = document.getElementById('orbit');
  hero.addEventListener('pointermove', function (e) {
    if (!orb) return;
    var b = hero.getBoundingClientRect();
    var rx = (e.clientX - b.left) / b.width - .5, ry = (e.clientY - b.top) / b.height - .5;
    orb.style.transform = 'translate(' + (rx * -34) + 'px,' + (ry * -34) + 'px)';
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { run = es[0].isIntersecting; if (run) frame(); }).observe(hero);
  }

  function frame() {
    if (!run) return;
    ctx.clearRect(0, 0, W, H);
    for (var a = 0; a < P.length; a++) {
      var p = P[a];
      var dx = mx - p.x, dy = my - p.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < 160) { p.vx += dx / d * .02; p.vy += dy / d * .02; }
      p.vx *= .995; p.vy *= .995;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 6.283); ctx.fillStyle = 'rgba(' + p.c + ',.85)'; ctx.fill();
      for (var b = a + 1; b < P.length; b++) {
        var q = P[b], ex = p.x - q.x, ey = p.y - q.y, dd = ex * ex + ey * ey;
        if (dd < 15000) {
          ctx.strokeStyle = 'rgba(212,255,79,' + (.16 * (1 - dd / 15000)) + ')';
          ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      if (d < 190) {
        ctx.strokeStyle = 'rgba(157,140,255,' + (.5 * (1 - d / 190)) + ')';
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mx, my); ctx.stroke();
      }
    }
    requestAnimationFrame(frame);
  }
  frame();
})();
