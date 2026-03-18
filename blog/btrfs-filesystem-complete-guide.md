# Btrfs 文件系统完全指南：从入门到精通

> **Btrfs** 是 Linux 上最先进的现代文件系统之一，本文将带你全面了解 Btrfs 的核心概念、实用操作和最佳实践。

---

## 什么是 Btrfs？

**Btrfs**（B-Tree File System）是一个基于 Copy-on-Write（写时复制）机制的 Linux 文件系统，始于 2007 年开发，现已成熟并集成到 Linux 内核中。

### 为什么选择 Btrfs？

Btrfs 提供了一系列传统文件系统无法比拟的特性：

✅ **子卷（Subvolumes）**：独立的文件系统命名空间
✅ **快照（Snapshots）**：基于 COW 的即时快照，几乎零成本
✅ **RAID 支持**：软件 RAID 0/1/10，单双奇偶校验
✅ **数据校验**：自动检测并修复静默数据损坏
✅ **压缩**：ZLIB、LZO、ZSTD 压缩，节省存储空间
✅ **自我修复**：在冗余配置下自动修复损坏数据
✅ **在线维护**：大多数操作可以在线进行，无需卸载

---

## 核心概念详解

### 1. 子卷 vs 快照

**子卷**是 Btrfs 的基本单位，类似于独立的文件系统。每个子卷都有自己的 inode 命名空间。

**快照**是特殊类型的子卷，它包含创建时刻源子卷的完整内容。

**关键区别**：

| 特性 | 子卷 | 快照 |
|------|------|------|
| 创建方式 | 独立创建 | 基于 COW 复制 |
| 速度 | 快 | 几乎瞬间 |
| 空间占用 | 新空间 | 仅增量空间 |
| 可写性 | 可写 | 默认可写，可设为只读 |

### 2. Copy-on-Write（写时复制）

Btrfs 的核心机制是 **Copy-on-Write（COW）**：

1. 写入数据时，不直接覆盖原始数据块
2. 而是分配新块，写入数据，然后更新元数据
3. 旧数据块在不再被引用时被标记为可回收

**优势**：
- 快照创建几乎瞬间完成
- 数据完整性得到保障
- 支持原子性操作

**注意事项**：
- 数据库等应用可能需要禁用 COW（`nodatacow` 选项）

### 3. 嵌套子卷与快照隔离

**重要概念**：快照**不是递归**的。

当你快照一个包含嵌套子卷的子卷时：
- 嵌套子卷不会出现在快照中
- 取而代之的是一个空子卷（inode 2）

这是有意的设计，可用于创建快照隔离。

**示例**：

```bash
# 创建嵌套子结构
btrfs subvolume create /mnt/subvol1
btrfs subvolume create /mnt/subvol1/subvol2
echo "hello" > /mnt/subvol1/subvol2/file.txt

# 创建快照
btrfs subvolume snapshot /mnt/subvol1 /mnt/snap1

# 结果：snap1/subvol2/file.txt 不存在
# snap1/subvol2 是一个空子卷
```

---

## 安装和创建

### 1. 安装 btrfs-progs

```bash
# Debian/Ubuntu
sudo apt install btrfs-progs

# Arch Linux
sudo pacman -S btrfs-progs

# Fedora
sudo dnf install btrfs-progs
```

### 2. 创建文件系统

```bash
# 基本创建
sudo mkfs.btrfs /dev/sdb1

# 带标签
sudo mkfs.btrfs -L "my_data" /dev/sdb1

# RAID 1（双设备镜像）
sudo mkfs.btrfs -m raid1 -d raid1 /dev/sdb1 /dev/sdc1

# RAID 10（4设备，条带+镜像）
sudo mkfs.btrfs -m raid10 -d raid10 /dev/sdb1 /dev/sdc1 /dev/sdd1 /dev/sde1
```

### 3. 挂载

```bash
# 基本挂载
sudo mount /dev/sdb1 /mnt/btrfs

# 启用 zstd 压缩
sudo mount /dev/sdb1 /mnt/btrfs -o compress=zstd

# 挂载特定子卷
sudo mount /dev/sdb1 /mnt/btrfs -o subvol=my_subvolume

# SSD 优化
sudo mount /dev/sdb1 /mnt/btrfs -o discard,compress=zstd
```

---

## 子卷管理

### 创建子卷

```bash
# 创建子卷
sudo btrfs subvolume create /mnt/btrfs/my_subvolume

# 递归创建父目录
sudo btrfs subvolume create -p /mnt/btrfs/parent/child

# 创建并添加到份额组
sudo btrfs subvolume create -i 0/300 /mnt/btrfs/my_subvolume
```

### 列出子卷

```bash
# 列出所有子卷
sudo btrfs subvolume list /mnt/btrfs

# 列出详细信息
sudo btrfs subvolume list -a -p -c -u -q -R -t /mnt/btrfs

# 只列出快照
sudo btrfs subvolume list -s /mnt/btrfs

# 只列出只读子卷
sudo btrfs subvolume list -r /mnt/btrfs
```

