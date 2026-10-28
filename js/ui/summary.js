// 전체 과목 목록과 그 아래 한 줄 요약.
import { compute, pick, f1 } from "../calc.js";
import { state } from "../state.js";
import { $, esc } from "./dom.js";
import { tone } from "./render.js";

function ring(v, c) {
  return '<span class="mini" style="--v:' + v + ';--c:' + c + '"' + (v > 0 ? '' : ' data-zero') + '><svg viewBox="0 0 24 24" aria-hidden="true"><circle class="track" cx="12" cy="12" r="9"/><circle class="arc" cx="12" cy="12" r="9" pathLength="100"/></svg></span>';
}
export function renderSummary() {
  var n = { done: 0, impossible: 0 }, vals = [];
  $('sum').innerHTML = state.subjects.map(function (s) {
    var o = compute(s), cls, html, rg;
    if (o.state === 'error') { cls = 'error'; html = '확인 필요'; rg = ring(0, 'var(--gray)'); }
    else if (o.state === 'empty') { cls = 'empty'; html = '입력 필요'; rg = ring(0, 'var(--gray)'); }
    else {
      var r = pick(o, s.sel); cls = r.status;
      if (r.status === 'possible') { html = f1(r.Fmin) + '<small>점</small>'; vals.push(r.Fmin); rg = ring(Math.min(r.Fmin, 100), tone(r.Fmin)); }
      else if (r.status === 'done') { html = '달성'; n.done++; rg = ring(100, 'var(--green)'); }
      else { html = '불가'; n.impossible++; rg = ring(0, 'var(--gray)'); }
    }
    return '<button type="button" class="row tap srow' + (s.id === state.cur ? ' cur' : '') + '" data-id="' + s.id + '">' + rg +
      '<span class="sname">' + esc(s.name || '이름 없음') + '</span><span class="badge" aria-label="목표 ' + s.sel + '">' + s.sel + '</span>' +
      '<span class="sval ' + cls + '">' + html + '</span><i class="chev r"></i></button>';
  }).join('');
  var parts = [];
  if (vals.length) parts.push('필요 점수 평균 ' + f1(vals.reduce(function (a, b) { return a + b; }, 0) / vals.length) + '점');
  if (n.done) parts.push('이미 달성 ' + n.done + '과목');
  if (n.impossible) parts.push('불가 ' + n.impossible + '과목');
  $('sfoot').textContent = parts.join(' · ');
}
