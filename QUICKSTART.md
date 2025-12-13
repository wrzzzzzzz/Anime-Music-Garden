# Quick Start Guide

## 🚀 Fast Setup (5 minutes)

### 1. Install Dependencies

**Backend (root directory):**
```bash
npm install
```

**Frontend (client directory):**
```bash
cd client
npm install
```

### 2. Setup Environment

Create `.env` in root:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/anime-music-garden
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:3000
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows - Start MongoDB service
```

**OR use MongoDB Atlas (Cloud - No installation needed):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 4. Run the App

**Terminal 1 - Backend (root directory):**
```bash
npm start
```

**Terminal 2 - Frontend (client directory):**
```bash
cd client
npm start
```

> **Note**: Both directories can run independently. Just `npm install` and `npm start` in each!

### 5. Open Browser

Visit: http://localhost:3000

## ✅ Test the App

1. **Register** a new account
2. **Create a check-in** (Dashboard → New Check-in)
3. **View your garden** (Garden page)
4. **Check statistics** (Profile page)

## 🧪 Run Tests

```bash
npm test
```

## 📮 Test API with Postman

1. Import `server/test-resources/AnimeMusicGarden.pm_collection.json` into Postman
2. Run "Register" request first to get auth token
3. Token is automatically saved for other requests

## 🎨 Features to Try

- **Real-time Updates**: Open garden in two browser tabs, add a check-in in one, see it appear in the other!
- **Interactive Garden**: Click on flowers to see details
- **Statistics**: Track your streaks and ratings
- **Beautiful UI**: Responsive design that works on mobile

## 🐛 Troubleshooting

**MongoDB not connecting?**
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env`
- For Atlas: Check network access settings

**Port already in use?**
- Change `PORT` in `.env`
- Or kill the process: `lsof -ti:5000 | xargs kill`

**Socket.io not working?**
- Ensure backend is running on port 5000
- Check browser console for errors
- Verify CORS settings

## 📚 Next Steps

- Read full README.md for detailed documentation
- Check deployment instructions for production
- Explore the codebase structure

Happy gardening! 🌸

