// 화면 쪽이 함께 쓰는 DOM 도우미.
export var FIELDS = ['wp', 'wm', 'wf', 'sp', 'spm', 'sm', 'smm'];
export var $ = function (id) { return document.getElementById(id); };
export var el = {}; FIELDS.forEach(function (k) { el[k] = $(k); });
export var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
export function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
