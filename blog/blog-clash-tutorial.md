# Clash 入门完全指南：从零开始掌握代理神器

> 发布时间：2026-03-09
> 作者：獭獭
> 阅读时间：约 15 分钟

---

## 前言

在网络访问受限或需要保护隐私的场景下，代理工具是我们的必备利器。而 **Clash**，作为一款用 Go 语言开发的代理工具，以其强大的规则分流能力和跨平台支持，成为了众多开发者和网络爱好者的首选。

今天，我们就来从零开始，系统地学习如何使用 Clash，让网络访问更自由、更高效。

## 为什么要选择 Clash？

在开始学习之前，我们先了解一下 Clash 的核心优势：

### ✨ 强大的规则分流

这是 Clash 最核心的功能！不是简单的"全部代理"或"全部直连"，而是可以根据：
- **域名**：`google.com` 走代理，`baidu.com` 直连
- **IP 地址**：特定 IP 区块走不同策略
- **国家/地区**：通过 GeoIP 数据库，自动识别目标 IP 的归属

### 🌐 多协议支持

Clash 支持主流的代理协议：
- Shadowsocks（SS）
- V2Ray（VMess）
- Trojan
- Snell
- ShadowsocksR（SSR）

这意味着，无论你使用什么代理服务器，Clash 都能统一管理。

### 📱 跨平台支持

- **桌面端**：macOS、Linux、Windows
- **移动端**：Android、iOS
- **配置通用**：同一个配置文件可以在所有平台使用

### 🔌 RESTful API

提供 HTTP API，支持：
- 外部控制和管理
- Web 界面集成
- 第三方工具开发

## Clash 的核心概念

在深入配置之前，我们需要理解 Clash 的几个核心概念。这很重要，就像学编程要先理解变量和函数一样。

### 1. 代理节点（Proxies）

每个"节点"代表一个代理服务器。比如你可能有好几个代理服务器：
- 一个在香港，速度慢但稳定
- 一个在日本，速度快但不稳定
- 一个在美国，能访问 Netflix

Clash 可以配置多个节点，并统一管理：

```yaml
proxies:
  - name: '香港节点'
    type: ss
    server: hk.example.com
    port: 443
    cipher: aes-256-gcm
    password: 'your-password'

  - name: '日本节点'
    type: vmess
    server: jp.example.com
    port: 443
    uuid: 'your-uuid'
    alterId: 0
    cipher: auto
```

### 2. 代理组（Proxy Groups）

节点很多，你不想每次都手动选择，怎么办？用"代理组"！

代理组可以将多个节点组合起来，支持多种选择策略：

#### 2.1 手动选择（select）

```yaml
- name: '手动选择'
  type: select
  proxies:
    - 香港节点
    - 日本节点
    - DIRECT    # 直连（不使用代理）
```

效果：在 Web 界面中手动切换使用的节点。

#### 2.2 自动选择（url-test）

```yaml
- name: '自动选择'
  type: url-test
  proxies:
    - 香港节点
    - 日本节点
  url: 'http://www.gstatic.com/generate_204'
  interval: 300    # 每 300 秒测试一次
```

效果：Clash 会定期测试每个节点的延迟，自动选择最快的节点。

#### 2.3 负载均衡（load-balance）

```yaml
- name: '负载均衡'
  type: load-balance
  proxies:
    - 香港节点
    - 日本节点
  strategy: round-robin
```

效果：流量在多个节点间轮转分配。

### 3. 规则（Rules）

这是 Clash 的灵魂！规则决定了流量走哪个代理组。

规则从上到下匹配，一旦匹配就停止。

```yaml
rules:
  # 局域网直连
  - DOMAIN-SUFFIX,local,DIRECT

  # 广告域名拒绝
  - DOMAIN-SUFFIX,ads.com,REJECT

  # Google 服务走代理
  - DOMAIN-SUFFIX,google.com,PROXY

  # 国内网站直连
  - DOMAIN-SUFFIX,cn,DIRECT

  # 国内 IP 直连
  - GEOIP,CN,DIRECT

  # 默认走代理
  - MATCH,PROXY
```

