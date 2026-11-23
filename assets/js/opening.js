/* 和想館トップページ：オープニングアニメーション
   - index.html 専用。head 内のインラインスクリプトが html.wsk-opening を
     付けている場合だけ動く（= セッションで1回、または ?opening=1）
   - 再生条件・安全装置：
     ・prefers-reduced-motion では再生しない（インライン側で判定済み）
     ・ロゴ画像の読み込みに失敗したら演出を中止して通常表示へ戻す
     ・「スキップ」ボタンと Esc キーで即座に終了
     ・終了時にヒーローが隠れたままにならないよう、幕・ロゴを必ず取り除く
   - タイムライン（約3.3秒）
     0.00s  白い幕の上に筆ロゴが描かれる（CSSアニメーション）
     1.10s  文字が引く・縦線（is-phase2）
     1.25s  ロゴがヒーローの扇形マスクと同じ位置・大きさへ移動（FLIP）
     2.00s  インクが、マスク形の写真へ溶ける（is-cross）
     2.50s  左右の幕が開く（is-open）
     3.30s  終了処理（スプラッシュを取り除く）
*/
(function () {
  'use strict';

  var splash = document.getElementById('opening');
  if (!splash) return;

  var skip = document.getElementById('opening-skip');
  var wrap = splash.querySelector('.opening__logo-wrap');
  var logo = splash.querySelector('.opening__logo');
  var photo = splash.querySelector('.opening__photo');
  if (!wrap || !logo || !skip) return;

  /* head のインラインスクリプトが判定済み。クラスが無ければ何もしない */
  if (!document.documentElement.classList.contains('wsk-opening')) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var locked = [];   /* 再生中に inert にした要素 */
  var timers = [];
  var finished = false;

  function stop() {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    /* 幕を確実に取り除く（画面が白いまま残らないように） */
    splash.classList.add('is-done');
    splash.classList.remove('is-active');
    splash.setAttribute('aria-hidden', 'true');
    skip.tabIndex = -1;
    document.documentElement.classList.remove('wsk-opening');
    document.body.classList.remove('is-opening');
    locked.forEach(function (el) { el.inert = false; });
    if (document.activeElement === skip) skip.blur();
  }

  function setInert() {
    ['.notice-bar', '.site-header', 'main', '.site-footer'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        el.inert = true;
        locked.push(el);
      });
    });
  }

  /* ロゴをヒーローのマスクと同じ箱へ移し替える（FLIP）。
     同時に、引き継ぎ用の写真（マスク形）を同じ位置に重ねて仕込む */
  function handoff() {
    var mask = document.querySelector('.hero__mask');
    if (!mask) return;
    var cur = wrap.getBoundingClientRect();
    var tgt = mask.getBoundingClientRect();
    var dx = (tgt.left + tgt.width / 2) - (cur.left + cur.width / 2);
    var dy = (tgt.top + tgt.height / 2) - (cur.top + cur.height / 2);
    wrap.style.transform =
      'translate(' + dx + 'px,' + dy + 'px)' +
      ' scale(' + (tgt.width / cur.width) + ',' + (tgt.height / cur.height) + ')';
    if (photo) {
      photo.style.left = tgt.left + 'px';
      photo.style.top = tgt.top + 'px';
      photo.style.width = tgt.width + 'px';
      photo.style.height = tgt.height + 'px';
    }
  }

  function play() {
    window.scrollTo(0, 0);
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    setInert();
    splash.classList.add('is-active');
    splash.setAttribute('aria-hidden', 'false');
    skip.tabIndex = 0;
    skip.focus({ preventScroll: true });
    timers.push(setTimeout(function () { splash.classList.add('is-phase2'); }, 1100));
    timers.push(setTimeout(handoff, 1250));
    timers.push(setTimeout(function () { splash.classList.add('is-cross'); }, 2000));
    timers.push(setTimeout(function () { splash.classList.add('is-open'); }, 2500));
    timers.push(setTimeout(stop, 3300));
  }

  skip.addEventListener('click', stop);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') stop();
  });
  reduce.addEventListener('change', function () {
    if (reduce.matches) stop();
  });

  /* ロゴが表示できる状態になってから再生する。
     失敗・タイムアウト時は演出を中止して通常表示へ */
  try {
    if (logo.complete && logo.naturalWidth) {
      play();
    } else {
      logo.addEventListener('load', function () { if (!finished) play(); });
      logo.addEventListener('error', stop);
      timers.push(setTimeout(function () {
        if (!splash.classList.contains('is-active')) stop();
      }, 2500));
    }
  } catch (e) {
    stop();
  }
})();
