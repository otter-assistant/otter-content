# Azure CLI 入门完全指南：从零开始掌握 Azure 命令行工具

> 作为一名开发者或运维工程师，你可能经常需要管理 Azure 云资源。Azure CLI（Command-Line Interface）是微软提供的跨平台命令行工具，能让你通过简单的命令高效地管理所有 Azure 资源。本文将带你从零开始掌握 Azure CLI。

---

## 🌟 为什么选择 Azure CLI？

在开始之前，你可能会问：为什么要学习 Azure CLI？

### ✨ 核心优势

| 特性 | Azure CLI | 说明 |
|------|-----------|------|
| **跨平台** | ✅ | Windows、Linux、macOS 全支持 |
| **自动化友好** | ✅ | 脚本编写简单，适合 CI/CD |
| **一致性** | ✅ | 所有 Azure 服务使用统一的命令结构 |
| **开源** | ✅ | 社区活跃，文档完善 |
| **学习曲线** | ⭐⭐⭐ | 对 Linux 用户非常友好 |
| **Cloud Shell** | ✅ | 无需安装，浏览器直接使用 |

### 🎯 适用场景

- 🚀 **快速原型开发**：快速创建和测试 Azure 资源
- 🔧 **DevOps 自动化**：集成到 CI/CD 流程
- 📊 **批量管理**：同时管理多个资源
- 🖥️ **命令行偏好者**：习惯使用终端操作

---

## 🚀 第一步：安装与配置

### 方式一：Azure Cloud Shell（推荐新手）

最快的方式是使用 Azure Cloud Shell，无需任何安装！

