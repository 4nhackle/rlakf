// 과목 목록과 현재 과목을 바꾸는 함수. 화면은 건드리지 않고, 바꾼 뒤 저장만 한다.
import { blank, load, save as persist } from "./store.js";

export var state = load();
var lastDel = null;

export function cur() { return state.subjects.filter(function (s) { return s.id === state.cur; })[0]; }
export function save() { persist(state); }

export function selectSubject(id) { state.cur = id; save(); }
export function addSubject() {
  var s = blank('과목 ' + (state.subjects.length + 1), cur());
  state.subjects.push(s); state.cur = s.id; save();
}
// 지운 과목을 돌려준다. 과목이 하나뿐이면 지우지 않고 null.
export function deleteSubject() {
  if (state.subjects.length < 2) return null;
  var s = cur(), i = state.subjects.indexOf(s);
  lastDel = { s: s, i: i };
  state.subjects.splice(i, 1);
  state.cur = state.subjects[Math.min(i, state.subjects.length - 1)].id;
  save();
  return s;
}
export function undoDelete() {
  if (!lastDel) return false;
  state.subjects.splice(lastDel.i, 0, lastDel.s); state.cur = lastDel.s.id;
  lastDel = null; save();
  return true;
}
export function dropUndo() { lastDel = null; }