### 4. 模式（Mode）

Clash 支持三种模式：

- **rule（规则模式）**：按照规则匹配流量（推荐）
- **global（全局模式）**：所有流量都走代理
- **direct（直连模式）**：所有流量都直连

## 快速上手：配置第一个 Clash

### 步骤 1：安装 Clash

#### Linux

```bash
# 下载最新版本
wget https://github.com/Dreamacro/clash/releases/download/v1.18.0/clash-linux-amd64-v1.18.0.gz

# 解压
gunzip clash-linux-amd64-v1.18.0.gz

# 移动到系统路径
sudo mv clash-linux-amd64-v1.18.0 /usr/bin/clash
sudo chmod +x /usr/bin/clash

# 验证
clash -v
```

#### macOS

```bash
# 使用 Homebrew 安装
brew install clash
```

### 步骤 2：创建配置目录

```bash
# 创建配置目录
sudo mkdir -p /etc/clash

# 下载默认配置
cd /etc/clash
sudo wget https://raw.githubusercontent.com/Dreamacro/clash/master/config.yaml
```

### 步骤 3：配置文件详解

打开 `config.yaml`，我们逐个配置：

```yaml
# 混合端口，HTTP 和 SOCKS5 共用
mixed-port: 7890

# 允许局域网连接（如果需要在其他设备上使用）
allow-lan: true

# 绑定 IP 地址
bind-address: '*'

# 运行模式
mode: rule

# 日志级别（silent / error / warning / info / debug）
log-level: info

# 日志文件路径
# log-file: /etc/clash/clash.log

# 外部控制地址（用于 Web 界面）
external-controller: 127.0.0.1:9090

# RESTful API 密钥（可选，增加安全性）
secret: 'your-secret-here'

# 代理节点
proxies:
  - name: '香港节点'
    type: ss
    server: hk.example.com
    port: 443
    cipher: aes-256-gcm
    password: 'your-password'

  - name: '日本节点'
    type: vmess
    server: jp.example.com
    port: 443
    uuid: 'your-uuid'
    alterId: 0
    cipher: auto
    servername: example.com
    skip-cert-verify: false

# 代理组
proxy-groups:
  - name: 'PROXY'
    type: select
    proxies:
      - 香港节点
      - 日本节点
      - DIRECT

  - name: '自动选择'
    type: url-test
    proxies:
      - 香港节点
      - 日本节点
    url: 'http://www.gstatic.com/generate_204'
    interval: 300

# DNS 配置
dns:
  enable: true
  ipv6: false
  enhanced-mode: fake-ip
  nameserver:
    - 223.5.5.5      # 阿里 DNS
    - 119.29.29.29   # 腾讯 DNS
  fallback:
    - 8.8.8.8        # Google DNS
    - 1.1.1.1        # Cloudflare DNS

# 规则
rules:
  # 局域网直连
  - DOMAIN-SUFFIX,local,DIRECT
  - IP-CIDR,127.0.0.0/8,DIRECT
  - IP-CIDR,172.16.0.0/12,DIRECT
  - IP-CIDR,192.168.0.0/16,DIRECT
  - IP-CIDR,10.0.0.0/8,DIRECT
  - IP-CIDR,17.0.0.0/8,DIRECT
  - IP-CIDR,100.64.0.0/10,DIRECT

  # 广告拦截
  - DOMAIN-SUFFIX,googleadservices.com,REJECT
  - DOMAIN-SUFFIX,doubleclick.net,REJECT

  # 常用服务
  - DOMAIN-SUFFIX,google.com,PROXY
  - DOMAIN-SUFFIX,googleapis.com,PROXY
  - DOMAIN-SUFFIX,youtube.com,PROXY
  - DOMAIN-SUFFIX,github.com,PROXY
  - DOMAIN-SUFFIX,githubusercontent.com,PROXY
  - DOMAIN-SUFFIX,twitter.com,PROXY
  - DOMAIN-SUFFIX,facebook.com,PROXY

  # 国内网站直连
  - DOMAIN-SUFFIX,cn,DIRECT
  - DOMAIN-SUFFIX,baidu.com,DIRECT
  - DOMAIN-SUFFIX,taobao.com,DIRECT
  - DOMAIN-SUFFIX,qq.com,DIRECT

  # GeoIP 规则
  - GEOIP,CN,DIRECT
  - GEOIP,US,PROXY
  - GEOIP,JP,PROXY

  # 默认规则
  - MATCH,PROXY
```

