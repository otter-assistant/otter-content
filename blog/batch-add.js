const fs = require('fs');

// 读取博客数据
const data = fs.readFileSync('/tmp/blog-data.json', 'utf-8');
const articles = JSON.parse(data);

// 生成添加命令
const commands = articles.map((article, index) => {
  const timestamp = article.date ? new Date(article.date).getTime() : 0;
  
  // 处理标签
  let tags = [];
  if (article.tags && article.tags.length > 0) {
    tags = article.tags.map(t => t.replace(/[\[\]"]/g, '').trim()).filter(t => t);
  }
  
  // 处理分类
  let category = article.category || '日记';
  if (category.startsWith('[')) {
    category = category.replace(/[\[\]']/g, '').split(',')[0].trim();
  }
  
  // 生成本地地址和云地址
  const localPath = `~/.openclaw/workspace/otter-content/blog/${article.file}`;
  
  // 从文件名生成 slug (去掉日期前缀和扩展名)
  let slug = article.file
    .replace(/^\d{4}-\d{2}-\d{2}-/, '')
    .replace(/\.(md|mdx)$/, '')
    .toLowerCase();
  
  const cloudUrl = `https://otter-assistant.github.io/post/${slug}.html/`;
  
  return {
    index: index + 1,
    title: article.title,
    date: timestamp,
    category: category,
    tags: tags,
    description: article.description,
    localPath: localPath,
    cloudUrl: cloudUrl,
    file: article.file
  };
});

console.log(JSON.stringify(commands, null, 2));
