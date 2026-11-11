// ヘッダー・メニュー・幕・出現・スクロール連動
(function () {
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hd = document.querySelector('.hd'), btn = document.querySelector('.hd__menu'), nav = document.getElementById('nav');

  /* ヘッダーとメニュー */
  function onScroll() { hd.classList.toggle('is-scrolled', window.scrollY > 40); }
  function setOpen(open) {
    nav.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  btn.addEventListener('click', function () { setOpen(nav.hidden); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !nav.hidden) { setOpen(false); btn.focus(); } });

  /* ページ内リンク（ScrollTrigger の再計算と干渉しないよう JS で動かす） */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var el = document.querySelector(a.getAttribute('href'));
    if (!el) return;
    e.preventDefault();
    var offset = a.getAttribute('href') === '#top' ? 0 : (innerWidth > 1023 ? 96 : 80);
    window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - offset, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* 幕：ロゴが出る → 定位置へ移動 → 幕が溶ける → ヒーローが現れる */
  var curtain = document.querySelector('.curtain');
  function endSplash() {
    root.classList.remove('splash');
    try { sessionStorage.setItem('ivy-splash', '1'); } catch (e) { /* 保存できなくても動く */ }
  }
  if (root.classList.contains('splash') && curtain) {
    var mark = curtain.querySelector('.curtain__logo'), goal = document.querySelector('.hd .logo__leaf');
    requestAnimationFrame(function () { curtain.classList.add('is-in'); });
    setTimeout(function () {
      var a = mark.querySelector('svg').getBoundingClientRect(), b = goal.getBoundingClientRect();
      var s = b.width / a.width;
      var dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
      mark.style.transformOrigin = '50% ' + (a.top + a.height / 2 - mark.getBoundingClientRect().top) + 'px';
      mark.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')';
    }, 1300);
    setTimeout(function () { curtain.classList.add('is-out'); endSplash(); }, 2300);
    setTimeout(function () { mark.style.transition = 'opacity .5s ease'; mark.style.opacity = 0; }, 2300);
    setTimeout(function () { curtain.classList.remove('is-out', 'is-in'); }, 3900);
  }

  /* ヒーローの写真：枠ごとに順番にクロスフェード */
  if (!reduce) {
    var frames = [].slice.call(document.querySelectorAll('.frame')), turn = 0;
    setInterval(function () {
      var imgs = frames[turn++ % frames.length].children, i = 0;
      for (var k = 0; k < imgs.length; k++) if (imgs[k].classList.contains('is-on')) i = k;
      imgs[i].classList.remove('is-on');
      imgs[(i + 1) % imgs.length].classList.add('is-on');
    }, 3200);
  }

  /* 静かな出現。並んでいるものは少しずつ遅らせる */
  if (!reduce && 'IntersectionObserver' in window) {
    var sel = '.sub-hero__txt,.sub-hero__ph,.classes__head,.class,.hello__txt,.hello__figs figure,.head,.lead,.powers article,.teacher__card,.insta__head,.insta__grid img,.price__list article,.price__info,.price__note,.faq details,.access,.contact__form,.contact__dm,.ft__main,.ft__cols>div';
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('on'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll(sel).forEach(function (el) {
      var n = [].indexOf.call(el.parentNode.children, el);
      el.classList.add('rv');
      el.style.setProperty('--d', Math.min(n, 5) * 0.12 + 's');
      io.observe(el);
    });
  }

  /* スクロール連動 */
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // 視差：画像が枠の中でゆっくり動く
  document.querySelectorAll('.pl img').forEach(function (el) {
    gsap.fromTo(el, { yPercent: -15 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: el.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  if (document.querySelector('.teacher__bg')) gsap.fromTo('.teacher__bg', { yPercent: -8, scale: 1.1 }, { yPercent: 8, scale: 1, ease: 'none', scrollTrigger: { trigger: '.teacher__band', start: 'top bottom', end: 'bottom top', scrub: true } });

  var mm = gsap.matchMedia();
  mm.add('(min-width:1024px)', function () {
    // 傾けた写真は速さを変えて重なりをずらす
    document.querySelectorAll('.hello__photos>img').forEach(function (el, i) {
      gsap.fromTo(el, { y: 36 - i * 14 }, { y: -36 - i * 22, ease: 'none', scrollTrigger: { trigger: '.hello__photos', start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // ヒーローの写真枠を抜けぎわに少し持ち上げる
    document.querySelectorAll('.frame').forEach(function (el, i) {
      gsap.to(el, { y: -40 - i * 30, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    });
    // 3つの特徴：固定して横へ送る（トップのみ）
    var sec = document.getElementById('features'), track = sec && sec.querySelector('.cards');
    if (!track) return;
    root.classList.add('has-h');
    var steps = sec.querySelectorAll('.steps li'), bar = sec.querySelector('.steps>i>i');
    var dist = function () { return Math.max(0, track.scrollWidth - innerWidth); };
    gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: {
        trigger: sec, start: 'top top', end: function () { return '+=' + dist() * 1.15; },
        pin: true, scrub: 0.5, invalidateOnRefresh: true,
        onUpdate: function (st) {
          bar.style.transform = 'scaleX(' + st.progress + ')';
          var at = Math.min(steps.length - 1, Math.floor(st.progress * steps.length));
          steps.forEach(function (li, i) { li.classList.toggle('is-on', i <= at); });
        }
      }
    });
    return function () { root.classList.remove('has-h'); };
  });

  addEventListener('load', function () { ScrollTrigger.refresh(); });
})();

// Instagram の埋め込みは読み込み後に高さが変わるので、スクロール位置を計算し直す
(function () {
  var box = document.querySelector('.ig-embeds'), t;
  if (!box || !window.ScrollTrigger || !window.ResizeObserver) return;
  new ResizeObserver(function () { clearTimeout(t); t = setTimeout(function () { ScrollTrigger.refresh(); }, 200); }).observe(box);
})();