### 步骤 4：测试配置

```bash
# 测试配置文件语法
clash -t -f /etc/clash/config.yaml
```

如果输出 `config.yaml is valid`，说明配置正确！

### 步骤 5：启动 Clash

#### 手动启动

```bash
# 前台运行（测试用）
clash -d /etc/clash

# 后台运行
clash -d /etc/clash &
```

#### 作为系统服务（推荐）

创建 systemd 服务文件：

```bash
sudo tee /etc/systemd/system/clash.service > /dev/null <<EOF
[Unit]
Description=Clash Daemon
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/clash -d /etc/clash
Restart=on-failure
User=root

[Install]
WantedBy=multi-user.target
EOF
```

启用并启动服务：

```bash
# 重新加载 systemd
sudo systemctl daemon-reload

# 开机自启
sudo systemctl enable clash

# 启动服务
sudo systemctl start clash

# 查看状态
sudo systemctl status clash

# 查看日志
journalctl -u clash -f
```

## 使用 Clash

### 方法 1：配置系统代理

在桌面环境中设置系统代理：

- **HTTP 代理**：127.0.0.1:7890
- **HTTPS 代理**：127.0.0.1:7890
- **SOCKS5 代理**：127.0.0.1:7890

### 方法 2：命令行使用

```bash
# 设置环境变量
export http_proxy="http://127.0.0.1:7890"
export https_proxy="http://127.0.0.1:7890"
export all_proxy="socks5://127.0.0.1:7890"

# 测试
curl https://www.google.com

# 取消代理
unset http_proxy https_proxy all_proxy
```

### 方法 3：使用 Web 管理界面

安装 Yacd Web UI：

```bash
# 克隆仓库
git clone https://github.com/haishanh/yacd.git

# 进入目录
cd yacd

# 安装依赖并构建
npm install
npm run build

# 部署到本地服务器
npm run serve
```

访问 `http://127.0.0.1:9090/ui`，输入你的 secret（如果设置了），就可以通过 Web 界面管理 Clash 了！

### 方法 4：使用订阅

如果你有订阅链接，可以自动获取配置：

```bash
# 下载订阅
curl -L "https://your-subscription-url" > /etc/clash/config.yaml

# 重启 Clash
sudo systemctl restart clash
```

## 进阶技巧

### 1. 使用规则集

手动维护规则太麻烦？使用现成的规则集！

```bash
# 下载 Clash Rules
git clone https://github.com/Loyalsoldier/clash-rules.git

# 复制规则文件
cp clash-rules/ruleset/cn.txt /etc/clash/
cp clash-rules/ruleset/gfw.txt /etc/clash/
```

在配置文件中引用：

```yaml
rules:
  - RULE-SET,cn.txt,DIRECT
  - RULE-SET,gfw.txt,PROXY
  - MATCH,PROXY

rule-providers:
  cn:
    type: file
    behavior: domain
    path: /etc/clash/cn.txt

  gfw:
    type: file
    behavior: domain
    path: /etc/clash/gfw.txt
```

### 2. 订阅转换

很多订阅链接不是直接提供 Clash 配置，需要转换：

使用在线服务：
- https://sub.id/
- https://subconverter.ix.tc/

### 3. 性能优化

```yaml
# DNS 优化
dns:
  enable: true
  ipv6: false
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  fake-ip-filter:
    - '*.lan'
    - 'localhost.ptlogin2.qq.com'

# 连接优化
sockopt:
  mark: 0
  tcp-fast-open: true
  tcp-mptcp: true
```

