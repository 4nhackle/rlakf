// 삭제 뒤에 뜨는 "실행 취소" 토스트. 5초가 지나면 사라지고 onExpire를 부른다.
import { $ } from "./dom.js";

var t = 0;
export function showToast(msg, onExpire) {
  $('toast-msg').textContent = msg;
  $('toast').classList.add('show');
  clearTimeout(t); t = setTimeout(function () { hideToast(); onExpire(); }, 5000);
}
export function hideToast() { clearTimeout(t); $('toast').classList.remove('show'); }
