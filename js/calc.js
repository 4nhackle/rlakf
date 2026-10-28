// 점수 계산: 성취도 기준, 반올림 규칙, compute. DOM과 저장소를 만지지 않는 순수 함수만 둔다.
// 총점을 소수 첫째 자리에서 반올림한 정수로 성취도 판정 (예: 89.5 → 90 → A)
export var GRADES = [{ g: 'A', t: 90 }, { g: 'B', t: 80 }, { g: 'C', t: 70 }, { g: 'D', t: 60 }, { g: 'E', t: 50 }];

export function num(v) { v = String(v == null ? '' : v).trim(); return v === '' ? NaN : Number(v); }
export function fmt(n) { return String(+Number(n).toFixed(2)); }
export function f2(n) { return Number(n).toFixed(2); }
export function f1(n) { return Number(n).toFixed(1); }
export function clean(x) { return Math.round(x * 1e9) / 1e9; }
export function roundInt(x) { return Math.round(clean(x)); }          // 소수 첫째 자리에서 반올림
export function inR(x, a, b) { return isFinite(x) && x >= a && x <= b; }

export function compute(s) {
  var wp = num(s.wp), wm = num(s.wm), wf = num(s.wf);
  var maxP = num(s.spm), maxM = num(s.smm), P = num(s.sp), M = num(s.sm);
  var o = { wp: wp, wm: wm, wf: wf, maxP: maxP, maxM: maxM, P: P, M: M, needP: wp > 0, needM: wm > 0, bad: [], msg: '', where: '' };
  var sum = clean(wp + wm + wf);
  if (!inR(wp, 0, 100) || !inR(wm, 0, 100) || !inR(wf, 0, 100) || Math.abs(sum - 100) > 1e-9) {
    o.state = 'error'; o.where = 'w'; o.bad = ['wp', 'wm', 'wf']; o.msg = '비율의 합이 100%가 되어야 해요' + (isFinite(sum) ? ' (지금 ' + fmt(sum) + '%)' : ''); return o;
  }
  if (!(wf > 0)) { o.state = 'error'; o.where = 'w'; o.bad = ['wf']; o.msg = '기말고사 비율이 0%보다 커야 해요'; return o; }
  var msgs = [];
  if (o.needP && isFinite(P)) {
    if (!(maxP > 0)) { o.bad.push('spm'); msgs.push('수행평가 만점을 확인하세요'); }
    else if (!inR(P, 0, maxP)) { o.bad.push('sp'); msgs.push('수행평가 점수는 0~' + fmt(maxP) + '점'); }
  }
  if (o.needM && isFinite(M)) {
    if (!(maxM > 0)) { o.bad.push('smm'); msgs.push('중간고사 만점을 확인하세요'); }
    else if (!inR(M, 0, maxM)) { o.bad.push('sm'); msgs.push('중간고사 점수는 0~' + fmt(maxM) + '점'); }
  }
  if (msgs.length) { o.state = 'error'; o.where = 's'; o.msg = msgs.join(' · '); return o; }
  if ((o.needP && !isFinite(P)) || (o.needM && !isFinite(M))) { o.state = 'empty'; return o; }

  o.cP = o.needP ? clean(P / maxP * wp) : 0;
  o.cM = o.needM ? clean(M / maxM * wm) : 0;
  var base = o.base = clean(o.cP + o.cM), wfr = wf / 100;
  o.res = GRADES.map(function (G) {
    var cut = G.t - 0.5, need = clean(cut - base), F = need / wfr;
    var ok = function (f) { return roundInt(base + f * wfr) >= G.t; };
    var Fmin = Math.max(0, Math.ceil(F * 10 - 1e-9) / 10), status;
    if (ok(0)) { status = 'done'; Fmin = 0; }
    else if (!ok(100)) status = 'impossible';
    else { status = 'possible'; for (var i = 0; i < 5 && !ok(Fmin); i++) Fmin = Math.round(Fmin * 10 + 1) / 10; }
    return { g: G.g, t: G.t, cut: cut, need: need, F: F, Fmin: Fmin, status: status };
  });
  o.state = 'ok';
  return o;
}
export function pick(o, g) { return o.res[GRADES.map(function (G) { return G.g; }).indexOf(g)]; }