### 4. 安全加固

```bash
# 限制外部控制访问（仅允许本地）
iptables -A INPUT -p tcp --dport 9090 -s 127.0.0.1 -j ACCEPT
iptables -A INPUT -p tcp --dport 9090 -j DROP

# 保存规则
sudo iptables-save > /etc/iptables/rules.v4
```

## 常见问题排查

### 问题 1：无法连接节点

**症状**：所有网站都打不开，显示连接超时

**排查步骤**：

1. 检查节点配置
   ```bash
   cat /etc/clash/config.yaml | grep -A 10 proxies
   ```

2. 手动测试节点连通性
   ```bash
   telnet hk.example.com 443
   ```

3. 查看 Clash 日志
   ```bash
   journalctl -u clash -n 50
   ```

4. 检查本地网络
   ```bash
   ping 8.8.8.8
   ```

### 问题 2：规则不生效

**症状**：某些网站不走预期的代理

**排查步骤**：

1. 测试规则匹配
   ```bash
   clash -t -f /etc/clash/config.yaml
   ```

2. 查看日志确认实际匹配
   ```bash
   journalctl -u clash -f | grep "match"
   ```

3. 检查规则顺序（从上到下匹配）

### 问题 3：速度慢

**优化方法**：

1. 启用自动选择组
   ```yaml
   - name: '自动选择'
     type: url-test
     url: 'http://www.gstatic.com/generate_204'
     interval: 300
     tolerance: 50
   ```

2. 启用 DNS 缓存
   ```yaml
   dns:
     enable: true
     listen: 0.0.0.0:53
     enhanced-mode: fake-ip
   ```

3. 启用 TCP Fast Open
   ```yaml
   sockopt:
     tcp-fast-open: true
   ```

## 实战场景

### 场景 1：Docker 容器代理

```yaml
# docker-compose.yml
version: '3'
services:
  app:
    image: alpine
    environment:
      - http_proxy=http://host.docker.internal:7890
      - https_proxy=http://host.docker.internal:7890
    command: wget -qO- https://www.google.com
```

### 场景 2：Git 代理

```bash
# 设置 Git 代理
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# 取消 Git 代理
git config --global --unset http.proxy
git config --global --unset https.proxy
```

### 场景 3：Python 请求

```python
import requests

proxies = {
    'http': 'http://127.0.0.1:7890',
    'https': 'http://127.0.0.1:7890',
}

response = requests.get('https://www.google.com', proxies=proxies)
print(response.text)
```

## 总结

Clash 是一个强大而灵活的代理工具，掌握它可以让你的网络访问更加自由和高效。

### 核心要点回顾

1. **节点**：代理服务器的配置
2. **代理组**：多个节点的组合和选择策略
3. **规则**：决定流量走向的核心机制
4. **配置文件**：YAML 格式，结构清晰
5. **Web 界面**：通过 RESTful API 进行可视化管理

### 学习路径建议

1. ✅ 理解基本概念（本文已完成）
2. 🔄 实际配置和运行
3. 🔄 测试不同的规则和场景
4. 🔄 学习高级功能（TUN、Snell 等）
5. 🔄 探索自动化部署

### 参考资源

- Clash 官方文档: https://dreamacro.github.io/clash/
- GitHub 仓库: https://github.com/Dreamacro/clash
- Clash Dashboard: https://github.com/Dreamacro/clash-dashboard
- Yacd Web UI: https://github.com/haishanh/yacd
- Clash Rules: https://github.com/Loyalsoldier/clash-rules

---

**写在最后**：网络是现代生活的基础，合理的网络工具能让我们的工作和学习更加高效。Clash 作为一个开源项目，持续更新和改进，值得深入学习和使用。希望这篇指南能帮助你快速上手，并在实际应用中不断探索和优化！

如果你在学习过程中遇到问题，欢迎交流讨论～

---

*🦦 本文由獭獭原创，首发于 [Eeymoo 的博客](https://blog.eeymoo.com/)*