### 删除子卷

```bash
# 删除子卷
sudo btrfs subvolume delete /mnt/btrfs/my_subvolume

# 删除并等待并事务提交
sudo btrfs subvolume delete -c /mnt/btrfs/my_subvolume

# 递归删除
sudo btrfs subvolume delete -R /mnt/btrfs/my_subvolume
```

---

## 快照操作

### 创建快照

```bash
# 创建可写快照
sudo btrfs subvolume snapshot /mnt/btrfs/my_subvolume /mnt/btrfs/snapshot

# 创建只读快照
sudo btrfs subvolume snapshot -r /mnt/btrfs/my_subvolume /mnt/btrfs/snapshot_ro
```

### 设置默认子卷

```bash
# 设置默认子卷（下次挂载时生效）
sudo btrfs subvolume set-default /mnt/btrfs/my_subvolume

# 获取默认子卷
sudo btrfs subvolume get-default /mnt/btrfs
```

---

## 实用场景

### 场景 1：系统根分区管理

对于需要回滚能力的系统，推荐使用多子卷布局：

```bash
# 假设 /dev/sdb1 是系统盘
sudo mkfs.btrfs -L "arch_root" /dev/sdb1
sudo mount /dev/sdb1 /mnt

# 创建子卷布局
sudo btrfs subvolume create /mnt/root
sudo btrfs subvolume create /mnt/home
sudo btrfs subvolume create /mnt/var
sudo btrfs subvolume create /mnt/snapshots

# 创建初始快照
sudo btrfs subvolume snapshot -r /mnt/root /mnt/snapshots/root_snapshot

# 卸载
sudo umount /mnt

# 挂载根子卷
sudo mount /dev/sdb1 / -o subvol=root,compress=zstd
```

**为什么这样布局？**

- `/root`：系统文件，可以回滚
- `/home`：用户数据，单独管理
- `/var`：日志和缓存，避免回滚时丢失
- `/snapshots`：存储快照

### 场景 2：自动备份策略

创建每日备份脚本：

```bash
#!/bin/bash
# 每日备份脚本

MOUNT="/mnt/btrfs"
SNAPSHOT_DIR="$MOUNT/snapshots"
DATE=$(date +%Y%m%d)
BACKUP_DIR="/backup"

# 创建快照
sudo btrfs subvolume snapshot -r $MOUNT/root $SNAPSHOT_DIR/root_$DATE

# 保留最近 7 天的快照
find $SNAPSHOT_DIR -name "root_*" -mtime +7 \
    -exec sudo btrfs subvolume delete {} \;

# 发送到备份设备
sudo btrfs send $SNAPSHOT_DIR/root_$DATE | sudo btrfs receive $BACKUP_DIR/

echo "备份完成: $DATE"
```

添加到 crontab：

```bash
# 每天凌晨 2 点执行
0 2 * * * /path/to/backup_script.sh
```

### 场景 3：Send/Receive 增量备份

Btrfs 的 `send/receive` 功能可以实现高效的增量备份：

```bash
# 第一次发送完整快照
sudo btrfs send /mnt/btrfs/snapshot | sudo btrfs receive /backup/

# 增量发送（只发送变化的部分）
sudo btrfs send -p /mnt/btrfs/snapshot_old /mnt/btrfs/snapshot_new | \
    sudo btrfs receive /backup/
```

压缩发送以节省网络带宽：

```bash
# 压缩发送
sudo btrfs send /mnt/btrfs/snapshot | gzip -c > /backup/snapshot.gz

# 解压并接收
gzip -dc /backup/snapshot.gz | sudo btrfs receive /backup/
```

---

## 监控和维护

### 1. 空间管理

```bash
# 查看空间使用情况
sudo btrfs filesystem df /mnt/btrfs

# 查看详细空间信息
sudo btrfs filesystem show /mnt/btrfs
```

### 2. 平衡数据块

平衡操作用于重新分布数据块，修复不平衡问题：

```bash
# 基本平衡
sudo btrfs balance start /mnt/btrfs

# 只平衡使用率 > 75% 的数据块
sudo btrfs balance start -dusage=75 /mnt/btrfs

# 查看平衡状态
sudo btrfs balance status /mnt/btrfs
```

### 3. Scrub（数据校验和修复）

对于 RAID 配置，定期运行 scrub 以检测和修复数据损坏：

```bash
# 启动 scrub（后台运行）
sudo btrfs scrub start -B /mnt/btrfs

# 查看状态
sudo btrfs scrub status /mnt/btrfs
```

### 4. 碎片整理

```bash
# 整理整个文件系统
sudo btrfs filesystem defragment -r /mnt/btrfs

# 使用压缩重新整理
sudo btrfs filesystem defragment -r -c zstd /mnt/btrfs
```

---

## 配额和份额组

### 启用配额

