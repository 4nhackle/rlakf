// 현재 과목 화면: 입력칸 채우기, 결과 게이지, 성취도 막대, 계산 과정.
import { GRADES, compute, pick, fmt, f1, f2, clean, roundInt } from "../calc.js";
import { state, cur } from "../state.js";
import { $, el, FIELDS, reduce } from "./dom.js";

export function tone(f) { return f <= 80 ? 'var(--green)' : f <= 95 ? 'var(--orange)' : 'var(--red)'; }  // 필요 점수 난이도
export function fill() { var s = cur(); $('nm').value = s.name; FIELDS.forEach(function (k) { el[k].value = s[k]; }); }
function openW() { $('tg-w').setAttribute('aria-expanded', 'true'); $('dw-w').classList.add('open'); }

function paintSeg(res, sel) {
  var idx = 0;
  GRADES.forEach(function (G, i) {
    var b = $('t-' + G.g), r = res && res[i], on = G.g === sel;
    if (on) idx = i;
    b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1;
    b.setAttribute('aria-label', G.g + (r ? (r.status === 'done' ? ', 이미 달성' : r.status === 'impossible' ? ', 달성 불가' : ', ' + f1(r.Fmin) + '점 필요') : ''));
    b.classList.toggle('imp', !!(r && r.status === 'impossible'));
    b.classList.toggle('done', !!(r && r.status === 'done'));
    b.querySelector('.gs').textContent = !r ? '' : r.status === 'done' ? '달성' : r.status === 'impossible' ? '불가' : f1(r.Fmin);
  });
  $('seg').style.setProperty('--i', idx);
}

// 숫자 트윈: 화면에 보이는 현재 값에서 출발 → 도중에 바뀌어도 튀지 않음
var shown = null, raf = 0;
function tweenTo(target) {
  var big = $('big');
  cancelAnimationFrame(raf);
  if (reduce || shown === null) { shown = target; big.textContent = f1(target); return; }
  var from = shown, t0 = performance.now(), dur = 420;
  (function step(now) {
    var p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
    shown = from + (target - from) * e;
    big.textContent = f1(p === 1 ? target : shown);
    if (p < 1) raf = requestAnimationFrame(step);
  })(t0);
}
export function resetTween() { shown = null; }
function gauge(state, v, color) {
  var g = $('gauge');
  g.setAttribute('data-state', state);
  g.style.setProperty('--v', v);
  g.style.setProperty('--c', color);
  if (v > 0) g.removeAttribute('data-zero'); else g.setAttribute('data-zero', '');
}

// ── 현재 과목 렌더 ──
export function render() {
  var s = cur(), o = compute(s);
  $('del').disabled = state.subjects.length < 2;
  $('wsum').textContent = '수행 ' + (s.wp || '–') + ' · 중간 ' + (s.wm || '–') + ' · 기말 ' + (s.wf || '–');
  $('cap-p').textContent = (isFinite(o.wp) ? fmt(o.wp) : '–') + '%';
  $('cap-m').textContent = (isFinite(o.wm) ? fmt(o.wm) : '–') + '%';
  var offP = o.wp === 0, offM = o.wm === 0;
  el.sp.disabled = el.spm.disabled = offP; el.sm.disabled = el.smm.disabled = offM;
  $('row-sp').classList.toggle('off', offP); $('row-sm').classList.toggle('off', offM);
  FIELDS.forEach(function (k) { el[k].setAttribute('aria-invalid', String(o.bad.indexOf(k) >= 0)); });

  var ns = $('note-s'), nw = $('note-w');
  ns.textContent = o.where === 's' ? o.msg : ''; ns.classList.toggle('err', o.where === 's');
  nw.textContent = o.where === 'w' ? o.msg : '하나를 바꾸면 기말고사 비율이 맞춰져요.'; nw.classList.toggle('err', o.where === 'w');
  if (o.where === 'w') openW();

  var sub = $('sub');
  if (o.state !== 'ok') {
    paintSeg(null, s.sel);
    cancelAnimationFrame(raf); shown = null;
    gauge(o.state, 0, 'var(--blue)');
    $('big').textContent = '–'; $('unit').textContent = '기말고사';
    sub.textContent = o.state === 'error' ? '입력값을 확인하세요' : '점수를 입력하세요';
    sub.classList.toggle('err', o.state === 'error');
    $('g-steps').hidden = true;
    return;
  }
  sub.classList.remove('err');
  paintSeg(o.res, s.sel);

  var r = pick(o, s.sel), wfr = o.wf / 100, total = clean(o.base + r.Fmin * wfr);
  if (r.status === 'possible') {
    if ($('gauge').getAttribute('data-state') !== 'possible') shown = null;
    gauge('possible', Math.min(r.Fmin, 100), tone(r.Fmin));
    tweenTo(r.Fmin);
    $('unit').textContent = '점 이상';
    sub.innerHTML = '총점 ' + f2(total) + ' → 반올림 <strong>' + roundInt(total) + '점 · ' + r.g + '</strong>';
  } else if (r.status === 'done') {
    cancelAnimationFrame(raf); shown = null;
    gauge('done', 100, 'var(--green)');
    $('big').textContent = '달성'; $('unit').textContent = r.g + ' 확보';
    sub.innerHTML = '기말 0점이어도 총점 <strong>' + roundInt(o.base) + '점</strong>';
  } else {
    cancelAnimationFrame(raf); shown = null;
    var max = clean(o.base + o.wf);
    gauge('impossible', 0, 'var(--gray)');
    $('big').textContent = '불가'; $('unit').textContent = r.g + ' 목표';
    sub.innerHTML = '기말 100점이어도 총점 ' + f2(max) + ' → <strong>' + roundInt(max) + '점</strong>';
  }

  var st = [];
  if (o.needP) st.push(['수행평가 반영점수', fmt(o.P) + '/' + fmt(o.maxP) + ' × ' + fmt(o.wp) + ' = ' + f2(o.cP)]);
  if (o.needM) st.push(['중간고사 반영점수', fmt(o.M) + '/' + fmt(o.maxM) + ' × ' + fmt(o.wm) + ' = ' + f2(o.cM)]);
  st.push(['반올림해서 ' + r.t + '점이 되는 최소 총점', r.t + ' − 0.5 = ' + f1(r.cut)]);
  st.push(['기말고사에서 필요한 반영점수', f1(r.cut) + ' − ' + f2(o.base) + ' = ' + f2(r.need)]);
  if (r.status !== 'done') st.push(['기말고사 원점수로 환산', f2(r.need) + ' ÷ ' + fmt(o.wf) + '% = ' + f2(r.F)]);
  st.push(['결과', r.status === 'possible' ? f1(r.Fmin) + '점 이상 (0.1점 단위 올림)' : r.status === 'done' ? '이미 달성' : '달성 불가 (' + f1(r.F) + '점 필요)', true]);
  $('steps').innerHTML = st.map(function (it) {
    return '<div class="row step' + (it[2] ? ' final' : '') + '"><span class="k">' + it[0] + '</span><span class="v">' + it[1] + '</span></div>';
  }).join('');
  $('g-steps').hidden = false;
}
