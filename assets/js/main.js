/* 和想館 トップページ（非公式・自主制作デモ）
   - ヒーロー：扇形マスクの中で写真をじわっと切り替え
   - 下層ページ：扇形の写真をゆっくり表示
   - スクロールに合わせたフェードイン
   - イベントの絞り込み（表示確認用。データ送信はしません）
   - スマホ用メニュー */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- ヒーロー ---------- */
  var hero = document.querySelector('.hero');
  if (hero) {
    var slides = hero.querySelectorAll('.hero__slide');
    var current = 0;
    var INTERVAL = 6000; // 1枚あたりの表示時間（ミリ秒）

    // 参考サイトと同じく、少し間を置いて段階的に表示
    setTimeout(function () { hero.classList.add('is-ready'); }, 300);
    setTimeout(function () { hero.classList.add('is-ready2'); }, 1500);

    if (!reduce && slides.length > 1) {
      // 2枚目以降を先に読み込んでおく
      slides.forEach(function (s) {
        var m = /url\(["']?([^"')]+)/.exec(s.style.backgroundImage);
        if (m) { var i = new Image(); i.src = m[1]; }
      });
      var timer = null;
      var next = function () {
        slides[current].classList.remove('is-active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('is-active');
      };
      var start = function () { if (!timer) timer = setInterval(next, INTERVAL); };
      var stop = function () { clearInterval(timer); timer = null; };
      setTimeout(start, 300);
      // タブが非表示の間は止める
      document.addEventListener('visibilitychange', function () {
        document.hidden ? stop() : start();
      });
    }
  }

  /* ---------- 下層ページの見出し ---------- */
  var sub = document.querySelector('.subhero');
  if (sub) { setTimeout(function () { sub.classList.add('is-ready'); }, 200); }

  /* ---------- スクロールで表示 ---------- */
  var targets = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    targets.forEach(function (t, i) {
      // 横並びの要素は少しずつ遅らせる
      var sib = t.parentElement ? Array.prototype.indexOf.call(t.parentElement.children, t) : 0;
      t.style.transitionDelay = Math.min(sib, 3) * 0.12 + 's';
      io.observe(t);
    });
  } else {
    targets.forEach(function (t) { t.classList.add('is-in'); });
  }

  /* ---------- イベントの絞り込み（表示確認用） ---------- */
  var tags = document.querySelectorAll('.filter .tag');
  var cards = document.querySelectorAll('.cards .card');
  tags.forEach(function (tag) {
    tag.addEventListener('click', function () {
      var f = tag.getAttribute('data-filter');
      tags.forEach(function (t) {
        var on = t === tag;
        t.classList.toggle('is-current', on);
        t.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      cards.forEach(function (c) {
        c.classList.toggle('is-hidden', f !== 'all' && c.getAttribute('data-cat') !== f);
      });
    });
  });

  /* ---------- スマホ用メニュー ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('global-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
      nav.classList.toggle('is-open', !open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
    });
  }
})();
