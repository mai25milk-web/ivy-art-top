// ヘッダーの状態とメニュー
(function () {
  var hd = document.querySelector('.hd'), btn = document.querySelector('.hd__menu'), nav = document.getElementById('nav');
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
})();
