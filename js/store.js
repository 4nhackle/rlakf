// 저장소: localStorage 키·버전, 과목 레코드 모양(blank), 불러오기·저장. 실패해도 앱은 계속 돈다.
import { num, fmt } from "./calc.js";

var KEY = 'gimal-calc-v2', OLD = 'gimal-calc-v1';
function uid() { return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

export function blank(name, from) {
  return { id: uid(), name: name, wp: from ? from.wp : '40', wm: from ? from.wm : '30', wf: from ? from.wf : '30',
    sp: '', spm: from ? from.spm : '100', sm: '', smm: from ? from.smm : '100', sel: from ? from.sel : 'A' };
}
function normalize(s) {          // 이전 버전(wj = 지필 전체) → 기말 비율
  if (s.wf == null) { var f = num(s.wj) - num(s.wm); s.wf = isFinite(f) ? fmt(f) : '30'; }
  delete s.wj; if (!s.id) s.id = uid(); return s;
}

export function save(state) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
export function load() {
  var state = { subjects: [], cur: null };
  try {
    var d = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (d && Array.isArray(d.subjects) && d.subjects.length) state = d;
    else {
      var o = JSON.parse(localStorage.getItem(OLD) || 'null');
      if (o) { var s = blank('과목 1'); ['wp','wj','wm','sp','spm','sm','smm','sel'].forEach(function (k) { if (typeof o[k] === 'string') s[k] = o[k]; }); s.wf = null; state.subjects = [s]; }
    }
  } catch (e) {}
  state.subjects = (state.subjects || []).map(normalize);
  if (!state.subjects.length) state.subjects = [blank('과목 1')];
  if (!state.subjects.some(function (s) { return s.id === state.cur; })) state.cur = state.subjects[0].id;
  return state;
}
