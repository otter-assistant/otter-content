const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('.').filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

const articles = files.map(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const frontmatter = frontmatterMatch ? frontmatterMatch[1] : '';
  
  // 解析 frontmatter
  const data = {};
  const lines = frontmatter.split('\n');
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match) {
      let value = match[2].trim();
      // 去除引号
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      data[match[1]] = value;
    }
  }
  
  return {
    title: data.title || file.replace(/\.(md|mdx)$/, ''),
    date: data.date || '',
    category: data.category || '日记',
    tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
    description: data.description || '',
    file: file
  };
});

console.log(JSON.stringify(articles, null, 2));
