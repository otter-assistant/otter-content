# 浏览器端调用 gRPC 服务：protoc-gen-grpc-web 完全指南

> 作为前端开发者，你是否想过：能否在浏览器中直接调用后端的 gRPC 服务？答案是可以的，而且比 REST API 更高效！

## 什么是 gRPC-Web？

gRPC-Web 是 Google 推出的一项技术，让浏览器可以直接使用 gRPC 协议与后端服务通信。

传统的 gRPC 使用 HTTP/2 协议，需要双向流支持，而浏览器不提供完整的 HTTP/2 客户端能力。gRPC-Web 通过一个适配层，让浏览器也能享受 gRPC 的优势。

### 核心优势

- **二进制协议**：基于 protobuf，比 JSON 更小、更快
- **类型安全**：从 `.proto` 文件自动生成 TypeScript 类型
- **强契约**：接口即文档，前后端通过 proto 文件约定接口
- **代码生成**：自动生成客户端代码，减少手写错误

## 工作原理

```
浏览器 → gRPC-Web 客户端 → Envoy 代理 → gRPC 后端
```

这个流程中，Envoy 扮演了关键角色：

1. 浏览器调用生成的客户端代码
2. 客户端将请求序列化为 gRPC-Web 格式
3. 通过 HTTP/1.1 或 HTTP/2 发送到 Envoy
4. Envoy 将请求转换为标准 gRPC（HTTP/2）
5. 调用后端 gRPC 服务
6. 返回时再逆向转换

> 为什么需要 Envoy？浏览器不支持原生 gRPC 的某些特性（如 HTTP/2 trailer），Envoy 充当适配层。

## 快速开始

### 1. 定义 proto 文件

```protobuf
// user.proto
syntax = "proto3";

package user;

service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);
}

message GetUserRequest {
  int32 id = 1;
}

message GetUserResponse {
  int32 id = 1;
  string name = 2;
  string email = 3;
  repeated string roles = 4;
}

message ListUsersRequest {
  int32 page = 1;
  int32 page_size = 2;
}

message ListUsersResponse {
  repeated User users = 1;
  int32 total = 2;
}

message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
}
```

### 2. 安装工具

```bash
# 安装 protoc-gen-grpc-web 插件
npm install --save-dev protoc-gen-grpc-web

# 确保已安装 protoc 编译器
# macOS: brew install protobuf
# Linux: sudo apt install protobuf-compiler
```

### 3. 生成代码

```bash
protoc \
  --proto_path=protos \
  --grpc-web_out=import_style=typescript,mode=grpcwebtext:./src/generated \
"  --js_out=import_style=commonjs:./src/generated \
  protos/user.proto
```

这会生成：

- `user_pb.js` 和 `user_pb.d.ts`：protobuf 消息类和类型定义
- `user_grpc_web_pb.js`：gRPC-Web 客户端代码

### 4. 在前端使用

```typescript
import { UserServiceClient } from '../generated/user_grpc_web_pb';
import { GetUserRequest } from '../generated/user_pb';

// 创建客户端，连接到 Envoy 代理
const client = new UserServiceClient('http://localhost:8080');

// 调用服务
export async function getUser(id: number) {
  const request = new GetUserRequest();
  request.setId(id);

  return new Promise((resolve, reject) => {
    client.getUser(request, {}, (err, response) => {
      if (err) reject(err);
      else resolve(response.toObject());
    });
  });
}
```

### 5. React 集成示例

```typescript
// hooks/useUser.ts
import { useState, useEffect } from 'react';

export function useUser(id: number) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getUser(id)
      .then(setUser)
      .finally(() => setLoading(false));
  }, [id]);

  return { user, loading };
}

// UserComponent.tsx
export function UserComponent({ userId }) {
  const { user, loading } = useUser(userId);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

## 配置详解

### 开发 vs 生产

protoc-gen-grpc-web 支持两种模式：

```bash
# 开发环境：grpcwebtext（文本模式，便于调试）
--grpc-web_out=import_style=typescript,mode=grpcwebtext:./generated

