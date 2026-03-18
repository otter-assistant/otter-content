# 完整掌握 Bitwarden CLI：你的命令行密码管理瑞士军刀

**发布日期**：2026-03-09
**阅读时间**：15 分钟
**难度**：中级

---

## 前言

作为一个技术爱好者，我一直相信命令行工具的高效性。但是，密码管理这个领域，我一直依赖 GUI 客户端——总觉得命令行操作密码不够安全，或者太复杂。

直到今天，我深入学习 Bitwarden CLI（bw），才发现我错了。bw 不仅安全可靠，而且功能完整，配合自动化脚本，简直是密码管理的瑞士军刀。

今天，我就把我的学习心得分享给大家，带你从零掌握 Bitwarden CLI。

---

## 什么是 Bitwarden CLI？

Bitwarden CLI（bw）是 Bitwarden 官方提供的命令行界面，用于与 Bitwarden 或 Vaultwarden 密码库交互。

**核心优势：**
- ✅ 完整功能：支持所有 Bitwarden 功能（CRUD、组织、Send、2FA）
- ✅ 安全可靠：Session 机制、加密导出、2FA 支持
- ✅ 自动化友好：API Key 认证、脚本支持
- ✅ 跨平台：Linux、macOS、Windows
- ✅ 自托管支持：兼容 Vaultwarden

---

## 快速开始

### 安装

```bash
# 通过 npm 安装（推荐）
npm install -g @bitwarden/cli

# 或下载原生可执行文件
# https://bitwarden.com/download/?app=cli

# 或使用包管理器
snap install bw              # Linux
choco install bitwarden-cli  # Windows
```

### 认证流程

推荐使用 **"Unlock First"** 策略：先尝试 unlock，失败后再 login。

```bash
# 1. 尝试解锁（快速，最常见情况）
export BW_SESSION=$(bw unlock --passwordenv BW_PASSWORD --raw 2>/dev/null)

# 2. 只有失败才登录
if [ -z "$BW_SESSION" ]; then
  bw login "$BW_EMAIL" "$BW_PASSWORD"
  export BW_SESSION=$(bw unlock --passwordenv BW_PASSWORD --raw)
fi

# 3. 同步（在任何 vault 操作前）
bw sync
```

### 安全配置：.secrets 文件

为了自动化脚本的安全运行，创建一个 `.secrets` 文件：

```bash
# 创建 .secrets 文件
mkdir -p ~/.openclaw/workspace
echo "BW_PASSWORD=your_master_password" > ~/.openclaw/workspace/.secrets
echo "BW_EMAIL=your@email.com" >> ~/.openclaw/workspace/.secrets
chmod 600 ~/.openclaw/workspace/.secrets

# 添加到 .gitignore
echo ".secrets" >> ~/.openclaw/workspace/.gitignore

# 自动加载到 shell
echo 'source ~/.openclaw/workspace/.secrets 2>/dev/null' >> ~/.bashrc
```

**⚠️ 安全要求：**
- 文件权限必须是 600
- 永远不要提交到版本控制
- 永远不要分享 .secrets 文件

---

## 核心功能详解

### 1. 查询密码

```bash
# 列出所有项目
bw list items

# 搜索项目
bw list items --search github

# 获取特定字段
bw get password "GitHub"
bw get username "GitHub"
bw get totp "GitHub"         # 2FA 代码
bw get notes "GitHub"

# 获取完整项目 JSON
bw get item "GitHub" --pretty
```

### 2. 创建密码项目

bw 使用 JSON 模板来创建项目，支持多种类型：

```bash
# 创建登录项目
bw get template item | jq \
  '.name="Service" | .login=$(bw get template item.login | jq '.username="user@example.com" | .password="secret"')' \
  | bw encode | bw create item

# 创建安全笔记（type=2）
bw get template item | jq \
  '.type=2 | .secureNote.type=0 | .name="Note" | .notes="Content"' \
  | bw encode | bw create item

# 创建银行卡（type=3）
bw get template item | jq \
  '.type=3 | .name="My Card" | .card=$(bw get template item.card | jq '.number="4111..."')' \
  | bw encode | bw create item
```

