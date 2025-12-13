# MongoDB Compass Testing Guide

This guide explains how to use MongoDB Compass to test and inspect the Anime Music Garden application's database.

## 📋 Prerequisites

1. **MongoDB Compass** installed ([Download here](https://www.mongodb.com/try/download/compass))
2. **MongoDB running** (local or Atlas)
3. **Application running** (to generate data)

## 🔌 Connecting to the Database

### Option 1: Local MongoDB (Default)

1. **Start MongoDB** (if not already running):
   ```bash
   # Windows: Start MongoDB service from Services panel
   # Or run: mongod
   ```

2. **Open MongoDB Compass**

3. **Connection String**:
   ```
   mongodb://localhost:27017
   ```
   Or simply click "Fill in connection fields individually" and use:
   - **Host**: `localhost`
   - **Port**: `27017`

4. **Click "Connect"**

5. **Select Database**: `anime-music-garden`

### Option 2: MongoDB Atlas (Cloud)

1. **Get Connection String** from your `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/anime-music-garden
   ```

2. **In MongoDB Compass**:
   - Paste the connection string
   - Or use "Fill in connection fields individually" with your Atlas credentials

3. **Click "Connect"**

## 📊 Database Structure

The application uses **one database** with **two collections**:

### Collections

1. **`users`** - User accounts and profiles
2. **`checkins`** - User check-ins (anime episodes, songs, etc.)

## 🔍 Exploring the Data

### 1. View Users Collection

**Location**: `anime-music-garden` → `users`

**Document Structure**:
```json
{
  "_id": ObjectId("..."),
  "username": "testuser",
  "password": "$2a$12$...",  // Hashed password
  "garden": {
    "flowers": [ObjectId("..."), ...],  // References to check-ins
    "totalCheckIns": 5,
    "currentStreak": 3,
    "longestStreak": 5
  },
  "createdAt": ISODate("2025-12-14T..."),
  "updatedAt": ISODate("2025-12-14T...")
}
```

**What to Test**:
- ✅ Verify user registration creates documents
- ✅ Check password is hashed (not plain text)
- ✅ Verify `garden` statistics update when check-ins are created
- ✅ Check `username` uniqueness constraint

### 2. View Check-ins Collection

**Location**: `anime-music-garden` → `checkins`

**Document Structure**:
```json
{
  "_id": ObjectId("..."),
  "user": ObjectId("..."),  // Reference to User
  "type": "anime",  // or "opening", "ending", "insert"
  "title": "Attack on Titan",
  "animeTitle": "Attack on Titan",
  "animeId": 16498,
  "animeImage": "https://...",
  "episode": 1,
  "rating": 9,
  "emotion": "excited",
  "notes": "Great episode!",
  "date": ISODate("2025-12-14T..."),
  "flowerColor": "#FF6B6B",
  "flowerSize": 1.5,
  "position": {
    "x": 45.2,
    "y": 67.8
  },
  "createdAt": ISODate("2025-12-14T..."),
  "updatedAt": ISODate("2025-12-14T...")
}
```

**What to Test**:
- ✅ Verify check-ins are created with correct user reference
- ✅ Check different types (anime, opening, ending, insert)
- ✅ Verify `flowerColor` and `flowerSize` are calculated correctly
- ✅ Check `position` coordinates are set
- ✅ Verify `rating` is between 1-10
- ✅ Check `emotion` is from allowed enum values

## 🧪 Testing Scenarios

### Scenario 1: Test User Registration

1. **Register a new user** in the application (via UI or Postman)

2. **In Compass**:
   - Go to `users` collection
   - Click "Refresh" (or press F5)
   - Find your new user document
   - Verify:
     - `username` is correct
     - `password` is hashed (starts with `$2a$`)
     - `garden.totalCheckIns` is 0
     - `garden.currentStreak` is 0
     - `garden.longestStreak` is 0

### Scenario 2: Test Check-in Creation

1. **Create a check-in** in the application

2. **In Compass**:
   - Go to `checkins` collection
   - Click "Refresh"
   - Find your new check-in
   - Verify:
     - `user` field references a valid user `_id`
     - `type` is one of: `anime`, `opening`, `ending`, `insert`
     - `title` is present
     - `rating` is between 1-10
     - `emotion` is valid
     - `flowerColor` is a hex color (e.g., `#FF6B6B`)
     - `flowerSize` is between 0.5-2.0
     - `position.x` and `position.y` are between 0-100

3. **Check User Update**:
   - Go back to `users` collection
   - Find the user who created the check-in
   - Verify:
     - `garden.totalCheckIns` increased
     - `garden.flowers` array contains the new check-in `_id`
     - `garden.currentStreak` updated (if consecutive days)

### Scenario 3: Test Check-in Update

1. **Update a check-in** in the application (change rating, emotion, etc.)

2. **In Compass**:
   - Go to `checkins` collection
   - Find the updated check-in
   - Verify:
     - `updatedAt` timestamp changed
     - Fields you modified are updated
     - `flowerColor` and `flowerSize` recalculated if rating changed

### Scenario 4: Test Check-in Deletion

1. **Delete a check-in** in the application

2. **In Compass**:
   - Go to `checkins` collection
   - Verify the document is removed

3. **Check User Update**:
   - Go to `users` collection
   - Find the user
   - Verify:
     - `garden.totalCheckIns` decreased
     - `garden.flowers` array no longer contains the deleted check-in `_id`

### Scenario 5: Test Streak Calculation

1. **Create check-ins on consecutive days**

2. **In Compass**:
   - Go to `users` collection
   - Monitor `garden.currentStreak` and `garden.longestStreak`
   - Verify they update correctly:
     - `currentStreak` increases with consecutive days
     - `longestStreak` updates if `currentStreak` exceeds it
     - `currentStreak` resets to 0 if a day is skipped

## 🔧 Manual Testing in Compass

### Create a Test User Manually

1. **In Compass**:
   - Go to `users` collection
   - Click "INSERT DOCUMENT"
   - Use this structure:
   ```json
   {
     "username": "testuser_manual",
     "password": "test123",
     "garden": {
       "flowers": [],
       "totalCheckIns": 0,
       "currentStreak": 0,
       "longestStreak": 0
     }
   }
   ```
   - **Note**: Password will be hashed automatically by the pre-save hook when saved through the app, but if you insert directly, it won't be hashed. Better to use the app's registration endpoint.

### Create a Test Check-in Manually

1. **Get a User ID**:
   - Go to `users` collection
   - Copy a user's `_id`

2. **In Compass**:
   - Go to `checkins` collection
   - Click "INSERT DOCUMENT"
   - Use this structure:
   ```json
   {
     "user": ObjectId("PASTE_USER_ID_HERE"),
     "type": "anime",
     "title": "Test Anime",
     "animeTitle": "Test Anime",
     "rating": 8,
     "emotion": "happy",
     "date": new Date(),
     "flowerColor": "#FF6B6B",
     "flowerSize": 1.2,
     "position": {
       "x": 50,
       "y": 50
     }
   }
   ```

3. **Verify in Application**:
   - Log in as that user
   - Check if the test check-in appears in the garden

### Query Examples

**Find all check-ins for a specific user**:
```javascript
{ "user": ObjectId("USER_ID_HERE") }
```

**Find check-ins by type**:
```javascript
{ "type": "anime" }
```

**Find check-ins with high ratings**:
```javascript
{ "rating": { "$gte": 8 } }
```

**Find check-ins by emotion**:
```javascript
{ "emotion": "excited" }
```

**Find check-ins from today**:
```javascript
{ "date": { "$gte": new Date(new Date().setHours(0,0,0,0)) } }
```

**Find users with streaks**:
```javascript
{ "garden.currentStreak": { "$gt": 0 } }
```

## ⚠️ Important Notes

1. **Password Hashing**: 
   - Passwords are hashed using bcrypt when saved through the app
   - If you manually insert a user, the password won't be hashed
   - Always use the app's registration endpoint for creating users

2. **ObjectId References**:
   - `user` field in `checkins` references `users._id`
   - `garden.flowers` in `users` references `checkins._id`
   - These relationships are maintained by the application code

3. **Timestamps**:
   - `createdAt` and `updatedAt` are automatically managed by Mongoose
   - `date` field in check-ins is the check-in date (can be different from `createdAt`)

4. **Data Integrity**:
   - Don't manually delete check-ins without updating the user's `garden.flowers` array
   - Don't modify `_id` fields
   - The app handles these relationships automatically

## 🐛 Troubleshooting

### Can't Connect to Local MongoDB

- **Check if MongoDB is running**:
  ```bash
  # Windows: Check Services panel
  # Or try: mongod --version
  ```

- **Check port**: Default is `27017`

- **Check connection string**: Should be `mongodb://localhost:27017`

### Database Not Found

- **Create it manually** in Compass:
  - Click "CREATE DATABASE"
  - Name: `anime-music-garden`
  - Collection: `users` (or `checkins`)

- **Or let the app create it**: Start the application, and it will create the database automatically

### No Data Appearing

- **Check if app is running** and connected to the same database
- **Verify `.env` file** has correct `MONGODB_URI`
- **Refresh** the collection view in Compass (F5)

### Can't See Relationships

- **Use Compass's Schema view** to see document structure
- **Check references**: Click on ObjectId fields to see if they reference valid documents
- **Use aggregation pipeline** to join collections if needed

## 📚 Additional Resources

- [MongoDB Compass Documentation](https://docs.mongodb.com/compass/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Query Operators](https://docs.mongodb.com/manual/reference/operator/query/)

## 🎯 Quick Test Checklist

- [ ] Connect to database successfully
- [ ] See `users` collection
- [ ] See `checkins` collection
- [ ] Register a user → verify in Compass
- [ ] Create a check-in → verify in Compass
- [ ] Update a check-in → verify changes in Compass
- [ ] Delete a check-in → verify removal in Compass
- [ ] Check user statistics update correctly
- [ ] Verify streak calculations
- [ ] Test queries and filters

---

**Happy Testing! 🌸**