# 生产环境：grpcweb（二进制模式，更高效）
--grpc-web_out=import_style=typescript,mode=grpcweb:./generated
```

**推荐配置 package.json**：

```json
{
  "scripts": {
    "generate": "protoc --grpc-web_out=import_style=typescript,mode=grpcwebtext:./src/generated --js_out=import_style=commonjs:./src/generated protos/**/*.proto",
    "generate:prod": "protoc --grpc-web_out=import_style=typescript,mode=grpcweb:./src/generated --js_out=import_style=commonjs:./src/generated protos/**/*.proto"
  }
}
```

### 批量生成

对于大型项目，可以创建生成脚本：

```bash
#!/bin/bash
# scripts/generate.sh

PROTO_DIR="./protos"
OUTPUT_DIR="./src/generated"
MODE="${1:-grpcwebtext}"  # 默认使用 grpcwebtext

protoc \
  --proto_path="$PROTO_DIR" \
  --grpc-web_out=import_style=typescript,mode=$MODE:$OUTPUT_DIR \
  --js_out=import_style=commonjs:$OUTPUT_DIR \
  $(find $PROTO_DIR -name "*.proto")

echo "✅ Generated gRPC-Web clients to $OUTPUT_DIR"
```

使用方式：

```bash
./scripts/generate.sh          # 开发模式
./scripts/generate.sh grpcweb  # 生产模式
```

## 实战技巧

### 1. Promise 封装

将回调风格转换为现代 async/await：

```typescript
class GrpcService {
  private client: UserServiceClient;

  constructor(host: string) {
    this.client = new UserServiceClient(host);
  }

  async getUser(id: number): Promise<user.GetUserResponse.AsObject> {
    const request = new GetUserRequest();
    request.setId(id);

    const response = await this.client.getUser(request, {});
    return response.toObject(); // 返回纯 JavaScript 对象
  }

  async listUsers(page: number, pageSize: number) {
    const request = new ListUsersRequest();
    request.setPage(page);
    request.setPageSize(pageSize);

    const response = await this.client.listUsers(request, {});
    return response.toObject();
  }
}
```

### 2. 添加认证头

```typescript
const metadata = {
  'Authorization': `Bearer ${token}`,
  'X-Request-ID': generateRequestId(),
  'X-Client-Version': '1.0.0',
};

client.getUser(request, metadata, callback);
```

### 3. 错误处理

```typescript
import { GrpcWebError } from '../generated/user_grpc_web_pb';
import { StatusCode } from 'grpc-web';

try {
  const response = await client.getUser(request);
} catch (error) {
  if (error instanceof GrpcWebError) {
    console.error(`gRPC error [${error.code}]: ${error.message}`);

    // 处理特定错误
    if (error.code === StatusCode.NOT_FOUND) {
      throw new Error('用户不存在');
    }
  } else {
    console.error('Network error:', error);
    throw new Error('网络请求失败');
  }
}
```

### 4. TypeScript 类型推断

```typescript
// 使用 toObject() 获得纯对象（类型自动推断）
const userResponse = await client.getUser(request);
const user = userResponse.toObject();
// user 的类型是 { id: number; name: string; email: string; roles: string[] }

// 直接使用 protobuf 对象（性能更好）
const userResponse = await client.getUser(request);
const email = userResponse.getEmail(); // 类型安全，IDE 会提示
```

## Envoy 配置示例

要在本地运行，需要配置 Envoy 代理：

```yaml
# envoy.yaml
static_resources:
  listeners:
    - name: listener_0
      address:
        socket_address:
          address: 0.0.0.0
          port_value: 8080
      filter_chains:
        - filters:
            - name: envoy.filters.network.http_connection_manager
              typed_config:
                codec_type: AUTO
                stat_prefix: ingress_http
                route_config:
                  name: local_route
                  virtual_hosts:
                    - name: local_service
                      domains: ["*"]
                      routes:
                        - match:
                            prefix: "/"
                          route:
                            cluster: grpc_backend
                            timeout: 30s
                http_filters:
                  - name: envoy.filters.http.grpc_web
                    typed_config: {}
                  - name: envoy.filters.http.router
  clusters:
    - name: grpc_backend
      connect_timeout: 5s
      http2_protocol_options: {}
      load_assignment:
        cluster_name: grpc_backend
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: localhost
                      port_value: 9090  # gRPC 后端服务端口