1. 访问 [https://shell.azure.com](https://shell.azure.com)
2. 选择 Bash 或 PowerShell
3. 开始使用！

> 💡 **提示**：Cloud Shell 预装了最新版本的 Azure CLI，还提供 5GB 的持久化存储。

### 方式二：本地安装

#### Windows 用户

```powershell
# 使用 winget 安装（推荐）
winget install Microsoft.AZCLI

# 或使用 MSI 安装包
# 访问 https://aka.ms/installazurecliwindows
```

#### Linux 用户

```bash
# Ubuntu/Debian
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# RHEL/CentOS
sudo rpm curl -sL https://aka.ms/InstallAzureCLIRpm | sudo bash
```

#### macOS 用户

```bash
# 使用 Homebrew（推荐）
brew update && brew install azure-cli

# 或手动安装
brew update
brew install azure-cli
```

#### Docker 用户

```bash
docker run -it mcr.microsoft.com/azure-cli
```

### 验证安装

```bash
az version
```

你应该会看到类似这样的输出：

```json
{
  "azure-cli": "2.56.0",
  "azure-cli-core": "2.56.0",
  "azure-cli-telemetry": "1.1.0",
  "extensions": {}
}
```

---

## 🔐 第二步：登录 Azure

### 交互式登录（最简单）

```bash
az login
```

1. 命令会打开你的默认浏览器
2. 登录你的 Azure 账户
3. 授权 Azure CLI 访问

登录成功后，你会看到订阅列表：

```json
[
  {
    "cloudName": "AzureCloud",
    "homeTenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "isDefault": true,
    "name": "我的订阅",
    "state": "Enabled",
    "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "user": {
      "name": "yourname@example.com",
      "type": "user"
    }
  }
]
```

### 服务主体登录（适合自动化）

对于 CI/CD 或自动化脚本，使用服务主体更安全：

```bash
az login --service-principal \
  --username APP_ID \
  --password CLIENT_SECRET \
  --tenant TENANT_ID
```

### 托管标识登录（适合 Azure 资源）

如果你的脚本运行在 Azure 资源（如 VM、Function App）中，可以使用托管标识：

```bash
az login --identity
```

### 设备代码登录（无浏览器环境）

在没有浏览器的环境中：

```bash
az login --use-device-code
```

终端会显示一个代码，你需要在另一个设备上访问 [https://aka.ms/devicelogin](https://aka.ms/devicelogin) 并输入该代码。

---

## 📖 第三步：理解命令结构

### 基本语法

Azure CLI 的命令结构非常直观：

```
az <命令组> <子命令组> <命令> --参数
```

### 示例解析

```bash
az storage account create --name mystorage --resource-group MyRG
```

分解：

- `az` - Azure CLI 前缀
- `storage` - 命令组（存储服务）
- `account` - 子命令组（存储账户）
- `create` - 命令（创建操作）
- `--name mystorage` - 参数（指定名称）
- `--resource-group MyRG` - 参数（指定资源组）

### 常用命令组速查

| 命令组 | 功能 | 常用子命令 |
|--------|------|-----------|
| `az account` | 订阅管理 | `list`, `show`, `set` |
| `az group` | 资源组管理 | `create`, `list`, `delete` |
| `az vm` | 虚拟机管理 | `create`, `list`, `start`, `stop` |
| `az storage` | 存储管理 | `account`, `blob`, `share` |
| `az network` | 网络管理 | `vnet`, `nsg`, `public-ip` |
| `az webapp` | Web 应用管理 | `create`, `list`, `up` |
| `az sql` | SQL 数据库管理 | `server`, `db` |
| `az aks` | Kubernetes 管理 | `create`, `get-credentials` |

---

## 🔍 第四步：查找命令

### 方法一：使用 --help

```bash
# 查看命令组的帮助
az vm --help

# 查看具体命令的帮助
az vm create --help
```

帮助信息包含：
- 📝 命令描述
- 🔧 可用参数
- 📌 参数说明
- 💡 使用示例

### 方法二：使用 az find（AI 驱动）

这是一个 AI 机器人，可以根据你的需求推荐命令：

```bash
# 搜索 VM 相关的命令
az find vm

# 搜索创建存储的命令
az find "create storage account"

# 搜索虚拟网络相关
az find "virtual network"
```

### 方法三：交互模式

```bash
az interactive
```

进入交互模式后：
- 🎨 自动补全
- 💬 内联帮助
- 💡 命令建议

按 `Ctrl+d` 退出交互模式。

---

## 🎯 第五步：实战演练

让我们通过实际操作来学习 Azure CLI。

### 1. 管理订阅

#### 查看当前订阅

```bash
az account show --output table
```

#### 列出所有订阅

```bash
az account list --output table
```

#### 切换订阅

```bash
az account set --subscription "订阅名称或ID"
```

### 2. 创建资源组

资源组是 Azure 中组织相关资源的逻辑容器。

```bash
az group create \
  --name MyResourceGroup \
  --location eastus
```

#### 列出资源组

```bash
az group list --output table
```

### 3. 创建虚拟机

创建一个 Ubuntu 虚拟机：

```bash
az vm create \
  --resource-group MyResourceGroup \
  --name MyUbuntuVM \
  --image Ubuntu2204 \
  --admin-username azureuser \
  --generate-ssh-keys \
  --location eastus
```

这个过程可能需要几分钟，因为 Azure 会：
1. 创建网络资源
2. 创建虚拟机
3. 启动虚拟机
4. 配置 SSH 访问

完成后，命令会返回虚拟机的详细信息，包括公网 IP。

#### 连接到虚拟机

```bash
# 获取虚拟机 IP
az vm show \
  --resource-group MyResourceGroup \
  --name MyUbuntuVM \
  --query publicIps -o tsv

# SSH 连接（替换 IP 地址）
ssh azureuser@<PUBLIC_IP>
```

#### 列出虚拟机

```bash
az vm list --resource-group MyResourceGroup --output table
```

#### 启动/停止虚拟机

```bash
# 停止虚拟机
az vm stop \
  --resource-group MyResourceGroup \
  --name MyUbuntuVM

# 启动虚拟机
az vm start \
  --resource-group MyResourceGroup \
  --name MyUbuntuVM
```

### 4. 创建存储账户

```bash
az storage account create \
  --name mystorageaccount123 \
  --resource-group MyResourceGroup \
  --location eastus \
  --sku Standard_LRS \
  --kind StorageV2
```

> ⚠️ **注意**：存储账户名称必须全局唯一，长度 3-24 字符，只能包含小写字母和数字。

### 5. 创建 Web 应用

```bash
az webapp up \
  --name my-webapp-unique-name \
  --resource-group MyResourceGroup \
  --location eastus
```

### 6. 清理资源

练习完成后，记得清理资源以避免不必要的费用：

```bash
az group delete \
  --name MyResourceGroup \
  --yes
```

---

## 🎨 第六步：输出格式与查询

### 输出格式

Azure CLI 支持多种输出格式，可以根据场景选择：

| 格式 | 说明 | 适用场景 |
|------|------|----------|
| `json` | JSON 字符串（默认） | 脚本处理、API 集成 |
| `jsonc` | 彩色的 JSON | 人眼阅读 |
| `table` | ASCII 表格 | 快速浏览 |
| `tsv` | 制表符分隔值 | 数据处理 |
| `yaml` | YAML 格式 | 配置文件 |
| `yamlc` | 彩色的 YAML | 人眼阅读 |

#### 示例

```bash
# JSON 格式（默认）
az vm list

# 表格格式（适合人眼）
az vm list --output table

# TSV 格式（适合数据处理）
az vm list --output tsv

# 彩色的 JSON
az vm list --output jsonc
```

### JMESPath 查询

使用 `--query` 参数可以灵活地筛选和格式化输出：

#### 基础查询

```bash
# 只获取 VM 名称
az vm list --query "[].name"

# 获取 VM 名称和位置
az vm list --query "[].{Name:name, Location:location}"

# 获取当前账户的租户 ID 和订阅 ID
az account show --query "{tenantId:tenantId, subscriptionId:id}"
```

#### 条件查询

```bash
# 只获取位于 eastus 的 VM
az vm list --query "[?location=='eastus']"

# 获取运行中的 VM
az vm list --query "[?powerState=='VM running']"
```

#### 排序

```bash
# 按名称排序
az vm list --query "sort_by([], &name)"

# 按位置排序
az vm list --query "sort_by([], &location)"
```

#### 限制结果

```bash
# 只返回前 3 个 VM
az vm list --query "[0:3]"
```

---

## ⚙️ 第七步：配置管理

### 设置默认值

避免每次都重复输入相同的参数：

```bash
az config set \
  defaults.location=westus2 \
  defaults.group=MyResourceGroup
```

之后创建资源时，可以省略这些参数：

```bash
# 不需要再指定 --location 和 --resource-group
az group create --name NewGroup
```

### 查看配置

```bash
az configure --list-defaults
```

### 清除配置

```bash
az config set defaults.group=''
```

### 配置文件位置

- **Linux/macOS**: `~/.azure/config`
- **Windows**: `%USERPROFILE%\.azure\config`

---

## 🔧 第八步：高级技巧

### 1. 使用变量

```bash
RESOURCE_GROUP="MyResourceGroup"
LOCATION="eastus"

az group create --name $RESOURCE_GROUP --location $LOCATION
```

### 2. 使用 JSON 配置文件

创建一个 `parameters.json`：

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "location": {
      "value": "eastus"
    },
    "vmName": {
      "value": "MyVM"
    }
  }
}
```

然后使用：

```bash
az deployment group create \
  --resource-group MyResourceGroup \
  --template-file template.json \
  --parameters parameters.json
