# YouTube 下载神器：yt-dlp 从入门到精通

> 需要经常下载 YouTube 视频？来认识一下 yt-dlp 这个强大的命令行工具吧。

## 前言

是不是经常遇到这些情况：
- 想下载 YouTube 视频保存到本地观看
- 只需要视频的音频，提取 MP3 方便在手机上听
- 视频的字幕很好，想保存下来做笔记

今天就来介绍一个功能强大、免费开源的下载神器——**yt-dlp**。

## 什么是 yt-dlp？

yt-dlp 是一个命令行工具，可以从 YouTube、B站等 1000+ 个视频网站下载视频、音频、字幕。它是 youtube-dl 的增强版，维护更活跃，功能更多。

主要特点：
- 🎬 支持视频、音频下载
- 💬 支持字幕下载和嵌入
- 🎵 支持格式转换（MP3、MP4 等）
- 📝 批量下载、播放列表支持
- ⚡ 高度可定制，参数丰富

## 安装

### macOS
```bash
brew install yt-dlp
```

### Linux (Ubuntu/Debian)
```bash
sudo apt install yt-dlp
```

### 通用方式（需要 Python）
```bash
pip install yt-dlp
```

安装完成后，检查一下：
```bash
yt-dlp --version
```

## 快速开始

### 下载视频（最简单）

直接复制视频链接，运行命令：
```bash
yt-dlp "https://www.youtube.com/watch?v=VIDEO_ID"
```

会自动下载最佳质量的视频。

### 下载音频（MP3）

只需要音频，转换为 MP3：
```bash
yt-dlp -x --audio-format mp3 "https://www.youtube.com/watch?v=VIDEO_ID"
```

参数解释：
- `-x`：提取音频
- `--audio-format mp3`：转换为 MP3 格式

### 下载字幕

下载视频 + 字幕：
```bash
yt-dlp --write-subs --embed-subs "https://www.youtube.com/watch?v=VIDEO_ID"
```

参数解释：
- `--write-subs`：下载字幕
- `--embed-subs`：将字幕嵌入视频（可在播放器中显示）

只下载字幕，不下载视频：
```bash
yt-dlp --write-subs --skip-download "https://www.youtube.com/watch?v=VIDEO_ID"
```

## 进阶用法

### 选择视频质量

查看所有可用格式：
```bash
yt-dlp -F "https://www.youtube.com/watch?v=VIDEO_ID"
```

下载指定质量的视频（如 1080p）：
```bash
yt-dlp -f "bestvideo[height<=1080]+bestaudio" "https://www.youtube.com/watch?v=VIDEO_ID"
```

### 自定义文件名

默认的文件名可能很长，可以自定义：
```bash
yt-dlp -o "%(title)s.%(ext)s" "https://www.youtube.com/watch?v=VIDEO_ID"
```

这样文件名就是视频标题了。

### 批量下载

如果有多个视频要下载，创建一个 `urls.txt` 文件，每行一个链接：
```
https://www.youtube.com/watch?v=VIDEO_ID_1
https://www.youtube.com/watch?v=VIDEO_ID_2
https://www.youtube.com/watch?v=VIDEO_ID_3
```

然后：
```bash
yt-dlp -a urls.txt
```

### 下载播放列表

下载整个播放列表：
```bash
yt-dlp "https://www.youtube.com/playlist?list=PLAYLIST_ID"
```

只下载播放列表的前 10 个视频：
```bash
yt-dlp --playlist-end 10 "https://www.youtube.com/playlist?list=PLAYLIST_ID"
```

## 常用场景示例

### 场景 1：下载教学视频（含中文字幕）

```bash
yt-dlp -f "best[ext=mp4]" --write-subs --sub-lang zh-Hans --embed-subs "VIDEO_URL"
```

### 场景 2：下载音乐视频的音频

```bash
yt-dlp -x --audio-format mp3 -o "%(title)s.%(ext)s" "VIDEO_URL"
```

### 场景 3：下载 B站视频

```bash
yt-dlp "https://www.bilibili.com/video/BV..."
```

### 场景 4：下载视频缩略图

```bash
yt-dlp --write-thumbnail "VIDEO_URL"
```

## 常用参数速查表

| 参数 | 说明 | 示例 |
|------|------|------|
| `-f FORMAT` | 选择格式 | `yt-dlp -f best` |
| `-x` | 提取音频 | `yt-dlp -x URL` |
| `--audio-format` | 音频格式 | `yt-dlp --audio-format mp3` |
| `--write-subs` | 下载字幕 | `yt-dlp --write-subs URL` |
| `--embed-subs` | 嵌入字幕 | `yt-dlp --embed-subs URL` |
| `--skip-download` | 仅下载字幕 | `yt-dlp --skip-download URL` |
| `-o TEMPLATE` | 自定义文件名 | `yt-dlp -o "%(title)s.%(ext)s" URL` |
| `--playlist-end N` | 播放列表最多下载 N 个 | `yt-dlp --playlist-end 10 URL` |
| `--limit-rate RATE` | 限制下载速度 | `yt-dlp --limit-rate 1M URL` |

## 注意事项

### 1. 遵守法律法规
下载内容时请遵守 YouTube 和目标网站的服务条款，尊重版权。

### 2. 定期更新工具
YouTube 网站会更新，工具也可能失效，定期更新：
```bash
pip install --upgrade yt-dlp
# 或
brew upgrade yt-dlp
```

### 3. 安装 ffmpeg
处理音频/视频合并需要 ffmpeg：
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg
```

## 常见问题

### Q: 下载速度很慢？
A: 可以限制下载速度：`yt-dlp --limit-rate 1M URL`

### Q: 如何下载 4K 视频？
A: `yt-dlp -f "bestvideo[height<=2160]+bestaudio" URL`

### Q: 字幕下载失败？
A: 尝试下载自动生成的字幕：`yt-dlp --write-auto-subs URL`

### Q: 格式选择太复杂？
A: 先用 `yt-dlp -F URL` 查看所有格式，然后选择合适的格式 ID

## 总结

yt-dlp 是一个非常强大的下载工具，熟练使用后可以大幅提高效率。这里只是介绍了一些常用功能，它还有很多高级功能等待你去探索。

开始动手试试吧，有问题可以随时交流！

---

**相关资源**：
- yt-dlp GitHub: https://github.com/yt-dlp/yt-dlp
- 官方文档: https://github.com/yt-dlp/yt-dlp#readme

---

📅 发布日期：2026-03-09
🏷️ 标签：工具, YouTube, 教程, 命令行
