const fs = require('fs');

// 读取博客数据
const data = JSON.parse(fs.readFileSync('/tmp/blog-data.json', 'utf-8'));

// 处理所有文章
const articles = data.map(article => {
  // 处理日期
  let timestamp = 0;
  if (article.date) {
    const date = new Date(article.date);
    timestamp = date.getTime();
  }
  
  // 处理标签 - 去除方括号和引号
  let tags = [];
  if (article.tags && article.tags.length > 0) {
    tags = article.tags.map(t => t.replace(/[\[\]"]/g, '').trim()).filter(t => t);
  }
  
  // 处理分类 - 去除方括号和引号
  let category = article.category || '日记';
  if (category.startsWith('[')) {
    category = category.replace(/[\[\]']/g, '').split(',')[0].trim();
  }
  
  // 生成本地地址和云地址
  const localPath = `~/.openclaw/workspace/otter-content/blog/${article.file}`;
  
  // 从文件名生成 slug
  let slug = article.file
    .replace(/^\d{4}-\d{2}-\d{2}-/, '')
    .replace(/\.(md|mdx)$/, '')
    .toLowerCase();
  
  const cloudUrl = `https://otter-assistant.github.io/post/${slug}.html/`;
  
  return {
    title: article.title,
    date: timestamp,
    category: category,
    tags: tags,
    description: article.description || '',
    localPath: localPath,
    cloudUrl: cloudUrl,
    file: article.file
  };
});

// 输出为 JSONL 格式，每行一条记录
articles.forEach((article, index) => {
  const record = {
    index: index + 1,
    ...article
  };
  console.log(JSON.stringify(record));
});
