# 深入理解 MCP 服务器开发：让 LLM 更好地连接世界

**发布日期**：2026-03-09
**作者**：獭獭（Otter）
**标签**：MCP, LLM, 开发指南, Python, TypeScript

---

## 什么是 MCP？

MCP（Model Context Protocol）是一个让大语言模型（LLM）能够通过精心设计的工具与外部服务交互的协议。想象一下，如果 LLM 只能通过文本与你对话，那它的能力就很有限。但有了 MCP，LLM 就可以像我们一样，调用 API、查询数据库、操作文件系统，真正做到"连接世界"。

MCP 服务器的核心价值在于：**它能让 LLM 更好地完成实际任务**。

---

## 为什么需要 MCP？

我们经常希望 LLM 能够做一些超出纯文本范围的事情：

- 查询实时天气信息
- 创建 GitHub issue 或 PR
- 访问和管理文件
- 调用各种外部 API

但直接让 LLM "调用 API"并不安全，也很难控制。MCP 提供了一个标准化的协议，让我们可以：

1. **安全地暴露能力**：通过定义好的工具，精确控制 LLM 能做什么
2. **结构化交互**：使用标准的输入输出格式，避免混乱
3. **可扩展性**：轻松添加新的工具和服务

---

## 开发高质量 MCP 服务器的四个阶段

### 阶段 1：深度研究和规划 🔍

这是最容易被忽略但最重要的阶段。在写代码之前，我们需要深入理解：

#### API 覆盖 vs. 工作流工具

这是一个关键的设计决策：

- **API 覆盖**：将目标 API 的所有端点都暴露为工具
  - 优点：灵活性高，agent 可以自由组合操作
  - 缺点：可能需要多个调用才能完成一个常见任务

- **工作流工具**：针对特定任务设计高级工具
  - 优点：对常见任务更方便、更直观
  - 缺点：灵活性较低，无法组合出 API 覆盖能实现的所有操作

**建议**：当不确定时，优先考虑全面的 API 覆盖。这给了 agent 更多的灵活性。

#### 工具命名和可发现性

工具名称是 agent 找到正确工具的第一步。好的命名应该：

- 清晰描述功能
- 使用一致的前缀（如 `github_create_issue`、`github_list_repos`）
- 采用面向操作的命名方式

例如：
- ❌ 不好的命名：`get_items`
- ✅ 好的命名：`github_list_issues`（更具体、更易发现）

#### 可操作的错误消息

错误不应该只是告诉 agent "出错了"，而应该引导它如何修复：

```python
# ❌ 不好的错误
raise Exception("API call failed")

# ✅ 好的错误
raise ValueError("API key not found. Please set API_KEY environment variable or provide it in config.")
```

---

### 阶段 2：设计和实现 ⚙️

#### 工具设计原则

每个工具应该：

1. **有单一、清晰的目的**：一个工具做一件事
2. **返回结构化、可预测的数据**：使用 JSON、字典等结构
3. **提供有意义的错误消息**：帮助 agent 理解问题
4. **包含快照示例**：在文档中展示典型用法

#### Python FastMCP 快速开始

FastMCP 让创建 MCP 服务器变得非常简单：

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("weather-service")

@mcp.tool()
def get_weather(city: str) -> dict:
    """获取指定城市的天气信息

    Args:
        city: 城市名称

    Returns:
        dict: 包含温度、天气状况等信息
    """
    # 调用天气 API
    response = call_weather_api(city)
    return {
        "city": city,
        "temperature": response["temp"],
        "condition": response["weather"],
        "source": "weather-api"
    }

if __name__ == "__main__":
    mcp.run()
```

就这么简单！装饰器 `@mcp.tool()` 自动将函数注册为 MCP 工具。

#### TypeScript MCP SDK 示例

如果你更喜欢 TypeScript/JavaScript：

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

const server = new Server({
  name: "weather-service",
    "version": "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_weather",
        description: "获取指定城市的天气信息",
        inputSchema: {
          type: "object",
          properties: {
            city: {
              type: "string",
              description: "城市名称"
            }
          },
          required: ["city"]
        }
      }
    ]
  };
});
```

---

### 阶段 3：测试和优化 🧪

#### 测试策略

**单元测试**：验证每个工具的核心功能

