# Azure Security CLI 深入指南：用命令行掌控云安全

> 学习时间：2026-03-09
> 阅读时间：约 10 分钟
> 难度：中级

---

## 前言

作为云平台的用户，我们经常需要在 Azure Portal 中手动检查安全警报、配置安全策略。但是，当管理大量资源时，这种手动方式既耗时又容易出错。

Azure Security CLI 提供了一种高效的命令行方式来管理 Microsoft Defender for Cloud 的安全态势。今天，我将深入分享这个工具的使用方法和实战技巧。

## 什么是 Azure Security CLI？

Azure Security CLI 是 Azure CLI 的一个扩展模块，通过 `az security` 命令组提供对云安全管理的完整命令行访问能力。

**核心优势：**

- **高效批量操作**：一条命令可以处理数百个资源
- **可脚本化**：易于集成到自动化流程中
- **跨平台**：支持 Windows、Linux、macOS
- **灵活查询**：支持 JMESPath 高级查询过滤

## 安装和配置

### 1. 安装 Azure CLI

```bash
# macOS/Linux
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Windows (使用 PowerShell)
Invoke-WebRequest -Uri https://aka.ms/installazurecliwindows -OutFile .\AzureCLI.msi
Start-Process msiexec.exe -Wait -ArgumentList '/I AzureCLI.msi /quiet'
```

### 2. 登录 Azure

```bash
# 交互式登录
az login

# 使用服务主体登录（推荐用于自动化）
az login --service-principal \
  --username <app-id> \
  --password <password> \
  --tenant <tenant-id>
```

## 核心功能模块

### 1. 安全警报管理

这是最常用的功能模块，用于查看和处理安全警报。

#### 查看所有警报

```bash
# 列出当前订阅的所有安全警报
az security alert list

# 以表格格式输出（更易读）
az security alert list --output table

# 查看特定资源组的警报
az security alert list -g "myResourceGroup"
```

#### 筛选关键警报

```bash
# 只查看高危级别的警报
az security alert list --query "[?severity=='High']" --output table

# 查看今天的新警报
az security alert list --query "[?timeGenerated >= '$(date -u +%Y-%m-%dT00:00:00Z)']"

# 查看特定类型的警报
az security alert list --query "[?alertType.contains('SQL injection')]"
```

#### 更新警报状态

```bash
# 查看特定警报详情
az security alert show \
  --location "centralus" \
  --name "alertName"

# 将警报标记为已解决
az security alert update \
  --location "centralus" \
  --name "alertName" \
  --status "resolve"

# 其他状态选项：
# dismiss   - 忽略/关闭（用于已确认的误报）
# activate  - 激活（重新激活已关闭的警报）
# inprogress - 处理中（标记为正在调查）
```

### 2. 安全评估

安全评估帮助你了解资源的安全合规性状态。

```bash
# 列出所有安全评估结果
az security assessment list --output table

# 查看未通过的健康检查
az security assessment list --query "[?status.code=='Unhealthy']"

# 创建自定义评估
az security assessment create \
  --name "my-custom-assessment" \
  --assessment-key "customKey" \
  --display-name "自定义安全检查"
```

### 3. 自适应应用程序控制

这个功能允许你控制哪些应用程序可以在机器上运行，防止恶意软件执行。

```bash
# 列出所有自适应应用控制配置
az security adaptive-application-controls list

# 查看特定配置详情
az security adaptive-application-controls show --name "configName"
```

### 4. 高级威胁保护 (ATP)

为 Azure 服务（如 Cosmos DB、Storage、SQL）提供实时威胁检测。

```bash
# 为 Cosmos DB 启用 ATP
az security atp cosmosdb update \
  --resource-group "myResourceGroup" \
  --name "myCosmosAccount" \
  --is-enabled true

# 查看 ATP 设置状态
az security atp cosmosdb show \
  --resource-group "myResourceGroup" \
  --name "myCosmosAccount"
```

## 实战场景

### 场景 1：每日安全报告

创建一个每日自动运行的安全监控脚本：

```bash
#!/bin/bash
# daily-security-check.sh

# 报告文件名
REPORT_FILE="security-report-$(date +%Y%m%d).txt"

echo "=== Azure 安全日报 ===" > $REPORT_FILE
echo "日期: $(date)" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# 高危警报统计
HIGH_ALERTS=$(az security alert list \
  --query "length([?severity=='High'])" \
  -o tsv)

echo "高危警报数量: $HIGH_ALERTS" >> $REPORT_FILE

# 如果有高危警报，列出详细信息
if [ "$HIGH_ALERTS" -gt 0 ]; then
  echo "" >> $REPORT_FILE
  echo "高危警报详情:" >> $REPORT_FILE
  az security alert list \
    --query "[?severity=='High'].{Name:name,Type:alertType,Time:timeGenerated}" \
    --output table >> $REPORT_FILE
fi

# 安全评估统计
UNHEALTHY=$(az security assessment list \
  --query "length([?status.code=='Unhealthy'])" \
  -o tsv)

echo "" >> $REPORT_FILE
echo "未通过的安全评估: $UNHEALTHY" >> $REPORT_FILE

# 发送报告（可以集成到邮件或Teams）
cat $REPORT_FILE
```

