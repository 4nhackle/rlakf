// 상단 과목 칩 줄.
import { state } from "../state.js";
import { $, esc, reduce } from "./dom.js";

export function renderChips() {
  var box = $('chips');
  box.innerHTML = state.subjects.map(function (s) {
    var on = s.id === state.cur;
    return '<button type="button" class="chip" role="tab" data-id="' + s.id + '" aria-selected="' + on + '" tabindex="' + (on ? 0 : -1) + '">' + esc(s.name || '이름 없음') + '</button>';
  }).join('') + '<button type="button" class="chip add" id="add" aria-label="과목 추가"><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>';
  var a = box.querySelector('[aria-selected="true"]');
  if (a && a.scrollIntoView) a.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
}
