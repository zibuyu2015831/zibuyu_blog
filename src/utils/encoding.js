/**
 * 字符串编码工具
 *
 * 抽取自原先在 DialogLogin.vue / DialogRegister.vue / ResetPassword.vue
 * 三处逐字重复的 `base64Encode` 实现（消除重复，见 dev_docs/11-code-duplication.md）。
 * 行为与原实现保持完全一致：先按 UTF-8 处理再 btoa，确保发往后端的报文不变。
 *
 * 注意：Base64 是「编码」而非「加密」，可逆，传输安全依赖 HTTPS + 后端哈希
 * （见 dev_docs/03-password-security.md）。
 */

/**
 * 将字符串按 UTF-8 编码后做 Base64 编码。
 * @param {string} str 待编码字符串
 * @returns {string} Base64 字符串
 */
export function base64Encode(str) {
  // 将字符串转换为UTF-8编码的二进制数据
  const utf8Bytes = encodeURIComponent(str).replace(
    /%([0-9A-F]{2})/g,
    function (match, p1) {
      return String.fromCharCode("0x" + p1);
    }
  );
  // 使用btoa进行Base64编码
  return btoa(utf8Bytes);
}