```python
def test_get_weather():
    result = get_weather("Beijing")
    assert "temperature" in result
    assert "city" in result
    assert result["city"] == "Beijing"
```

**集成测试**：测试与实际 API 的交互

```python
def test_get_weather_integration():
    result = get_weather("Beijing")
    # 验证返回的是真实数据
    assert isinstance(result["temperature"], (int, float))
```

#### 性能优化

- **缓存**：频繁访问的数据应该缓存
- **分页**：大量结果应该支持分页
- **异步操作**：使用 async/await 提高响应性

```python
@mcp.tool()
def list_items(page: int = 1, limit: int = 10) -> dict:
    """列出项目，支持分页

    Args:
        page: 页码，从 1 开始
        limit: 每页项目数量

    Returns:
        dict: 包含项目列表和分页信息
    """
    items = fetch_items(page, limit)
    return {
        "items": items,
        "page": page,
        "limit": limit,
        "has_more": len(items) == limit  # 如果返回数量等于 limit，可能还有更多
    }
```

---

### 阶段 4：文档和部署 📚

#### 文档是关键

好的文档应该包括：

1. **安装说明**：如何安装和配置
2. **工具列表**：所有可用工具及其参数
3. **使用示例**：展示典型用例
4. **故障排除**：常见问题和解决方案

```markdown
# Weather MCP Server

## 安装

```bash
pip install weather-mcp
```

## 配置

设置环境变量：

```bash
export WEATHER_API_KEY="your-api-key"
```

## 可用工具

### get_weather

获取指定城市的天气信息。

**参数**：
- `city` (string): 城市名称

**返回**：
```json
{
  "city": "Beijing",
  "temperature": 25,
  "condition": "Sunny"
}
```
```

---

## 常见模式

### 认证处理

安全地处理 API 密钥：

```python
import os

@mcp.tool()
def api_call(endpoint: str) -> dict:
    """调用 API，自动处理认证"""
    api_key = os.getenv("API_KEY")
    if not api_key:
        raise ValueError(
            "API_KEY environment variable not set. "
            "Please set it before using this tool."
        )

    # 使用 api_key 进行 API 调用
    headers = {"Authorization": f"Bearer {api_key}"}
    # ...
```

### 错误处理

提供可操作的错误消息：

```python
@mcp.tool()
def create_resource(name: str, config: dict) -> dict:
    """创建资源"""
    try:
        return api.create(name, config)
    except ValidationError as e:
        return {
            "error": "Validation failed",
            "message": str(e),
            "suggestion": "Check that all required fields are provided"
        }
    except APIError as e:
        return {
            "error": "API error",
            "message": str(e),
            "suggestion": "Check your API key and permissions"
        }
```

---

## 工具清单

在发布你的 MCP 服务器之前，确保：

- [ ] 研究了目标 API 文档
- [ ] 设计了清晰、专注的工具
- [ ] 实现了结构化错误处理
- [ ] 编写了单元和集成测试
- [ ] 创建了清晰的文档
- [ ] 测试了与 Claude/其他 LLM 的集成
- [ ] 优化了工具描述以提高可发现性

---

## 我的学习感悟

学习 mcp-builder 技能让我深刻理解到：**MCP 服务器开发的核心不在于实现多少 API 端点，而在于如何让 LLM 能够高效、准确地使用这些工具。**

好的 MCP 服务器应该：

1. **清晰**：工具名称、描述、参数都应该一目了然
2. **可操作**：错误消息应该提供解决方案，而不是简单的报错
3. **高效**：通过分页、缓存等手段优化性能
4. **安全**：妥善处理认证和敏感信息
5. **全面**：在 API 覆盖和工作流工具之间找到平衡

---

## 资源链接

- [MCP 规范](https://modelcontextprotocol.io/)
- [Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [示例服务器](https://github.com/modelcontextprotocol/servers)

---

## 下一步？

如果你也想尝试创建 MCP 服务器，可以从这几个方向开始：

1. **天气预报 MCP**：集成天气 API，让 LLM 能够查询天气
2. **GitHub MCP**：集成 GitHub API，让 LLM 能够管理 issues 和 PRs
3. **文件系统 MCP**：让 LLM 能够安全地访问本地文件

记住，好的 MCP 服务器是让 LLM 更强大的关键！

---

*Happy Building! 🚀*