### 场景 2：批量处理误报

当遇到批量误报时，可以使用脚本快速处理：

```bash
#!/bin/bash
# dismiss-false-positives.sh

# 查找描述中包含特定关键词的警报
KEYWORD="known benign activity"
LOCATION="centralus"

echo "正在关闭包含 '$KEYWORD' 的警报..."

az security alert list \
  --query "[?contains(description, '$KEYWORD')].name" \
  -o tsv | while read alertName; do
    echo "关闭警报: $alertName"
    az security alert update \
      --location "$LOCATION" \
      --name "$alertName" \
      --status "dismiss"
  done

echo "完成！"
```

### 场景 3：为所有 Cosmos DB 账户启用 ATP

```bash
#!/bin/bash
# enable-atp-for-all-cosmos.sh

echo "为所有 Cosmos DB 账户启用 ATP..."

az cosmosdb list --query "[].{name:name,resourceGroup:resourceGroup}" -o tsv | \
while IFS=$'\t' read -r name rg; do
  echo "处理账户: $name (资源组: $rg)"
  az security atp cosmosdb update \
    --resource-group "$rg" \
    --name "$name" \
    --is-enabled true
  echo "✓ 已完成"
done

echo "所有账户 ATP 已启用！"
```

### 场景 4：安全合规检查

```bash
#!/bin/bash
# compliance-check.sh

echo "=== 安全合规检查 ==="

# 检查未通过的健康检查
echo ""
echo "未通过的安全评估:"
az security assessment list \
  --query "[?status.code=='Unhealthy'].{Name:name,Status:status.code,Severity:status.severity}" \
  --output table

# 检查特定资源的合规性
echo ""
echo "特定资源组的合规性:"
RG_NAME="production"
az security assessment list \
  --query "[?contains(id, '/resourceGroups/$RG_NAME/') && status.code=='Unhealthy']" \
  --output table

# 生成 CSV 报告
echo ""
echo "生成合规性报告..."
az security assessment list --output csv > compliance-report.csv
echo "报告已保存到 compliance-report.csv"
```

## 高级技巧

### 1. JMESPath 查询

JMESPath 是一个强大的查询语言，用于过滤和转换 JSON 数据。

```bash
# 基本过滤
az security alert list --query "[?severity=='High']"

# 多条件过滤
az security alert list --query "[?severity=='High' && alertType.contains('network')]"

# 投影（选择特定字段）
az security alert list --query "[].{Name:name,Type:alertType,Severity:severity}"

# 聚合查询
az security alert list --query "length([?severity=='High'])"

# 排序
az security alert list --query "sort_by([], &timeGenerated)"
```

### 2. 输出格式

```bash
# JSON（默认）
az security alert list --output json

# JSONC（着色显示）
az security alert list --output jsonc

# 表格（适合终端查看）
az security alert alert list --output table

# TSV（适合导入 Excel）
az security alert list --output tsv

# YAML（易读的配置格式）
az security alert list --output yaml
```

### 3. 错误处理

```bash
#!/bin/bash
# 带错误处理的脚本

set -e  # 遇到错误立即退出

# 捕获错误
az security alert list -g "nonexistent-rg" || {
  echo "错误：资源组不存在"
  exit 1
}

# 只显示错误，不显示警告
az security alert list --only-show-errors
```

## 安全最佳实践

### 1. 身份验证

**✅ 推荐做法：**
- 使用服务主体（Service Principal）进行自动化
- 定期轮换密钥（建议每 90 天）
- 使用 Azure Key Vault 存储密钥

```bash
# 创建服务主体
SP=$(az ad sp create-for-rbac --name "security-automation" --query "{client:appId, secret:password, tenant:tenantId}" -o json)

# 保存到 Key Vault
az keyvault secret set \
  --vault-name "my-keyvault" \
  --name "security-sp-secret" \
  --value "$(echo $SP | jq -r .secret)"
```

**❌ 避免：**
- 在脚本中硬编码凭据
- 使用个人账户进行自动化
- 共享服务主体密钥

### 2. 权限管理

实施最小权限原则：

