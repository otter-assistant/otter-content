# Playwright Web 应用测试完全指南

> 前端测试自动化，从入门到精通

---

## 介绍

Web 应用的测试自动化是现代开发流程中不可或缺的一环。Playwright 作为一个强大的端到端测试框架，提供了简洁的 API 和丰富的功能，让测试编写变得轻松愉快。

本文将带你全面了解 Playwright 的使用方法，从基础操作到高级模式，再到最佳实践和故障排除。

---

## 快速开始

### 安装

```bash
pip install playwright
playwright install
```

### 第一个测试

```python
from playwright.sync_api import sync_playwright

def test_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        # 导航到页面
        page.goto("http://localhost:5173")

        # 等待网络空闲
        page.wait_for_load_state("networkidle")

        # 执行操作
        page.click("button#submit")

        # 验证结果
        assert page.text_content(".result") == "Success"

        browser.close()
```

就这么简单！几个核心步骤：启动浏览器、打开页面、执行操作、验证结果。

---

## 基础操作

### 导航和等待

```python
# 导航到页面
page.goto("http://localhost:3000")

# 等待网络空闲（所有请求完成）
page.wait_for_load_state("networkidle")

# 等待特定元素出现
page.wait_for_selector(".loaded")
```

### 查找元素

Playwright 提供了多种查找元素的方式：

```python
# 通过 CSS 选择器
page.click("button.submit")
page.fill("input[name='email']", "test@example.com")

# 通过文本内容
page.click("text=Submit")
page.click("button:has-text('Save')")

# 通过 ARIA 角色
page.click("button[role='submit']")
```

### 获取元素内容

```python
# 获取文本内容
text = page.text_content(".message")

# 获取输入框的值
value = page.input_value("input#email")

# 获取元素属性
src = page.get_attribute("img.logo", "src")
```

### 截图

截图是调试和文档化的好帮手：

```python
# 截取整个页面
page.screenshot(path="screenshot.png")

# 截取特定元素
element = page.locator(".header")
element.screenshot(path="header.png")

# 截取完整的滚动页面
page.screenshot(path="full-page.png", full_page=True)
```

---

## 高级模式

### 等待策略

好的测试不应该依赖固定的等待时间。Playwright 提供了多种智能等待方式：

```python
# 等待特定元素可见
page.wait_for_selector(".loaded", state="visible")

# 等待元素消失（加载完成）
page.wait_for_selector(".loading", state="hidden")

# 等待自定义条件
page.wait_for_function(
    "document.querySelectorAll('.item').length >= 5"
)

# 等待 API 请求
with page.expect_request("**/api/data") as req:
    page.click("button#load")
request = req.value

# 等待 API 响应
with page.expect_response("**/api/submit") as resp:
    page.click("button#submit")
response = resp.value
```

### 表单交互

```python
# 填写表单
page.fill("input[name='username']", "testuser")
page.fill("input[name='password']", "password123")

# 选择复选框
page.check("input[type='checkbox']")

# 取消复选框
page.uncheck("input[type='checkbox']")

# 下拉菜单选择
page.select_option("select#country", "US")

# 提交表单
page.click("button[type='submit']")

# 或者按 Enter 键
page.press("input[name='search']", "Enter")
```

### 处理对话框

```python
# 接受所有对话框
page.on("dialog", lambda dialog: dialog.accept())

# 取消所有对话框
page.on("dialog", lambda dialog: dialog.dismiss())

# 智能处理对话框
def handle_dialog(dialog):
    if "Confirm delete?" in dialog.message:
        dialog.accept()
    else:
        dialog.dismiss()

page.on("dialog", handle_dialog)
```

### 多标签页/窗口

```python
# 点击打开新标签页
with page.context.expect_page() as new_page:
    page.click("a[target='_blank']")

# 获取新标签页
page2 = new_page.value

# 在新标签页中操作
page2.wait_for_load_state()
assert "Success" in page2.title()
```

### 文件上传

```python
# 直接选择文件
page.set_input_files("input[type='file']", "test_file.pdf")

# 通过文件选择器事件
with page.expect_file_chooser() as fc:
    page.click("button.upload")

file_chooser = fc.value
file_chooser.set_files("test_file.pdf")
```

### 监听控制台日志

调试时查看浏览器日志非常有用：

```python
# 监听所有控制台消息
page.on("console", lambda msg: print(f"Console: {msg.text}"))

# 监听页面错误
page.on("pageerror", lambda err: print(f"Error: {err}"))

# 监听特定级别的日志
def log_console(msg):
    if msg.type == "error":
        print(f"Console Error: {msg.text}")

page.on("console", log_console)
```

