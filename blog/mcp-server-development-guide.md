# MCP 服务器开发指南：让 AI 更好地与外部世界对话

> Model Context Protocol (MCP) 正在改变 AI 与外部服务的交互方式。本文将带你了解如何构建高质量的 MCP 服务器。

---

## 什么是 MCP？

想象一下，AI 像一个被困在文字世界里的超级大脑——它知道很多，但无法直接操作外部世界。**MCP (Model Context Protocol)** 就像是给 AI 伸出了双手，让它能够通过精心设计的工具与外部服务交互。

MCP 不是一个框架，而是一个协议。它定义了 AI 模型如何调用外部工具、访问资源、以及处理错误。

## 为什么 MCP 很重要？

在 MCP 出现之前，要让 AI 调用外部 API，通常需要硬编码、或者依赖复杂的插件系统。MCP 提供了一个**标准化的接口**，让：

- **开发者**：可以一次编写，多种 AI 客户端都能用
- **AI 客户端**：可以统一管理不同的 MCP 服务器
- **最终用户**：可以轻松扩展 AI 的能力

## 如何构建高质量的 MCP 服务器？

开发 MCP 服务器就像为 AI 设计一套"遥控器"。你设计的遥控器越好用，AI 就越能完成复杂任务。

### 🎯 四个阶段的工作流

#### 阶段 1：深度研究和规划

**1. 理解 API 覆盖 vs 工作流工具**

这是一个关键设计决策：

- **API 覆盖**：直接暴露 API 的端点，给 AI 最大灵活性
- **工作流工具**：封装特定任务的复杂流程，让 AI 更轻松

**我的建议**：如果你不确定，优先选择**全面的 API 覆盖**。因为 AI 很擅长组合多个步骤来完成目标。

**2. 工具命名和可发现性**

AI 需要快速找到正确的工具，所以命名很重要：

```python
# ✅ 好的命名
github_create_issue()
github_list_repos()
github_get_file_content()

# ❌ 不好的命名
create()
list()
get_file()
```

使用**一致的前缀**和**面向操作的命名**，AI 就能更容易理解和调用。

**3. 错误消息要"可操作"**

当工具出错时，不要只告诉 AI "出错了"，要告诉它**如何修复**：

```python
# ✅ 好的错误消息
"API token expired. Please renew your token and try again."

# ❌ 不好的错误消息
"Error: 401 Unauthorized"
```

#### 阶段 2：设计和实现

**工具设计原则**

每个工具都应该：
- ✅ 有单一、清晰的目的
- ✅ 返回结构化、可预测的数据
- ✅ 提供有意义的错误消息
- ✅ 包含使用示例（在 docstring 中）

**Python FastMCP 示例**

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("weather-service")

@mcp.tool()
def get_weather(city: str) -> dict:
    """获取指定城市的天气信息。

    Args:
        city: 城市名称，例如 '北京' 或 '上海'

    Returns:
        包含温度、湿度、天气状况的字典
    """
    # 实现逻辑
    return {
        "temperature": 25,
        "humidity": 60,
        "condition": "晴"
    }

if __name__ == "__main__":
    mcp.run()
```

**TypeScript MCP SDK 示例**

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

const server = new Server({
  name: "weather-service",
  version: "1.0.0"
}, {
  capabilities: { tools: {} }
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [{
      name: "get_weather",
      description: "获取指定城市的天气信息",
      inputSchema: {
        type: "object",
        properties: {
          city: { type: "string", description: "城市名称" }
        },
        required: ["city"]
      }
    }]
  };
});
```

#### 阶段 3：测试和优化

**单元测试**：测试每个工具的功能和错误处理
**集成测试**：测试与实际 API 的交互
**性能优化**：
- 缓存频繁访问的数据
- 实现分页处理大量结果
- 使用异步操作提高响应性

#### 阶段 4：文档和部署

**文档应该包括**：
- 清晰的安装说明
- 配置要求（环境变量等）
- 可用工具列表及其描述
- 使用示例
- 故障排除指南

**部署考虑**：
- **stdio**：适合本地工具和 CLI 集成
- **HTTP**：适合远程服务和分布式架构

## 常见模式

### 1. 认证处理

```python
import os

@mcp.tool()
def api_call(endpoint: str) -> dict:
    api_key = os.getenv("API_KEY")
    if not api_key:
        raise ValueError("API_KEY environment variable not set")
    # 使用 api_key 进行 API 调用
```

### 2. 错误处理

```python
@mcp.tool()
def safe_operation(data: str) -> str:
    try:
        return perform_operation(data)
    except SpecificError as e:
        return f"Error: {e}. Try checking your input format."
    except Exception as e:
        return f"Unexpected error: {e}. Please report if this persists."
```

### 3. 分页

```python
@mcp.tool()
def list_items(page: int = 1, limit: int = 10) -> dict:
    items = fetch_items(page, limit)
    return {
        "items": items,
        "page": page,
        "has_more": len(items) == limit
    }
```

## 检查清单

在发布你的 MCP 服务器之前，确保：

- [ ] 研究了目标 API 文档
- [ ] 设计了清晰、专注的工具
- [ ] 实现了结构化错误处理
- [ ] 编写了单元和集成测试
- [ ] 创建了清晰的文档
- [ ] 测试了与 Claude/其他 LLM 的集成
- [ ] 优化了工具描述以提高可发现性

## 学习资源

- **MCP 规范**：https://modelcontextprotocol.io/
- **Python SDK**：https://github.com/modelcontextprotocol/python-sdk
- **TypeScript SDK**：https://github.com/modelcontextprotocol/typescript-sdk
- **示例服务器**：https://github.com/modelcontextprotocol/servers

## 总结

构建 MCP 服务器的关键在于**为 AI 设计好的工具**。就像设计一个好的 API 一样，你需要：

1. 理解 AI 如何思考和调用工具
2. 设计清晰、单一职责的工具
3. 提供结构化的返回和可操作的错误消息
4. 编写好的文档和示例

当你把这一切做好，AI 就能够像使用自己的双手一样，轻松地完成复杂的任务。

---

**下一步**：选择一个你熟悉的 API，尝试构建你的第一个 MCP 服务器吧！

*发布于 2026-03-10*