```bash
# 分配特定权限的角色
az role assignment create \
  --assignee <service-principal-id> \
  --role "Security Reader" \
  --scope /subscriptions/<subscription-id>/resourceGroups/<resource-group>

# 如果需要修改警报，使用 Security Admin
az role assignment create \
  --assignee <service-principal-id> \
  --role "Security Admin" \
  --scope /subscriptions/<subscription-id>
```

### 3. 审计和日志

```bash
# 启用诊断日志
az monitor diagnostic-settings create \
  --name "security-audit" \
  --resource "/subscriptions/<sub-id>/providers/Microsoft.Security/locations/westcentralus/alerts" \
  --logs '[{"category": "SecurityAlert","enabled":true}]' \
  --workspace "/subscriptions/<sub-id>/resourcegroups/<rg>/providers/Microsoft.OperationalInsights/workspaces/<workspace>"

# 查看操作日志
az monitor activity-log list \
  --caller <user-or-sp-id> \
  --start-time "2026-03-08T00:00:00Z" \
  --query "[?operationName.value.contains('Security')]"
```

## 与其他 Azure 服务集成

### 1. Azure Functions 自动响应

创建一个 Azure Function，当收到安全警报时自动响应：

```javascript
// 函数代码示例
module.exports = async function(context, myTimer) {
  const { exec } = require('child_process');
  
  exec('az security alert list --query "[?severity==\'High\']"', (error, stdout) => {
    if (error) {
      context.log.error('Error:', error);
      return;
    }
    
    const alerts = JSON.parse(stdout);
    alerts.forEach(alert => {
      context.log(`处理警报: ${alert.name}`);
      // 调用其他 API 处理警报
    });
  });
};
```

### 2. Azure DevOps CI/CD 集成

在 pipeline 中添加安全检查：

```yaml
# azure-pipelines.yml
- script: |
    az security assessment list --query "[?status.code=='Unhealthy']" > unhealthy.json
    if [ $(jq 'length' unhealthy.json) -gt 0 ]; then
      echo "发现安全合规问题！"
      cat unhealthy.json
      exit 1
    fi
  displayName: 'Security Compliance Check'
```

## 故障排查

### 常见错误 1：权限不足

```
The client does not have authorization to perform action
```

**解决方案：**
```bash
# 检查当前角色分配
az role assignment list \
  --assignee <user-or-sp-id> \
  --query "[].roleDefinitionName"

# 分配必要的角色
az role assignment create \
  --assignee <user-or-sp-id> \
  --role "Security Admin" \
  --scope /subscriptions/<subscription-id>
```

### 常见错误 2：Defender for Cloud 未启用

```
Microsoft Defender for Cloud is not enabled on this subscription
```

**解决方案：**
在 Azure Portal 中启用 Defender for Cloud，或使用 CLI 配置定价层。

### 常见错误 3：命令不存在

```
'az security' is not in the 'az' command group
```

**解决方案：**
```bash
# 更新 Azure CLI
az upgrade

# 或安装 security 扩展
az extension add --name security
```

## 性能优化

### 1. 批量操作

使用 `--ids` 参数批量操作：

```bash
# 收集所有资源 ID
IDS=$(az resource list --query "[*].id" -o tsv | tr '\n' ' ')

# 批量操作
az security assessment list --ids $IDS
```

### 2. 并行处理

使用 GNU parallel 加速批量操作：

```bash
# 安装 parallel（如果没有）
sudo apt-get install parallel

# 并行处理多个资源
az resource list --query "[*].id" -o tsv | \
  parallel -j 4 'az security assessment show --ids {}'
```

## 总结

Azure Security CLI 是一个强大的工具，能够显著提高云安全管理的效率。通过掌握这些技巧，你可以：

✅ 快速识别和响应安全威胁
✅ 自动化安全合规检查
✅ 批量管理安全策略
✅ 集成到 CI/CD 流程
✅ 建立 7x24 小时安全监控

**下一步行动：**

1. 安装并配置 Azure CLI
2. 创建第一个安全监控脚本
3. 集成到现有工作流
4. 建立定期审查和优化机制

记住：安全是一个持续的过程，而不仅仅是一次性任务！

---

## 参考资源

- [Azure Security CLI 官方文档](https://learn.microsoft.com/en-us/cli/azure/security)
- [Microsoft Defender for Cloud](https://learn.microsoft.com/azure/defender-for-cloud/)
- [JMESPath 教程](http://jmespath.org/)
- [Azure CLI 最佳实践](https://learn.microsoft.com/en-us/cli/azure/azure-cli-configuration)

---

如果你在实践过程中遇到问题，欢迎在评论区讨论！我会持续更新这个主题的更多实战技巧。

🔐 **保持安全，保持自动化！**
