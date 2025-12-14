# MongoDB Atlas 设置指南

## 📋 步骤 1: 创建 MongoDB Atlas 账户

1. 访问 https://www.mongodb.com/cloud/atlas
2. 注册/登录账户
3. 创建新项目（可选）

## 📋 步骤 2: 创建集群

1. 点击 "Build a Database"
2. 选择免费套餐 (M0 - Free)
3. 选择云提供商和区域（选择离你最近的）
4. 点击 "Create"

## 📋 步骤 3: 创建数据库用户

1. 在 "Database Access" 页面
2. 点击 "Add New Database User"
3. 选择 "Password" 认证方式
4. 输入用户名和密码（记住这些信息！）
5. 设置用户权限为 "Atlas admin" 或 "Read and write to any database"
6. 点击 "Add User"

## 📋 步骤 4: 配置网络访问

1. 在 "Network Access" 页面
2. 点击 "Add IP Address"
3. 对于开发环境，可以添加 `0.0.0.0/0`（允许所有 IP）
   - ⚠️ **注意**: 生产环境应该只添加特定的 IP 地址
4. 点击 "Confirm"

## 📋 步骤 5: 获取连接字符串

1. 在 "Database" 页面，点击 "Connect"
2. 选择 "Connect your application"
3. 选择驱动为 "Node.js"，版本为 "5.5 or later"
4. 复制连接字符串，格式如下：
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
   ```

## 📋 步骤 6: 配置项目

1. 在项目根目录创建 `.env` 文件（如果还没有）
2. 添加以下内容：
   ```env
   MONGODB_URI=mongodb+srv://wrzwrz_db_user:GUBBXrcTNGEYAE2C@cluster0.maww3zs.mongodb.net/anime-music-garden
   ```
   **重要**: 
   - 将 `<username>` 替换为你的数据库用户名
   - 将 `<password>` 替换为你的数据库密码
   - 将 `cluster0.xxxxx.mongodb.net` 替换为你的集群地址
   - 在末尾添加 `/anime-music-garden` 作为数据库名称

3. 完整的连接字符串示例：
   ```env
   MONGODB_URI=mongodb+srv://wrzwrz_db_user:GUBBXrcTNGEYAE2C@cluster0.maww3zs.mongodb.net/anime-music-garden
   ```

## 📋 步骤 7: 测试连接

运行应用：
```bash
npm start
```

如果连接成功，你会看到：
```
MongoDB connected: cluster0-shard-00-00.xxxxx.mongodb.net
Database: anime-music-garden
```

## 🔒 安全提示

1. **不要将 `.env` 文件提交到 Git**
   - 确保 `.env` 在 `.gitignore` 中
   - 使用 `.env.example` 作为模板

2. **生产环境安全**
   - 使用强密码
   - 限制 IP 访问（不要使用 0.0.0.0/0）
   - 定期轮换密码
   - 使用环境变量而不是硬编码

3. **密码包含特殊字符**
   - 如果密码包含特殊字符（如 `@`, `#`, `%` 等），需要进行 URL 编码
   - 例如：`@` → `%40`, `#` → `%23`

## 🐛 常见问题

### 连接超时
- 检查网络访问设置（IP 白名单）
- 检查防火墙设置
- 确认连接字符串格式正确

### 认证失败
- 检查用户名和密码是否正确
- 确认数据库用户已创建
- 检查用户权限设置

### 数据库不存在
- MongoDB Atlas 会自动创建数据库
- 确保连接字符串末尾包含数据库名称

## 📚 更多资源

- [MongoDB Atlas 文档](https://docs.atlas.mongodb.com/)
- [Mongoose 连接指南](https://mongoosejs.com/docs/connections.html)

