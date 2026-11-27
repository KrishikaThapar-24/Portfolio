/* Portfolio animations: GSAP + ScrollTrigger, with Lenis for smooth scrolling.
   Without these libraries (or with reduced motion) the page is still fully readable. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---------- copy button  */
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var src = document.getElementById(btn.dataset.copy), txt = src.textContent, old = btn.textContent;
      function done() { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = old; }, 1400); }
      function select() { var r = document.createRange(); r.selectNodeContents(src); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
      try { navigator.clipboard.writeText(txt).then(done, select); } catch (e) { select(); }
    });
  });

  if (!window.gsap || !window.ScrollTrigger || reduce) { root.classList.remove('js'); window.__ready = true; return; }
  window.__ready = true;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scrolling ---------- */
  var lenis = null;
  if (typeof window.Lenis === 'function') {
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      var target = id === '#' ? document.body : $(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(id === '#top' ? 0 : target, { offset: id === '#top' ? 0 : -70, duration: 1.6 });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------- text splitting ---------- */
  function splitChars(el) {
    var chars = [];
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (tok) {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
            Array.prototype.forEach.call(tok, function (ch) {
              var s = document.createElement('span'); s.className = 'c'; s.textContent = ch; w.appendChild(s); chars.push(s);
            });
            frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) { walk(n); }
      });
    })(el);
    return chars;
  }
  function splitWords(el) {
    var words = [], txt = el.textContent.trim();
    el.setAttribute('aria-label', txt);
    el.textContent = '';
    txt.split(/\s+/).forEach(function (w, i, arr) {
      var s = document.createElement('span'); s.className = 'sw'; s.setAttribute('aria-hidden', 'true'); s.textContent = w;
      el.appendChild(s); words.push(s);
      if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return words;
  }

  /* ---------- hero intro ---------- */
  var heroChars = splitChars($('#h1'));
  var stats = $$('[data-count]');
  stats.forEach(function (el) { el.textContent = '0'; });
  function count(el) {
    var to = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || 0, 10), suf = el.dataset.suffix || '', o = { v: 0 };
    return gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: function () { el.textContent = o.v.toFixed(dec) + suf; } });
  }
  gsap.set('.hero .wrap, .orbit, .marq', { visibility: 'visible' });
  var intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro
    .from('.orbit', { scale: 0.55, opacity: 0, rotation: -50, duration: 2 }, 0)
    .from('.status', { y: 24, opacity: 0, duration: 0.9 }, 0.15)
    .from(heroChars, { yPercent: 130, rotationX: -90, opacity: 0, transformOrigin: '50% 100%', duration: 1.4, stagger: 0.035 }, 0.25)
    .from('.sub', { y: 36, opacity: 0, duration: 1 }, 0.95)
    .from('.roles span', { y: 24, opacity: 0, scale: 0.8, duration: 0.8, stagger: 0.07, ease: 'back.out(2)' }, 1.1)
    .from('.cta .pill', { y: 30, opacity: 0, duration: 0.9, stagger: 0.1 }, 1.3)
    .from('.stat', { y: 44, opacity: 0, duration: 1, stagger: 0.12 }, 1.35)
    .from('.marq', { yPercent: 100, duration: 1.1 }, 1.5)
    .add(function () { stats.forEach(count); }, 1.45);

  /* hero scroll-out + orbit spin driven by scroll */
  gsap.to('#h1', { yPercent: -14, scale: 0.94, opacity: 0.25, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.orbit', { rotation: 120, y: -140, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* progress bar and auto-hiding header */
  gsap.to('#bar', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  var header = $('#site-header'), hidden = false;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: function (self) {
      var should = self.direction === 1 && self.scroll() > 240;
      if (should !== hidden) { hidden = should; gsap.to(header, { yPercent: hidden ? -110 : 0, duration: 0.5, ease: 'power3.out' }); }
    }
  });

  /* skills marquee that reacts to scroll speed and direction */
  var mq = $('.marq'), tracks = $$('.mt');
  mq.classList.add('gm');
  var loop = gsap.to(tracks, { xPercent: -100, repeat: -1, duration: 40, ease: 'none' });
  ScrollTrigger.create({
    onUpdate: function (self) {
      var dir = self.direction, boost = Math.min(7, 1 + Math.abs(self.getVelocity()) / 260);
      gsap.to(loop, { timeScale: dir * boost, duration: 0.25, overwrite: true,
        onComplete: function () { gsap.to(loop, { timeScale: dir, duration: 1.2 }); } });
    }
  });

  /* ---------- scroll text scrub ---------- */
  var scrub = $('#scrub');
  if (scrub) {
    var words = splitWords(scrub);
    gsap.fromTo(words, { opacity: 0.16 }, { opacity: 1, stagger: 0.12, ease: 'none',
      scrollTrigger: { trigger: scrub, start: 'top 82%', end: 'bottom 48%', scrub: true } });
  }

  /* ---------- headings and eyebrows ---------- */
  $$('.split').forEach(function (h) {
    var chars = splitChars(h);
    gsap.from(chars, { yPercent: 120, rotation: 7, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.025,
      scrollTrigger: { trigger: h, start: 'top 88%' } });
    /* the outlined words drift sideways as you scroll */
    $$('.out', h).forEach(function (o) {
      gsap.fromTo(o, { x: 70 }, { x: -20, ease: 'none', scrollTrigger: { trigger: h, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });
  $$('.eyebrow').forEach(function (e) {
    gsap.from(e, { x: -40, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: e, start: 'top 92%' } });
  });

  /* ---------- reveal cards ---------- */
  $$('.sc').forEach(function (c) { c.setAttribute('data-reveal', ''); });
  gsap.set('[data-reveal]', { opacity: 0, y: 70, rotationX: -8, transformOrigin: '50% 100%' });
  gsap.set('.sc .chip', { opacity: 0, scale: 0.5, y: 22 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%', once: true,
    onEnter: function (els) {
      gsap.to(els, { opacity: 1, y: 0, rotationX: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12, clearProps: 'rotationX' });
      els.forEach(function (el) {
        var chips = $$('.chip', el);
        if (chips.length) gsap.to(chips, { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(2.4)', stagger: 0.05, delay: 0.25, clearProps: 'opacity,transform' });
      });
    }
  });

  /* ---------- presora: pinned horizontal scroll on desktop ---------- */
  var mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', function () {
    var sec = $('#presora'), wrap = $('#pwrap'), track = $('#ptrack'), prog = $('#pprog'), bar = $('#pbar');
    var dist = function () { return Math.max(0, track.offsetWidth - wrap.clientWidth); };
    gsap.set(wrap, { overflow: 'hidden' });
    gsap.set(prog, { display: 'block' });
    var move = gsap.to(track, { x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: { trigger: sec, pin: true, start: 'top top', end: function () { return '+=' + dist(); }, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: function (self) { gsap.set(bar, { scaleX: self.progress }); } } });
    $$('.pc').forEach(function (pc, i) {
      if (i === 0) return;
      gsap.from(pc, { opacity: 0.25, scale: 0.9, ease: 'none',
        scrollTrigger: { trigger: pc, containerAnimation: move, start: 'left 96%', end: 'left 62%', scrub: true } });
    });
    gsap.from('.pc', { y: 60, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.12,
      scrollTrigger: { trigger: '#presora', start: 'top 70%', once: true } });
  });
  mm.add('(max-width: 899px)', function () {
    gsap.set('.pc', { opacity: 0, y: 50 });
    ScrollTrigger.batch('.pc', { start: 'top 90%', once: true,
      onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.12 }); } });
  });
  gsap.from('.aim span', { y: 20, opacity: 0, scale: 0.8, ease: 'back.out(2)', stagger: 0.08, duration: 0.7,
    scrollTrigger: { trigger: '.aim', start: 'top 92%' } });

  /* ---------- experience timeline ---------- */
  gsap.fromTo('#fill', { scaleY: 0 }, { scaleY: 1, ease: 'none',
    scrollTrigger: { trigger: '#tl', start: 'top 60%', end: 'bottom 60%', scrub: true } });
  var narrow = window.matchMedia('(max-width: 760px)').matches;
  $$('.ti').forEach(function (ti) {
    var left = ti.classList.contains('l');
    var st = { trigger: ti, start: 'top 82%' };
    gsap.from($('.card', ti), { x: narrow ? 40 : (left ? -90 : 90), opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: st });
    gsap.from($('.dot', ti), { scale: 0, duration: 0.7, ease: 'back.out(3)', scrollTrigger: st });
    $$('li', ti).forEach(function (li, i) {
      gsap.from(li, { opacity: 0, y: 14, duration: 0.7, delay: 0.25 + i * 0.12, ease: 'power3.out', scrollTrigger: st });
    });
  });

  /* ---------- contact ---------- */
  gsap.from('.hello', { scale: 0.3, rotation: -120, opacity: 0, duration: 1.4, ease: 'back.out(1.6)',
    scrollTrigger: { trigger: '.contactrow', start: 'top 75%' } });
  gsap.to('.hello', { y: -18, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  /* ---------- pointer effects (mouse only) ---------- */
  if (fine) {
    var ring = $('#ring');
    var rx = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3' });
    var ry = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3' });
    window.addEventListener('pointermove', function (e) { ring.classList.add('on'); rx(e.clientX); ry(e.clientY); });
    $$('a, button, .chip, .proj').forEach(function (el) {
      el.addEventListener('pointerenter', function () { ring.classList.add('big'); gsap.to(ring, { scale: 1.9, duration: 0.3, ease: 'power3.out' }); });
      el.addEventListener('pointerleave', function () { ring.classList.remove('big'); gsap.to(ring, { scale: 1, duration: 0.3, ease: 'power3.out' }); });
    });

    $$('.mag').forEach(function (el) {
      var xt = gsap.quickTo(el, 'x', { duration: 1, ease: 'elastic.out(1,0.4)' });
      var yt = gsap.quickTo(el, 'y', { duration: 1, ease: 'elastic.out(1,0.4)' });
      el.addEventListener('pointermove', function (e) {
        var b = el.getBoundingClientRect();
        xt((e.clientX - b.left - b.width / 2) * 0.3); yt((e.clientY - b.top - b.height / 2) * 0.3);
      });
      el.addEventListener('pointerleave', function () { xt(0); yt(0); });
    });

    $$('.tilt').forEach(function (el) {
      gsap.set(el, { transformPerspective: 900 });
      var tx = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' });
      var ty = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' });
      var mock = $('.mock', el);
      var mx = gsap.quickTo(mock, 'x', { duration: 0.6, ease: 'power3' });
      var my = gsap.quickTo(mock, 'y', { duration: 0.6, ease: 'power3' });
      el.addEventListener('pointermove', function (e) {
        var b = el.getBoundingClientRect(), px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
        el.style.setProperty('--mx', px * 100 + '%'); el.style.setProperty('--my', py * 100 + '%');
        tx((px - 0.5) * 12); ty((0.5 - py) * 12); mx((px - 0.5) * 16); my((py - 0.5) * 12);
      });
      el.addEventListener('pointerleave', function () { tx(0); ty(0); mx(0); my(0); });
    });
  }

  /* fonts change layout; recalculate trigger positions once they load */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