---

## 最佳实践

### 1. 使用稳定的选择器

选择器是测试的基石，选择不好的选择器会让测试变得脆弱：

```python
# ✅ 推荐：数据测试属性
page.click("[data-testid='submit-button']")

# ✅ 可以接受：语义化选择器
page.click("button[type='submit']")
page.click("input[name='email']")

# ❌ 避免：脆弱的 CSS 路径
page.click("body > div:nth-child(3) > div.content > button")

# ❌ 避免：不稳定的类名
page.click(".btn-primary-blue-lg")  # 样式类可能变化
```

**推荐做法**：在代码中为关键元素添加 `data-testid` 属性。

### 2. 使用断言库

Playwright 提供了强大的断言库，使用它可以让测试更清晰：

```python
from playwright.sync_api import expect

# 断言元素可见
expect(page.locator(".success")).to_be_visible()

# 断言文本内容
expect(page.locator(".message")).to_have_text("Success!")

# 断言元素包含文本
expect(page.locator(".message")).to_contain_text("Success")

# 断言元素数量
expect(page.locator(".item")).to_have_count(5)

# 断言元素属性
expect(page.locator("img.logo")).to_have_attribute("src", "/logo.png")

# 断言 URL 匹配
expect(page).to_have_url("**/dashboard")
```

### 3. 错误处理

良好的错误处理可以让测试更健壮：

```python
try:
    # 等待错误消息（带超时）
    page.wait_for_selector(".error", timeout=1000)
    error_text = page.text_content(".error")
    print(f"Error displayed: {error_text}")
except:
    print("No error displayed - test passed!")
```

### 4. 调试技巧

当测试失败时，这些技巧能帮你快速定位问题：

```python
# 慢动作运行（每步延迟 500ms）
browser = p.chromium.launch(headless=False, slow_mo=500)

# 暂停执行（打开 Playwright Inspector）
page.pause()

# 截图调试失败状态
try:
    # 执行测试逻辑
    expect(page.locator(".success")).to_be_visible()
except AssertionError:
    page.screenshot(path="failure.png")
    raise
```

### 5. 代码复用

将常用的操作封装成函数：

```python
def login(page, email, password):
    page.goto("http://localhost:3000/login")
    page.fill("input[name='email']", email)
    page.fill("input[name='password']", password)
    page.click("button[type='submit']")
    page.wait_for_url("**/dashboard")

def test_user_flow():
    login(page, "user@example.com", "password")
    # 继续测试...
```

---

## 实战场景

### 场景 1：测试登录流程

```python
def test_login_success():
    page.goto("http://localhost:3000/login")

    # 填写表单
    page.fill("input[name='email']", "user@example.com")
    page.fill("input[name='password']", "password")

    # 提交表单
    page.click("button[type='submit']")

    # 验证跳转到 dashboard
    page.wait_for_url("**/dashboard")

    # 验证用户信息显示
    expect(page.locator(".user-name")).to_be_visible()
    expect(page.locator(".user-name")).to_have_text("user@example.com")
```

### 场景 2：测试 API 调用

```python
def test_api_data_loading():
    page.goto("http://localhost:3000")

    # 监听 API 请求
    with page.expect_request("**/api/data") as req:
        page.click("button#load-data")

    request = req.value
    assert request.method == "GET"

    # 等待并验证响应
    response = page.wait_for_response("**/api/data")
    assert response.ok

    data = response.json()
    assert len(data) > 0
    assert "id" in data[0]
```

### 场景 3：测试表单验证

```python
def test_form_validation():
    page.goto("http://localhost:3000/form")

    # 测试空表单提交
    page.click("button[type='submit']")

    # 验证错误消息
    expect(page.locator(".error-message")).to_be_visible()
    assert "required" in page.text_content(".error-message")

    # 测试邮箱格式验证
    page.fill("input[name='email']", "invalid-email")
    page.click("button[type='submit']")

    # 验证邮箱错误消息
    assert "valid email" in page.text_content(".email-error")

    # 测试正确提交
    page.fill("input[name='email']", "valid@example.com")
    page.click("button[type='submit']")

    # 验证成功状态
    expect(page.locator(".success-message")).to_be_visible()
```

### 场景 4：测试动态内容加载