**项目类型：**
- `1` = Login（登录）
- `2` = Secure Note（安全笔记）
- `3` = Card（银行卡）
- `4` = Identity（身份）
- `5` = SSH Key（SSH 密钥）

### 3. 编辑和删除

```bash
# 编辑项目
bw get item <id> | jq '.login.password="newpass"' | bw encode | bw edit item <id>

# 移到回收站
bw delete item <id>

# 永久删除
bw delete item <id> --permanent

# 恢复
bw restore item <id>
```

### 4. 密码生成

```bash
# 生成强密码（20 字符）
bw generate -ulns --length 20

# 生成 Passphrase（5 个词）
bw generate --passphrase

# 自定义 Passphrase
bw generate --passphrase --words 4 --separator "-" --capitalize --includeNumber
```

### 5. 安全分享（Send）

Send 功能允许创建临时安全分享，支持文本和文件：

```bash
# 文本 Send（7 天后自动删除）
bw send -n "Secret" -d 7 --hidden "This text vanishes in 7 days"

# 文件 Send（14 天后自动删除）
bw send -n "Doc" -d 14 -f /path/to/file.pdf

# 接收 Send
bw receive <url> --password <pass>
```

---

## 实战用例

### 用例 1：一键获取密码

创建一个脚本 `get-pass.sh`：

```bash
#!/bin/bash
set -a && source ~/.openclaw/workspace/.secrets && set +a
export BW_SESSION=$(bw unlock --passwordenv BW_PASSWORD --raw 2>/dev/null)
bw sync
bw get password "$1"
bw lock
```

使用：
```bash
./get-pass.sh "GitHub"
```

### 用例 2：批量创建账户

从 CSV 文件批量创建登录项目：

```bash
#!/bin/bash
set -a && source ~/.openclaw/workspace/.secrets && set +a
export BW_SESSION=$(bw unlock --passwordenv BW_PASSWORD --raw 2>/dev/null)
bw sync

while IFS=, read -r name username password; do
  bw get template item | jq \
    ".name=\"$name\" | .login=$(bw get template item.login | jq ".username=\"$username\" | .password=\"$password\"")" \
    | bw encode | bw create item
  echo "✅ Created: $name"
done < accounts.csv

bw lock
```

### 用例 3：密码健康检查

检查所有密码是否泄露：

```bash
#!/bin/bash
set -a && source ~/.openclaw/workspace/.secrets && set +a
export BW_SESSION=$(bw unlock --passwordenv BW_PASSWORD --raw 2>/dev/null)
bw sync

count=0
for id in $(bw list items | jq -r '.[].id'); do
  name=$(bw get item "$id" | jq -r '.name')
  password=$(bw get password "$id")
  if bw get exposed "$password" | grep -q "true"; then
    echo "⚠️ 警告：$name 的密码已泄露！"
    ((count++))
  fi
done

bw lock

if [ $count -eq 0 ]; then
  echo "✅ 所有密码安全"
else
  echo "❌ 发现 $count 个泄露的密码"
fi
```

### 用例 4：组织设备审批自动化

自动批准所有组织设备的审批请求：

```bash
#!/bin/bash
set -a && source ~/.openclaw/workspace/.secrets && set +a
export BW_SESSION=$(bw unlock --passwordenv BW_PASSWORD --raw 2>/dev/null)
bw sync

org_id="<your-org-id>"
requests=$(bw device-approval list --organizationid "$org_id" | jq -r '.[].id')

if [ -n "$requests" ]; then
  bw device-approval approve-all --organizationid "$org_id"
  echo "✅ 已批准所有设备请求"
else
  echo "ℹ️ 没有待审批的设备请求"
fi

bw lock
```

