// 이벤트 바인딩. 상태는 state.js, 계산은 calc.js, 그리기는 ui/*가 맡는다.
import { GRADES, num, fmt, inR } from "./calc.js";
import { state, cur, save, selectSubject, addSubject, deleteSubject, undoDelete, dropUndo } from "./state.js";
import { $, el, FIELDS, reduce } from "./ui/dom.js";
import { render, fill, resetTween } from "./ui/render.js";
import { renderChips } from "./ui/chips.js";
import { renderSummary } from "./ui/summary.js";
import { showToast, hideToast } from "./ui/toast.js";

function renderAll() { renderChips(); render(); renderSummary(); }
// 과목이 바뀐 뒤: 입력칸을 채우고 화면 전체를 다시 그린다.
function show() { resetTween(); fill(); renderAll(); }
function go(id) { selectSubject(id); show(); }

// ── 유리 바: 스크롤되어 붙었을 때만 재질이 생김 ──
if ('IntersectionObserver' in window) {
  new IntersectionObserver(function (e) { $('bar').classList.toggle('stuck', !e[0].isIntersecting); }, { threshold: 0 }).observe($('sentinel'));
}

// ── 과목 칩 ──
$('chips').addEventListener('click', function (e) {
  var b = e.target.closest('button'); if (!b) return;
  if (b.id === 'add') { addSubject(); show(); $('nm').focus(); $('nm').select(); }
  else go(b.getAttribute('data-id'));
});
$('chips').addEventListener('keydown', function (e) {
  var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
  var i = state.subjects.indexOf(cur()), n = state.subjects[(i + d + state.subjects.length) % state.subjects.length];
  e.preventDefault(); go(n.id);
  var b = $('chips').querySelector('[data-id="' + n.id + '"]'); if (b) b.focus();
});

// ── 삭제 + 실행 취소 ──
$('del').addEventListener('click', function () {
  var s = deleteSubject(); if (!s) return;
  show();
  showToast('‘' + (s.name || '이름 없음') + '’ 삭제됨', dropUndo);
});
$('undo').addEventListener('click', function () {
  if (!undoDelete()) return;
  hideToast(); show();
});

// ── 입력 ↔ 상태 ──
$('nm').addEventListener('input', function () { cur().name = this.value; save(); renderChips(); renderSummary(); });
$('nm').addEventListener('blur', function () {
  if (!this.value.trim()) { cur().name = '과목 ' + (state.subjects.indexOf(cur()) + 1); this.value = cur().name; save(); renderChips(); renderSummary(); }
});
FIELDS.forEach(function (k) {
  el[k].addEventListener('input', function () {
    var s = cur(); s[k] = el[k].value;
    var wp = num(s.wp), wm = num(s.wm), wf = num(s.wf);
    if ((k === 'wp' || k === 'wm') && inR(wp, 0, 100) && inR(wm, 0, 100) && wp + wm <= 100) s.wf = el.wf.value = fmt(100 - wp - wm);
    if (k === 'wf' && inR(wf, 0, 100) && inR(wm, 0, 100) && wf + wm <= 100) s.wp = el.wp.value = fmt(100 - wm - wf);
    save(); render(); renderSummary();
  });
});

// ── 디스클로저 ──
function disclose(btnId, dwId) {
  $(btnId).addEventListener('click', function () {
    var open = this.getAttribute('aria-expanded') !== 'true';
    this.setAttribute('aria-expanded', String(open));
    $(dwId).classList.toggle('open', open);
  });
}
disclose('tg-w', 'dw-w'); disclose('tg-s', 'dw-s');

// ── 성취도 세그먼트 ──
var seg = $('seg');
GRADES.forEach(function (G, i) {
  var b = document.createElement('button');
  b.type = 'button'; b.id = 't-' + G.g; b.setAttribute('role', 'radio');
  b.innerHTML = '<span class="g">' + G.g + '</span><span class="gs"></span>';
  b.addEventListener('click', function () { cur().sel = G.g; save(); render(); renderSummary(); });
  b.addEventListener('keydown', function (e) {
    var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return; e.preventDefault();
    var n = GRADES[(i + d + GRADES.length) % GRADES.length].g; cur().sel = n; save(); render(); renderSummary(); $('t-' + n).focus();
  });
  seg.appendChild(b);
});

// ── 전체 과목 ──
$('sum').addEventListener('click', function (e) {
  var b = e.target.closest('.srow'); if (!b) return;
  go(b.getAttribute('data-id'));
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
});

fill(); renderAll();