```

### 3. 并行操作

使用 `--no-wait` 让命令异步执行：

```bash
az vm create ... --no-wait
```

### 4. 错误处理

```bash
if az group create --name MyRG --location eastus; then
    echo "资源组创建成功"
else
    echo "资源组创建失败" >&2
    exit 1
fi
```

### 5. 批量操作

```bash
# 批量创建多个存储账户
for i in {1..5}; do
    az storage account create \
      --name storage$i \
      --resource-group MyRG \
      --location eastus
done
```

---

## 🛡️ 第九步：安全最佳实践

### 1. 使用服务主体

创建服务主体：

```bash
az ad sp create-for-rbac \
  --name "my-service-app" \
  --role Contributor \
  --scopes /subscriptions/{subscription-id}
```

保存返回的信息（CLIENT_ID、CLIENT_SECRET、TENANT_ID），用于自动化脚本。

### 2. 使用 Key Vault 存储敏感信息

```bash
# 创建 Key Vault
az keyvault create \
  --name MyKeyVault \
  --resource-group MyResourceGroup \
  --location eastus

# 存储机密
az keyvault secret set \
  --vault-name MyKeyVault \
  --name MySecret \
  --value "MySecretValue"

# 获取机密
az keyvault secret show \
  --vault-name MyKeyVault \
  --name MySecret
```

### 3. 启用 MFA 多重身份验证

从 2025 年 9 月开始，Azure CLI 需要多重身份验证（MFA）。确保你的账户启用了 MFA。

---

## 📚 第十步：学习资源

### 官方文档

- [Azure CLI 主页](https://learn.microsoft.com/zh-cn/cli/azure/)
- [入门教程](https://learn.microsoft.com/zh-cn/cli/azure/get-started-with-azure-cli)
- [载入备忘单](https://learn.microsoft.com/zh-cn/cli/azure/cheat-sheet-onboarding)
- [A-Z 命令参考](https://learn.microsoft.com/zh-cn/cli/azure/reference-index)

### 在线培训

- [Microsoft Learn - Azure CLI 模块](https://learn.microsoft.com/zh-cn/training/browse/?products=azure-clis)

### 社区支持

- [GitHub Issues](https://github.com/Azure/azure-cli/issues)
- [Stack Overflow - azure-cli](https://stackoverflow.com/questions/tagged/azure-cli)

---

## 🆘 常见问题与故障排查

### 问题 1：登录失败

**症状**：`az login` 后提示错误

**解决方案**：
```bash
# 清除缓存的令牌
az logout
az cache purge