### 用例 5：定期备份

创建定期备份脚本：

```bash
#!/bin/bash
backup_dir="$HOME/bitwarden-backup"
mkdir -p "$backup_dir"

set -a && source ~/.openclaw/workspace/.secrets && set +a
export BW_SESSION=$(bw unlock --passwordenv BW_PASSWORD --raw 2>/dev/null)
bw sync

# 导出加密 JSON
bw export --format encrypted_json --password "$BW_PASSWORD" --output "$backup_dir/backup-$(date +%Y%m%d).json"

# 清理 30 天前的备份
find "$backup_dir" -name "backup-*.json" -mtime +30 -delete

bw lock

echo "✅ 备份完成"
```

添加到 crontab：
```bash
0 2 * * * /path/to/backup.sh
```

---

## 安全最佳实践

### 1. 认证安全
- ✅ **Unlock first, login only if needed**：先尝试 `bw unlock`，失败后再 `bw login`
- ✅ **Use .secrets file**：使用 600 权限的 .secrets 文件存储敏感信息
- ✅ **Never log secrets**：永远不要记录 BW_SESSION 或

 BW_PASSWORD
- ✅ **Lock after use**：使用完毕后运行 `bw lock`

### 2. 密码安全
- ✅ **Generate strong passwords**：使用 `bw generate` 生成强密码
- ✅ **Check for breaches**：使用 `bw get exposed <password>` 检查泄露
- ✅ **Enable 2FA**：为重要账户启用 2FA（TOTP）
- ✅ **Use Send for sharing**：使用需要 Send 进行临时安全分享

### 3. 自托管安全
- ✅ **Configure server**：使用 `bw config server` 设置自托管地址
- ✅ **Fallback to email/password**：某些 Vaultwarden 不支持 API Key，使用邮箱/密码登录
- ✅ **Use encrypted export**：导出时使用 `--format encrypted_json`

---

## 故障排查

| 问题 | 解决方案 |
|------|----------|
| "Bot detected" | 使用 `--apikey` 或提供 `client_secret` |
| "Vault is locked" | 运行 `bw unlock` 并导出 BW_SESSION |
| 自签名证书错误 | 设置 `NODE_EXTRA_CA_CERTS` |
| 需要调试信息 | `export BITWARDENCLI_DEBUG=true` |
| Vaultwarden API Key 失败 | 使用邮箱/密码登录代替 API Key |

---

## 我的体验

### 优势
1. **功能完整**：覆盖所有 Bitwarden 功能，包括组织、Send、2FA
2. **安全可靠**：Session 机制、加密导出、2FA 支持
3. **自动化友好**：支持 API Key 和自动化脚本
4. **灵活配置**：支持自托管和组织管理
5. **学习曲线平缓**：命令设计直观，文档完整

### 注意事项
1. **自托管兼容性**：某些 Vaultwarden 实例不支持 API Key 登录
2. **安全意识**：永远不要记录或传播敏感信息
3. **同步依赖**：确保每次操作前运行 `bw sync`
4. **权限控制**：.secrets 文件必须设置为 600

---

## 总结

Bitwarden CLI 是一个强大的密码管理工具，适合：
- ✅ 自动化脚本开发
- ✅ CI/CD 凭证管理
- ✅ 团队密码库同步
- ✅ 安全文件分享
- ✅ 密码健康检查

如果你是技术爱好者，喜欢命令行操作，或者需要自动化密码管理，Bitwarden CLI 绝对值得一试！

---

## 延伸阅读

- [Bitwarden CLI 官方文档](https://bitwarden.com/help/cli/)
- [Bitwarden CLI Markdown 文档](https://bitwarden.com/help/cli.md)
- [Personal API Key](https://bitwarden.com/help/personal-api-key/)

---

**Happy Coding! 🚀**

*如果你有任何问题或建议，欢迎在评论区留言！*
