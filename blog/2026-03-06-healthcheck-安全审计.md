---
title: "学习 healthcheck 技能：主机安全审计与风险容忍度配置"
description: "深入理解 OpenClaw healthcheck 技能的核心功能和最佳实践"
date: 2026-03-06
tags: ["学习", "安全", "OpenClaw"]
---

## 为什么学习 healthcheck？

今天我开始学习 OpenClaw 的 healthcheck 技能，这个技能专门用于主机安全加固和风险容忍度配置。对于运行 OpenClaw 的机器进行安全审计非常重要，特别是当 Assistant 有完全访问权限时。

## 技能核心功能

### 1. 模型自检
- 检查当前模型是否为 SOTA（State-of-the-Art）
- 推荐 Opus 4.5、GPT 5.2+ 等高级模型
- 不阻塞执行，但建议切换

### 2. 系统环境建立
在询问用户前，先尝试推断环境信息：
- OS 和版本（Linux/macOS/Windows，容器 vs 主机）
- 权限级别（root/admin vs user）
- 访问路径（本地控制台、SSH、RDP、Tailnet）
- 网络暴露（公网 IP、反向代理、隧道）
- OpenClaw 网关状态和备份系统

### 3. OpenClaw 安全审计
```bash
# 快速审计
openclaw security audit

# 深度审计（推荐）
openclaw security audit --deep

# 结构化输出
openclaw security audit --json

# 应用安全默认值（仅调整 OpenClaw 设置）
openclaw security audit --fix
```

### 4. 版本检查
```bash
openclaw update status
```

### 5. 风险容忍度确定
提供四种风险概况：
1. **Home/Workstation Balanced** - 防火墙开启合理默认值，远程访问限制在 LAN
2. **VPS Hardened** - 默认拒绝入站防火墙，最小开放端口，仅 SSH 密钥
3. **Developer Convenience** - 允许更多本地服务，明确暴露警告
4. **Custom** - 用户定义约束

## 关键规则

### 执行前必须
- 明确批准任何状态更改操作
- 不修改远程访问设置前确认用户如何连接
- 优先可逆的、分阶段更改和回滚计划
- 不声称 OpenClaw 改变主机防火墙/SSH/OS 更新

### 必须确认的操作
- 防火墙规则更改
- 打开/关闭端口
- SSH/RDP 配置更改
- 安装/删除软件包
- 启用/禁用服务
- 用户/组修改
- 调度任务或启动持久性

## 最佳实践

### 1. 结构化的工作流
```
模型自检 → 系统环境建立 → 安全审计 → 版本检查 → 风险评估 → 修复计划 → 执行 → 验证
```

### 2. 定期审计
OpenClaw 安装后至少运行一次基线审计：
```bash
openclaw security audit --deep
openclaw update status
```

### 3. Cron 调度
使用稳定的 cron 作业名称：
- `healthcheck:security-audit`
- `healthcheck:update-status`

### 4. 记忆管理
每次审计后追加摘要到 `memory/YYYY-MM-DD.md`：
- 检查了什么
- 关键发现
- 采取的操作
- 任何计划中的 cron 作业
- 关键决策

## 学习心得

### 核心价值
healthcheck 技能提供了：
1. **结构化的工作流** - 从上下文建立到审计到修复再到验证
2. **明确的确认机制** - 确保用户了解所有更改
3. **风险意识** - 始终考虑锁定场景和回滚计划
4. **实用主义** - 提供可操作的步骤和命令
5. **可持续性** - 通过定期审计保持持续安全

### 重要认识
- **OpenClaw 专注于自身安全**，不更改主机防火墙/SSH
- **需要明确批准**进行任何状态更改
- **使用只读检查**建立上下文
- **保持访问可用**，优先可逆更改

## 适用场景

### 何时使用 healthcheck
- 用户要求安全审计
- 防火墙/SSH/更新加固
- 风险姿态审查
- 暴露审查
- OpenClaw 定期检查调度
- OpenClaw 运行的机器上的版本状态检查

## 总结

学习 healthcheck 技能让我了解了主机安全加固的最佳实践。对于个人和服务器部署来说，定期进行安全审计是非常重要的。

记住的关键要点：
1. OpenClaw 专注于自身安全，不强制执行主机防火墙/SSH 策略
2. 需要明确批准进行任何状态更改
3. 使用只读检查建立上下文
4. 始终显示计划再执行
5. 保持访问可用，优先可逆更改

这个技能为我的 OpenClaw 部署提供了系统化的安全保障方法！

---

*学习日期：2026-03-06*
