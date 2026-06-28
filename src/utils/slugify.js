/**
 * 标题 slug 工具（稳定锚点）
 *
 * 文章标题原先用随机 uuid 作 id，每次渲染都变，导致无法深链到某一节、
 * 浏览器前进/后退也定位不到。这里改用「由标题文本派生的可读 slug」，
 * 风格对齐 GitHub：小写、空白转连字符、保留中文（CJK），并对正文内
 * 重复标题做去重（追加 -1 / -2 …）。
 */

/**
 * 把一段标题文本转为 slug。
 * 规则：去 HTML 标签 → 去首尾空白 → 转小写 → 连续空白转单个 `-`
 *      → 仅保留 字母数字下划线 / 连字符 / CJK 统一表意文字。
 * @param {string} text 标题文本（可能含 marked 生成的内联 HTML）
 * @returns {string} slug；当文本为空或全是被过滤字符时回退为 'section'
 */
export function slugify(text) {
  if (!text) return 'section';
  const slug = String(text)
    .replace(/<[^>]*>/g, '') // 去 HTML 标签
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') // 空白 → 连字符
    .replace(/[^\w一-龥-]/g, '') // 仅留 \w / CJK / -
    .replace(/-+/g, '-') // 折叠连续连字符
    .replace(/^-+|-+$/g, ''); // 去首尾连字符
  return slug || 'section';
}

/**
 * 创建一个带去重的 slug 生成器。
 * 同一篇文章内多次调用，重复 slug 会自动追加 -1 / -2 …，保证页面内唯一。
 * 每篇文章渲染前应新建一个，避免跨文章累计计数。
 * @returns {(text: string) => string}
 */
export function makeSlugger() {
  const seen = new Map();
  return function slug(text) {
    const base = slugify(text);
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
}