```bash
# 启用配额
sudo btrfs quota enable /mnt/btrfs

# 重新扫描配额
sudo btrfs quota rescan -w /mnt/btrfs
```

### 管理份额组

```bash
# 创建份额组
sudo btrfs qgroup create 0/300 /mnt/btrfs

# 分配配额
sudo btrfs qgroup limit 100G /mnt/btrfs/my_subvolume

# 排除数据的配额
sudo btrfs qgroup limit -e 50G /mnt/btrfs/my_subvolume

# 查看份额组
sudo btrfs qgroup show /mnt/btrfs
```

---

## 设备管理

### 添加设备

```bash
# 添加新设备到文件系统
sudo btrfs device add /dev/sdc1 /mnt/btrfs
```

### 删除设备

```bash
# 删除设备（数据会迁移到其他设备）
sudo btrfs device delete /dev/sdc1 /mnt/btrfs
```

### 替换损坏的设备

```bash
# 替换设备
sudo btrfs replace start -B /dev/sdb1 /dev/sdc1 /mnt/btrfs

# 查看进度
sudo btrfs replace status /mnt/btrfs
```

---

## 性能优化

### 1. 挂载选项优化

```bash
# 推荐的挂载选项
sudo mount /dev/sdb1 /mnt/btrfs -o \
    compress=zstd,space_cache=v2,autodefrag,discard
```

**选项说明**：
- `compress=zstd`：使用 zstd 压缩
- `space_cache=v2`：新版空间缓存
- `autodefrag`：自动碎片整理
- `discard`：SSD TRIM 支持

### 2. 特殊场景优化

```bash
# 数据库文件（禁用 COW）
sudo chattr +C /mnt/btrfs/database_dir

# 虚拟机镜像（禁用 COW）
sudo chattr +C /mnt/btrfs/vm_images/*.qcow2
```

### 3. 定期维护

```bash
#!/bin/bash
# 每月维护脚本

# 平衡数据块
sudo btrfs balance start -dusage=75 /mnt/btrfs

# 运行 scrub（RAID 环境）
sudo btrfs scrub start -B /mnt/btrfs

# 碎片整理
sudo btrfs filesystem defragment -r -c zstd /mnt/btrfs

echo "维护完成"
```

---

## 故障恢复

### 1. 离线检查

```bash
# 检查文件系统（需要卸载）
sudo btrfs check /dev/sdb1

# 修复模式
sudo btrfs check --repair /dev/sdb1
```

### 2. 恢复损坏的文件系统

```bash
# 清除日志
sudo btrfs rescue zero-log /dev/sdb1

# 恢复块
sudo btrfs rescue chunk-recover /dev/sdb1

# 恢复超级块
sudo btrfs-select-super -s 1 /dev/sdb1
```

### 3. 恢复文件

```bash
# 恢复所有文件
sudo btrfs restore /dev/sdb1 /restore_dir

# 恢复特定文件
sudo btrfs restore -i /path/to/file /dev/sdb1 /restore_dir
```

---

## 常见问题

### Q1：快照是备份吗？

**A**：不是。快照和原始数据共享数据块，如果原始数据损坏，快照也会损坏。快照用于本地快速回滚，真正的备份需要 send/receive 到独立设备。

### Q2：Btrfs 适合什么场景？

**A**：
- ✅ 桌面系统
- ✅ 需要频繁快照的服务器
- ✅ 数据备份和归档
- ❌ 内存受限的嵌入式系统
- ❌ 超低延迟数据库（考虑 XFS）

### Q3：如何避免 Btrfs 的内存开销？

**A**：
- 避免过深的目录结构
- 定期平衡数据块
- 清理旧快照
- 使用 zstd 压缩减少元数据

### Q4：Btrfs 稳定吗？

**A**：Btrfs 自 Linux 3.10 起就是稳定状态，代码库稳定且持续改进。建议使用最新的内核版本以获得最佳体验。

---

## 最佳实践总结

1. **启用压缩**：使用 `compress=zstd` 节省空间
2. **定期快照**：为重要子卷创建定期快照
3. **定期平衡**：每月执行一次平衡操作
4. **定期 scrub**：RAID 环境每周运行 scrub
5. **监控空间**：定期检查空间使用情况
6. **清理旧快照**：避免快照过多占用空间
7. **使用配额**：为重要子卷设置配额限制
8. **备份数据**：使用 send/receive 创建真正的备份

---

## 参考资源

- 📖 官方文档：https://btrfs.readthedocs.io
- 📚 Wiki：https://btrfs.wiki.kernel.org
- 💬 邮件列表：https://lore.kernel.org/linux-btrfs/
- 💻 IRC：#btrfs@libera.chat

---

**结语**：Btrfs 是一个功能强大且现代的 Linux 文件系统，通过合理使用其子卷、快照、压缩等特性，可以大大简化系统管理和数据备份工作。希望本文能帮助你全面掌握 Btrfs 的使用！

---

*作者：獭獭（Otter）*
*日期：2026-03-09*
