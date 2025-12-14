# Google Cloud VM 部署指南

本指南将帮助您在 Google Cloud VM 实例上部署 Anime Music Garden 应用。

## 第一部分：在本地准备应用

### 步骤 1: 构建客户端

```bash
cd client
npm run build
cd ..
```

这会在 `client/dist` 目录生成生产构建文件。

### 步骤 2: 创建 .env 文件

在项目根目录创建 `.env` 文件：

```bash
# 服务器配置
PORT=5000
NODE_ENV=production

# MongoDB (使用 MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/anime-music-garden

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client URL (稍后在 VM 上会更新为 VM 的 IP)
CLIENT_URL=http://localhost:3000
```

### 步骤 3: 测试本地运行

确保修改后的 server.js 可以同时服务 API 和前端：

```bash
npm start
```

访问 `http://localhost:5000`，应该能看到前端界面，API 也应该正常工作。

### 步骤 4: 提交代码到 Git

```bash
# 创建新分支
git checkout -b deploy

# 添加所有更改
git add .

# 提交
git commit -m "prepare for deployment"

# 推送到远程
git push --set-upstream origin deploy
```

---

## 第二部分：在 Google Cloud VM 上设置

### 步骤 1: 创建 VM 实例

1. 登录 [Google Cloud Console](https://console.cloud.google.com/)
2. 导航到 **Compute Engine** > **VM instances**
3. 点击 **Create Instance**
4. 配置：
   - **Name**: `anime-music-garden-vm`
   - **Region**: 选择离您最近的区域
   - **Machine type**: `e2-micro` (免费层) 或 `e2-small`
   - **Boot disk**: Ubuntu 22.04 LTS
   - **Firewall**: 勾选 **Allow HTTP traffic** 和 **Allow HTTPS traffic**
5. 点击 **Create**

### 步骤 2: 配置防火墙规则（开放端口 5000）

1. 在 VM 实例列表中，点击您的 VM 名称
2. 在 **Network tags** 部分，记下或添加标签（例如：`anime-music-garden`）
3. 导航到 **VPC network** > **Firewall**
4. 点击 **Create Firewall Rule**
5. 配置：
   - **Name**: `allow-anime-music-garden`
   - **Direction**: Ingress
   - **Targets**: Specified target tags，输入 `anime-music-garden`
   - **Source IP ranges**: `0.0.0.0/0`
   - **Protocols and ports**: 选择 **TCP**，端口 `5000`
6. 点击 **Create**

### 步骤 3: 连接到 VM

使用 SSH 连接到 VM：

```bash
# 在本地终端
gcloud compute ssh anime-music-garden-vm --zone=YOUR_ZONE
```

或者在 Cloud Console 中点击 VM 实例旁边的 **SSH** 按钮。

### 步骤 4: 在 VM 上安装必要软件

```bash
# 更新系统
sudo apt-get update

# 安装 Node.js (使用 NodeSource 仓库安装 Node.js 18)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version

# 安装 MongoDB
# 导入 MongoDB 公钥
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# 添加 MongoDB 仓库
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 更新包列表
sudo apt-get update

# 安装 MongoDB
sudo apt-get install -y mongodb-org

# 启动 MongoDB 服务
sudo systemctl start mongod

# 启用 MongoDB 开机自启
sudo systemctl enable mongod

# 验证 MongoDB 运行状态
sudo systemctl status mongod
```

**注意**: 如果上面的 MongoDB 安装命令失败（可能是 Ubuntu 版本问题），可以使用以下替代方法：

```bash
# 方法 2: 使用 Ubuntu 默认仓库（版本可能较旧但更稳定）
sudo apt-get install -y mongodb

# 启动服务
sudo systemctl start mongodb
sudo systemctl enable mongodb
sudo systemctl status mongodb
```

### 步骤 5: 克隆代码到 VM

```bash
# 克隆您的仓库（使用 HTTPS）
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 进入项目目录
cd YOUR_REPO_NAME

# 切换到 deploy 分支
git checkout deploy

# 进入 server 目录安装依赖
cd server
npm install
cd ..

# 进入 client 目录安装依赖
cd client
npm install
```

### 步骤 6: 配置客户端环境变量

首先，获取 VM 的公网 IP 地址：

1. 在 Cloud Console 的 VM instances 列表中查看 **External IP**
2. 或者运行：`curl ifconfig.me`

然后创建客户端的 `.env` 文件：

```bash
cd client

# 创建 .env 文件（替换 YOUR_VM_IP 为实际 IP）
cat > .env << EOF
VITE_API_URL=http://YOUR_VM_IP:5000
EOF

# 验证文件内容
cat .env
```

**注意**: 如果使用 Vite，环境变量需要以 `VITE_` 开头。但您的项目使用 `/api` 作为 baseURL，所以可能不需要这个。让我们检查一下是否需要修改。

### 步骤 7: 构建客户端

```bash
# 在 client 目录
npm run build
```

### 步骤 8: 配置服务器环境变量

回到项目根目录，创建服务器的 `.env` 文件：

```bash
cd ..

# 创建 .env 文件（使用本地 MongoDB）
cat > .env << EOF
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://127.0.0.1:27017/anime-music-garden
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://YOUR_VM_IP:5000
SERVER_DIR=$(pwd)
EOF

# 验证
cat .env
```

**注意**: 
- 如果使用本地 MongoDB（推荐），使用 `mongodb://127.0.0.1:27017/anime-music-garden`
- 如果仍想使用 MongoDB Atlas，使用 `mongodb+srv://username:password@cluster0.mongodb.net/anime-music-garden`

### 步骤 9: 测试运行

```bash
# 在项目根目录
npm start
```

如果一切正常，应该能看到服务器启动。按 `Ctrl+C` 停止。

---

## 第三部分：设置 systemd 服务

### 步骤 1: 获取路径信息

```bash
# 获取服务器目录的完整路径
pwd
# 例如: /home/username/anime-music-garden

# 获取 node 可执行文件的路径
which node
# 例如: /usr/bin/node
```

### 步骤 2: 创建 systemd 服务文件

```bash
sudo nano /etc/systemd/system/anime-music-garden.service
```

将以下内容粘贴进去（**替换路径为您的实际路径**）：

```ini
[Unit]
Description=Anime Music Garden Server
# Documentation=https://
# Author: Your Name

[Service]
# Start Service
ExecStart=/usr/bin/node /home/YOUR_USERNAME/anime-music-garden/server/server.js
WorkingDirectory=/home/YOUR_USERNAME/anime-music-garden

# Options Stop and Restart
# ExecStop=
# ExecReload=

# Restart service after 10 seconds if node service crashes
RestartSec=10
Restart=always
# Restart=on-failure

# Output to syslog
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=nodejs-anime-music-garden

# #### please, not root users
# RHEL/Fedora uses 'nobody'
# User=nobody
# Debian/Ubuntu uses 'nogroup', RHEL/Fedora uses 'nobody'
# Group=nogroup

# ENV variables
Environment=PATH=/usr/bin:/usr/local/bin
Environment=SERVER_DIR=/home/YOUR_USERNAME/anime-music-garden
Environment=PORT=5000
Environment=NODE_ENV=production
Environment=MONGODB_URI="mongodb://127.0.0.1:27017/anime-music-garden"
Environment=JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
Environment=CLIENT_URL="http://YOUR_VM_IP:5000"

[Install]
WantedBy=multi-user.target
```

**重要**: 替换以下内容：
- `YOUR_USERNAME`: 您的 VM 用户名
- `anime-music-garden`: 您的项目目录名
- `YOUR_VM_IP`: VM 的公网 IP
- MongoDB URI 和 JWT Secret

保存文件（`Ctrl+O`, `Enter`, `Ctrl+X`）

### 步骤 3: 启用并启动服务

```bash
# 重新加载 systemd 配置
sudo systemctl daemon-reload

# 启用服务（开机自启）
sudo systemctl enable anime-music-garden.service

# 启动服务
sudo systemctl start anime-music-garden.service

# 检查服务状态
sudo systemctl status anime-music-garden.service
```

### 步骤 4: 查看日志

```bash
# 查看最近的日志
journalctl -u anime-music-garden.service | tail -50

# 实时查看日志
journalctl -u anime-music-garden.service -f
```

### 步骤 5: 测试应用

在浏览器中访问：
```
http://YOUR_VM_IP:5000
```

应该能看到应用界面！

---

## 常用命令

### 服务管理

```bash
# 启动服务
sudo systemctl start anime-music-garden.service

# 停止服务
sudo systemctl stop anime-music-garden.service

# 重启服务
sudo systemctl restart anime-music-garden.service

# 查看状态
sudo systemctl status anime-music-garden.service

# 查看日志
journalctl -u anime-music-garden.service -n 50
```

### 更新应用

```bash
# 1. 在本地提交新代码
git add .
git commit -m "update"
git push

# 2. 在 VM 上拉取更新
cd ~/anime-music-garden
git pull

# 3. 重新构建客户端（如果有前端更改）
cd client
npm run build
cd ..

# 4. 重启服务
sudo systemctl restart anime-music-garden.service
```

---

## 故障排除

### 问题 1: 服务无法启动

```bash
# 查看详细错误
journalctl -u anime-music-garden.service -n 100

# 检查路径是否正确
ls -la /home/YOUR_USERNAME/anime-music-garden/server/server.js

# 检查 node 路径
which node
```

### 问题 2: 无法访问应用

1. 检查防火墙规则是否正确配置
2. 检查服务是否运行：`sudo systemctl status anime-music-garden.service`
3. 检查端口是否监听：`sudo netstat -tlnp | grep 5000`

### 问题 3: MongoDB 连接失败

1. 确保 MongoDB Atlas 的 IP 白名单包含 VM 的 IP（或 `0.0.0.0/0`）
2. 检查环境变量中的 MongoDB URI 是否正确
3. 查看日志：`journalctl -u anime-music-garden.service | grep -i mongo`

### 问题 4: 前端无法加载

1. 确保 `client/dist` 目录存在且包含构建文件
2. 检查 `server.js` 中的路径配置
3. 查看服务器日志确认静态文件服务是否正常

---

## 安全建议

1. **不要使用 root 用户运行服务**：在 systemd 文件中取消注释 `User=nobody`
2. **使用强 JWT Secret**：生成随机字符串
3. **限制 MongoDB IP 白名单**：只允许必要的 IP
4. **定期更新系统**：`sudo apt-get update && sudo apt-get upgrade`
5. **考虑使用 HTTPS**：配置 SSL 证书（可以使用 Let's Encrypt）

---

祝部署顺利！🎉