# 重新登录
az login
```

### 问题 2：权限不足

**症状**：`AuthorizationFailed` 错误

**解决方案**：
```bash
# 检查当前角色
az role assignment list --assignee $(az account show --query user.name -o tsv)

# 请求管理员分配适当的角色
```

### 问题 3：资源不存在

**症状**：`ResourceNotFound` 错误

**解决方案**：
```bash
# 检查资源组
az group list

# 检查资源
az resource list --resource-group MyResourceGroup
```

### 问题 4：命令不存在

**症状**：`'az xxx' is not an azure-cli command`

**解决方案**：
```bash
# 更新 Azure CLI
az upgrade

# 或安装扩展
az extension add --name azure-xxx
```

### 获取调试信息

```bash
# 显示详细信息
az vm list --verbose

# 显示调试信息（包括 REST API 调用）
az vm list --debug
```

---

## 📝 快速参考

### 常用命令速查表

```bash
# ===== 认证 =====
az login                              # 登录
az logout                             # 登出
az account show                       # 查看当前账户
az account list                       # 列出所有订阅

# ===== 资源组 =====
az group create -n MyRG -l eastus      # 创建资源组
az group list --output table          # 列出资源组
az group show -n MyRG                 # 查看资源组
az group delete -n MyRG -y            # 删除资源组

# ===== 虚拟机 =====
az vm create -g MyRG -n MyVM          # 创建虚拟机
az vm list -g MyRG --output table     # 列出虚拟机
az vm start -g MyRG -n MyVM           # 启动虚拟机
az vm stop -g MyRG -n MyVM            # 停止虚拟机
az vm delete -g MyRG -n MyVM -y       # 删除虚拟机

# ===== 存储 =====
az storage account create -n storage -g MyRG  # 创建存储账户
az storage account list -g MyRG                # 列出存储账户

# ===== Web 应用 =====
az webapp up -n myapp -g MyRG         # 创建 Web 应用
az webapp list -g MyRG               # 列出 Web 应用

# ===== 网络 =====
az network vnet create -g MyRG -n MyVNet    # 创建虚拟网络
az network nsg create -g MyRG -n MyNSG    # 创建网络安全组

# ===== 帮助 =====
az --help                             # 查看帮助
az vm --help                          # 查看 VM 命令帮助
az vm create --help                   # 查看具体命令帮助
az find vm                            # 搜索 VM 相关命令

# ===== 交互模式 =====
az interactive                        # 进入交互模式

# ===== 配置 =====
az configure --list-defaults          # 查看配置
az config set defaults.location=eastus  # 设置默认值

# ===== 反馈 =====
az feedback                          # 发送反馈
```

---

## 🎓 进阶学习建议

### 1. 学习 ARM 模板

Azure CLI 可以部署 ARM 模板：

```bash
az deployment group create \
  --resource-group MyResourceGroup \
  --template-file template.json \
  --parameters parameters.json
```

### 2. 学习 Bicep

Bicep 是 ARM 模板的现代声明式语言：

```bash
az bicep build -f main.bicep
az deployment group create -g MyRG -f main.bicep
```

### 3. 集成到 CI/CD

将 Azure CLI 集成到 GitHub Actions、Azure DevOps、GitLab CI 等工具中，实现自动化部署。

### 4. 学习其他 Azure 工具

- **Azure PowerShell**：适合 Windows 用户和 .NET 开发者
- **Terraform**：基础设施即代码工具
- **Azure Portal**：图形化管理界面

---

## 💡 总结

Azure CLI 是一个强大而灵活的命令行工具，特别适合：

✅ **开发者**：快速创建和测试资源
✅ **DevOps 工程师**：自动化部署和管理
✅ **系统管理员**：批量管理资源
✅ **Linux 用户**：熟悉命令行操作

### 下一步

1. 🎯 在 Cloud Shell 中实践本文中的命令
2. 📖 阅读官方文档了解更多高级功能
3. 🔧 尝试将 Azure CLI 集成到你的工作流程
4. 💬 加入 Azure CLI 社区，分享你的经验

---

## 🔗 相关资源

- [Azure CLI GitHub 仓库](https://github.com/Azure/azure-cli)
- [Azure CLI 发布说明](https://github.com/Azure/azure-cli/releases)
- [Azure 文档](https://learn.microsoft.com/zh-cn/azure/)
- [Azure 免费账户](https://azure.microsoft.com/free/)

---

**开始使用 Azure CLI，开启你的 Azure 云资源管理之旅吧！** 🚀

---

*本文基于 Azure CLI 最新版本（azure-cli-latest）编写，最后更新于 2026年3月9日*