```python
def test_dynamic_content():
    page.goto("http://localhost:3000")

    # 初始状态 - 没有项目
    expect(page.locator(".item")).to_have_count(0)

    # 点击加载按钮
    page.click("button#load-more")

    # 等待项目加载
    page.wait_for_selector(".item", state="visible")

    # 验证项目数量
    expect(page.locator(".item")).to_have_count_greater_than(0)

    # 验证每个项目的内容
    items = page.locator(".item")
    for i in range(items.count()):
        item = items.nth(i)
        expect(item.locator(".title")).to_be_visible()
        expect(item.locator(".description")).to_be_visible()
```

---

## 本地开发服务器管理

当测试本地 Web 应用时，可以使用 `with_server.py` 辅助脚本自动管理服务器生命周期：

### 单个服务器

```bash
python scripts/with_server.py \
  --server "npm run dev" \
  --port 5173 \
  -- python your_test.py
```

### 多个服务器

```bash
python scripts/with_server.py \
  --server "cd backend && python server.py" --port 3000 \
  --server "cd frontend && npm run dev" --port 5173 \
  -- python your_integration_test.py
```

这个脚本会：
1. 启动指定的服务器
2. 等待服务器就绪
3. 运行你的测试脚本
4. 测试完成后自动关闭服务器

**提示**：使用 `--help` 查看完整用法。

---

## 故障排除

### 问题：找不到元素

**症状**：测试失败，提示 "Timeout 30000ms exceeded"

**解决方案**：
```python
# 1. 添加显式等待
page.wait_for_selector(".target-element", timeout=5000)

# 2. 检查选择器是否正确
count = page.locator(".target-element").count()
print(f"Found {count} elements")

# 3. 截图查看实际页面状态
page.screenshot(path="debug.png")

# 4. 检查元素是否在 iframe 中
frame = page.frame_locator("iframe")
frame.click(".target-element")
```

### 问题：操作执行太快

**症状**：测试不稳定，有时成功有时失败

**解决方案**：
```python
# 1. 使用 slow_mo 减慢操作速度
browser = p.chromium.launch(headless=False, slow_mo=500)

# 2. 在关键步骤添加等待
page.click("button#submit")
page.wait_for_selector(".result")

# 3. 确保网络请求完成
page.wait_for_load_state("networkidle")
```

### 问题：测试不稳定

**症状**：同样的测试有时成功有时失败

**解决方案**：
```python
# ❌ 避免：硬编码等待
import time
time.sleep(5)

# ✅ 推荐：使用智能等待
page.wait_for_selector(".ready", state="visible")

# ✅ 推荐：等待网络空闲
page.wait_for_load_state("networkidle")

# ✅ 推荐：等待特定条件
page.wait_for_function(
    "document.readyState === 'complete'"
)
```

### 问题：跨浏览器差异

**症状**：测试在某浏览器通过，但在另一个浏览器失败

**解决方案**：
```python
# 在多个浏览器中测试
for browser_type in ["chromium", "firefox", "webkit"]:
    with sync_playwright() as p:
        browser = p[browser_type].launch(headless=False)
        # 运行测试...
```

---

## 性能优化

### 并行运行测试

```python
from playwright.sync_api import sync_playwright
import threading

def run_test(browser_type):
    with sync_playwright() as p:
        browser = p[browser_type].launch(headless=True)
        # 运行测试...

threads = []
for browser_type in ["chromium", "firefox", "webkit"]:
    thread = threading.Thread(
        target=run_test,
        args=(browser_type,)
    )
    threads.append(thread)
    thread.start()

for thread in threads:
    thread.join()
```

### 复用浏览器上下文

```python
with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context()

    # 多个页面共享上下文（cookies、storage）
    page1 = context.new_page()
    page2 = context.new_page()

    # ...
```

---

## 总结

Playwright 是一个功能强大、易于使用的测试框架。通过掌握本文介绍的知识，你就可以编写出稳定、可靠的前端测试了。

**核心要点**：

1. ✅ 使用智能等待，避免 `time.sleep()`
2. ✅ 选择稳定的选择器，优先使用 `data-testid`
3. ✅ 使用断言库，让测试更清晰
4. ✅ 善用截图和调试工具
5. ✅ 封装常用操作，提高代码复用

**下一步**：
- 尝试测试你自己的项目
- 探索 Playwright 的高级功能（trace、accessibility 等）
- 集成到 CI/CD 流程中

祝测试愉快！🎉

---

**参考资源**：
- [Playwright 官方文档](https://playwright.dev/python/)
- [with_server.py 使用指南](./skills/webapp-testing/SKILL.md)

---

*发布于：2026年3月9日*
*作者：獭獭*
