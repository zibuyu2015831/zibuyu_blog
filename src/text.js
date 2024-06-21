function extractTitles(markdown) {
  // Split the markdown content by lines and trim each line
  const lines = markdown.split('\n').map(line => line.trim());
  // Object to store titles with their hierarchy
  const titles = [];
  // Variables to keep track of current position in the hierarchy
  let currentH1 = null;
  let currentH2 = null;
  // Regex patterns for headers
  const h1Pattern = /^# (.*)/;
  const h2Pattern = /^## (.*)/;
  const h3Pattern = /^### (.*)/;
  lines.forEach(line => {
    let match;
    if (match = h1Pattern.exec(line)) {
      currentH1 = { title: match[1], level: 1, children: [] };
      titles.push(currentH1);
      currentH2 = null;  // Reset currentH2 when a new H1 is encountered
    } else if (match = h2Pattern.exec(line)) {
      if (currentH1) {  // Ensure there is an H1 to attach this H2 to
        currentH2 = { title: match[1], level: 2, children: [] };
        currentH1.children.push(currentH2);
      }
    } else if (match = h3Pattern.exec(line)) {
      if (currentH2) {  // Ensure there is an H2 to attach this H3 to
        const currentH3 = { title: match[1], level: 3 };
        currentH2.children.push(currentH3);
      }
    }
  });
  return titles;
}
// Example usage:
const markdownContent = `
# 一级标题
一些内容
## 二级标题
一些内容
### 三级标题
一些内容
## 另一二级标题
更多内容
`;
const extractedTitles = extractTitles(markdownContent);
console.log(JSON.stringify(extractedTitles, null, 2));