```

启动 Envoy：

```bash
docker run -d \
  -p 8080:8080 \
  -v $(pwd)/envoy.yaml:/etc/envoy/envoy.yaml \
  envoyproxy/envoy:v1.29-latest
```

## 最佳实践

### 项目结构

```
frontend/
├── protos/              # proto 定义（可从后端项目复制）
│   ├── user.proto
│   └── product.proto
├── src/
│   ├── generated/       # 生成的代码（不要手动修改，加入 .gitignore）
│   │   ├── user_pb.js
│   │   ├── user_pb.d.ts
│   │   └── user_grpc_web_pb.js
│   ├── services/        # 客户端封装
│   │   └── UserService.ts
│   └── hooks/           # React hooks
│       └── useUser.ts
└── scripts/
    └── generate.sh      # 代码生成脚本
```

### 生成前钩子

在 `package.json` 中配置生成前检查：

```json
{
  "scripts": {
    "pregenerate": "npm install protoc-gen-grpc-web",
    "generate": "protoc --grpc-web_out=... && echo '✅ 代码生成完成'"
  }
}
```

### CI/CD 集成

```yaml
# .github/workflows/build.yml
name: Build
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Generate gRPC clients
        run: npm run generate:prod
      - name: Build
        run: npm run build
```

## 性能对比

| 指标 | REST API | gRPC-Web | gRPC (原生) |
|------|----------|----------|--------------|
| 传输大小 | JSON 文本 | protobuf 二进制 | protobuf 二进制 |
| 类型安全 | 需手动定义 | 自动生成 | 自动生成 |
| 浏览器支持 | 原生支持 | 需要 Envoy | 不支持 |
| 性能 | 基准 | 优于 REST | 最优 |

对于大多数 Web 应用，gRPC-Web 在性能和开发体验之间取得了很好的平衡。

## 常见问题

**Q: gRPC-Web 支持流式调用吗？**

支持服务端流，但不支持客户端流和双向流。这是由于浏览器的限制。

**Q: 如何调试请求？**

在开发环境使用 `mode=grpcwebtext`，可以在浏览器开发者工具中查看请求内容。也可以使用 gRPC-Web 浏览器扩展。

**Q: 能否同时使用 REST 和 gRPC-Web？**

可以。后端可以同时暴露 REST 和 gRPC 接口，前端根据场景选择使用。

**Q: 生成的代码很大，会影响打包体积吗？**

生成的代码主要包含消息定义和序列化逻辑。使用 Tree Shaking，未使用的代码会被优化掉。通常影响可控。

## 总结

gRPC-Web 带来的好处：

- ✅ **类型安全**：从 proto 到 TypeScript，全链路类型推断
- ✅ **高性能**：protobuf 二进制协议，比 JSON 小 30-50%
- ✅ **开发体验**：自动生成客户端，减少重复代码
- ✅ **强契约**：接口定义即文档，前后端同步更新

适合场景：

- 微服务架构的前后端通信
- 对性能要求较高的实时应用
- 需要强类型约束的大型项目
- Go/Java/C++ 后端 + JavaScript 前端的技术栈

## 下一步

如果你对 gRPC-Web 感兴趣，可以：

1. 搭建一个示例项目（前端 + Envoy + gRPC 后端）
2. 在实际项目中尝试迁移部分接口
3. 结合 gRPC-Stream 实现服务端推送
4. 探索 grpc-gateway 实现同时支持 REST 和 gRPC

---

**相关资源**：

- [gRPC-Web 官方文档](https://grpc.io/blog/grpc-web/)
- [protoc-gen-grpc-web GitHub](https://github.com/grpc/grpc-web)
- [Envoy gRPC-Web 配置](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/grpc_web_filter)

*本文展示了如何在浏览器中使用 gRPC，享受类型安全和高性能的双重优势。*
