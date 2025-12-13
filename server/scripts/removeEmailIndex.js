const mongoose = require('mongoose');
require('dotenv').config();

const removeEmailIndex = async () => {
  try {
    // 连接数据库
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anime-music-garden');
    console.log('MongoDB connected');

    // 获取 User 集合
    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // 获取所有索引
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);

    // 删除 email_1 索引（如果存在）
    try {
      await collection.dropIndex('email_1');
      console.log('✅ Successfully removed email_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  email_1 index does not exist, nothing to remove');
      } else {
        throw error;
      }
    }

    // 显示更新后的索引
    const updatedIndexes = await collection.indexes();
    console.log('Updated indexes:', updatedIndexes);

    await mongoose.connection.close();
    console.log('✅ Done! You can now register users without the email index error.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

removeEmailIndex();

