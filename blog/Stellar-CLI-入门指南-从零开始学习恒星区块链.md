# Stellar CLI 入门指南：从零开始学习恒星区块链

> 本文详细介绍如何使用 Stellar CLI 进行账户管理、交易发送和智能合约部署。适合区块链开发者和对 Stellar 感兴趣的技术爱好者。

---

## 🌟 什么是 Stellar？

Stellar 是一个去中心化的支付网络，用于快速、低成本的跨货币转账。它的原生代币是 **XLM (Lumens)**，并支持智能合约平台 **Soroban**。

### 核心优势

- ⚡ **快速交易**：3-5 秒确认
- 💰 **低费用**：0.00001 XLM 起步
- 🔗 **多币种支持**：原生支持法币和加密货币
- 🧠 **智能合约**：Soroban 提供强大的链上逻辑能力

---

## 🛠️ 安装 Stellar CLI

### 前置要求

- Node.js 18+ 或最新版本
- npm 或 yarn

### 安装步骤

```bash
# 使用 npm 安装
npm install -g @stellar/cli

# 或使用 yarn
yarn global add @stellar/cli

# 验证安装
stellar --version
```

---

## 📋 快速开始

### 1. 网络配置

Stellar 支持三个网络：

| 网络 | 说明 | 用途 |
|------|------|------|
| `testnet` | 测试网络 | 开发测试（免费注资） |
| `public` | 主网 | 生产环境 |
| `futurenet` | 未来网络 | 新功能测试 |

```bash
# 切换到测试网
stellar network use testnet

# 查看当前网络
stellar network show
```

### 2. 密钥管理

```bash
# 生成新的密钥对
stellar keys generate alice

# 查看所有密钥
stellar keys list

# 获取公钥地址
stellar keys address alice

# 设置当前使用的密钥
stellar keys use alice
```

### 3. 账户注资（仅 Testnet）

```bash
# 为账户注入测试代币（每次 10,000 XLM）
stellar keys fund alice
```

---

## 💸 发送支付

### 步骤：Alice 向 Bob 发送 100 XLM

```bash
# 1. 生成 Bob 的密钥并注资
stellar keys generate bob
stellar keys fund bob

# 2. 获取 XLM 资产合约 ID
ASSET_CONTRACT_ID=$(stellar contract id asset --asset native)

# 3. 获取 Bob 的地址
BOB_ADDRESS=$(stellar keys address bob)

# 4. 发送支付
stellar keys use alice
stellar contract invoke \
  --id $ASSET_CONTRACT_ID \
  -- transfer \
  --to $BOB_ADDRESS \
  --from alice \
  --amount 100
```

### 查询余额

```bash
# 查询 Bob 的余额
stellar contract invoke \
  --id $ASSET_CONTRACT_ID \
  -- balance \
  --id $BOB_ADDRESS
```

---

## 🧠 智能合约管理

### 编译合约

```bash
# 编译 Soroban 智能合约
stellar contract build
```

### 上传合约

```bash
# 上传 WASM 字节码
stellar contract upload \
  --wasm target/wasm/contract.wasm \
  --source <PUBLIC_KEY>
```

### 部署合约

```bash
# 部署合约实例
stellar contract deploy \
  --wasm-id <WASM_HASH> \
  --source <PUBLIC_KEY> \
  -- <INIT_ARGS>
```

### 调用合约

```bash
# 调用合约函数
stellar contract invoke \
  --id <CONTRACT_ID> \
  -- <FUNCTION_NAME> \
  -- <ARGS>
```

---

## 🔑 高级功能

### TTL（生存时间）管理

Stellar 上的数据有 TTL，需要定期延长：

```bash
# 延长合约实例 TTL
stellar contract extend \
  --id <CONTRACT_ID> \
  --instance-ttl 1000000

# 延长合约存储 TTL
stellar contract extend \
  --id <CONTRACT_ID> \
  --all-entries-ttl 1000000

# 延长合约 WASM TTL
stellar contract extend \
  --wasm-id <WASM_HASH> \
  --wasm-ttl 1000000
```

### 发行自定义资产

```bash
# 1. 部署资产合约
stellar contract deploy \
  --wasm-id <TOKEN_WASM_HASH> \
  --source <ISSUER_PUBLIC_KEY> \
  --asset MYTOKEN:<ISSUER_PUBLIC_KEY>

# 2. 铸造资产
stellar contract invoke \
  --id <ASSET_CONTRACT_ID> \
  -- mint \
  --to <RECIPIENT> \
  --amount 1000

# 3. 销毁资产
stellar contract invoke \
  --id <ASSET_CONTRACT_ID> \
  -- burn \
  --from <HOLDER> \
  --amount 500
```

---

## 🔗 参考资源

- [Stellar 官方文档](https://developers.stellar.org/docs)
- [Stellar CLI 参考手册](https://developers.stellar.org/docs/tools/cli/stellar-cli)
- [Stellar CLI Cookbook](https://developers.stellar.org/docs/tools/cli/cookbook)
- [Soroban 开发指南](https://developers.stellar.org/docs/build/smart-contracts)

---

## 💡 最佳实践

1. **始终从 Testnet 开始**：避免损失真实资产
2. **妥善保管私钥**：不要将私钥分享给他人
3. **注意 TTL**：定期延长合约和存储的 TTL
4. **错误处理**：所有操作都可能失败，做好重试机制
5. **费用优化**：大规模应用需优化交易成本

---

## 🎯 总结

Stellar CLI 是开发 Stellar 应用的强大工具，提供以下核心能力：

- ✅ 密钥管理和账户配置
- ✅ 快速交易发送
- ✅ 智能合约编译、上传和部署
- ✅ 资产发行和管理
- ✅ TTL 和生命周期管理

无论你是构建支付应用、智能合约，还是探索区块链技术，Stellar CLI 都是你的最佳起点。

---

**发布日期**: 2026-03-09  
**标签**: Stellar, Blockchain, CLI, Soroban, XLM
