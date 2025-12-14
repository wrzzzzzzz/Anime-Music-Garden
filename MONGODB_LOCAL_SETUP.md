# 在 Google Cloud VM 上安装 MongoDB 指南

您不需要使用 MongoDB Atlas！可以在 VM 上直接安装 MongoDB。

## 在 VM 上安装 MongoDB

### 方法 1: 安装 MongoDB Community Edition（推荐）

```bash
# 1. 更新系统
sudo apt-get update

# 2. 安装必要的工具
sudo apt-get install -y wget curl gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release

# 3. 导入 MongoDB 公钥
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# 4. 添加 MongoDB 仓库（Ubuntu 22.04）
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 5. 更新包列表
sudo apt-get update

# 6. 安装 MongoDB
sudo apt-get install -y mongodb-org

# 7. 启动 MongoDB
sudo systemctl start mongod

# 8. 启用开机自启
sudo systemctl enable mongod

# 9. 验证安装
sudo systemctl status mongod
```

如果看到 `Active: active (running)`，说明 MongoDB 已成功启动！

### 方法 2: 使用 Ubuntu 默认仓库（如果方法 1 失败）

```bash
# 安装 MongoDB（版本可能较旧，但更稳定）
sudo apt-get update
sudo apt-get install -y mongodb

# 启动服务
sudo systemctl start mongodb
sudo systemctl enable mongodb
sudo systemctl status mongodb
```

## 验证 MongoDB 安装

```bash
# 连接到 MongoDB
mongosh

# 在 MongoDB shell 中测试
show dbs
exit
```

## 配置应用使用本地 MongoDB

在您的 `.env` 文件中使用：

```env
MONGODB_URI=mongodb://127.0.0.1:27017/anime-music-garden
```

或者：

```env
MONGODB_URI=mongodb://localhost:27017/anime-music-garden
```

## 在本地测试（Windows/Mac）

### Windows

1. 下载 MongoDB Community Server: https://www.mongodb.com/try/download/community
2. 安装并启动 MongoDB 服务
3. 在 `.env` 中使用：`MONGODB_URI=mongodb://127.0.0.1:27017/anime-music-garden`

### Mac

```bash
# 使用 Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux

```bash
# 使用与 VM 相同的安装步骤
```

## 常见问题

### 问题 1: MongoDB 服务无法启动

```bash
# 查看日志
sudo journalctl -u mongod -n 50

# 检查数据目录权限
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chmod 755 /var/lib/mongodb
```

### 问题 2: 端口被占用

```bash
# 检查端口
sudo netstat -tlnp | grep 27017

# 如果被占用，停止其他 MongoDB 实例
sudo systemctl stop mongod
```

### 问题 3: 连接被拒绝

确保 MongoDB 服务正在运行：
```bash
sudo systemctl status mongod
sudo systemctl start mongod
```

## MongoDB 基本管理命令

```bash
# 启动 MongoDB
sudo systemctl start mongod

# 停止 MongoDB
sudo systemctl stop mongod

# 重启 MongoDB
sudo systemctl restart mongod

# 查看状态
sudo systemctl status mongod

# 查看日志
sudo journalctl -u mongod -f
```

## 数据备份（可选）

```bash
# 备份数据库
mongodump --db=anime-music-garden --out=/backup/$(date +%Y%m%d)

# 恢复数据库
mongorestore --db=anime-music-garden /backup/20240101/anime-music-garden
```

现在您可以在 VM 上使用本地 MongoDB，无需 MongoDB Atlas！

