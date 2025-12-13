const mongoose = require('mongoose');
require('dotenv').config();

const cleanUsers = async () => {
  try {
    // 连接数据库
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anime-music-garden');
    console.log('MongoDB connected');

    // 获取 User 集合
    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // 检查是否有用户
    const userCount = await collection.countDocuments();
    console.log(`Found ${userCount} users in database`);

    if (userCount > 0) {
      // 删除所有用户（可选 - 仅用于开发环境）
      const result = await collection.deleteMany({});
      console.log(`✅ Deleted ${result.deletedCount} users`);
    } else {
      console.log('ℹ️  No users to delete');
    }

    // 再次确认索引
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(idx => idx.name));

    await mongoose.connection.close();
    console.log('✅ Done! Database is clean and ready for new registrations.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

cleanUsers();

