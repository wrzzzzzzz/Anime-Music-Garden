# 🌸 Anime Music Garden

A beautiful full-stack web application where users can log their daily interactions with anime and its music, visualizing their journey as a growing digital garden. Each check-in (anime episode, opening/ending theme, or insert song) appears as a flower in the user's personal garden, with colors and sizes reflecting ratings and emotional responses.

## 🎯 Features

- **User Authentication**: Secure JWT-based authentication system
- **Digital Garden Visualization**: Interactive garden where each check-in blooms as a unique flower
- **Check-in Management**: Log anime episodes, opening/ending themes, and insert songs
- **Real-time Updates**: Socket.io integration for live garden updates
- **Statistics Dashboard**: Track streaks, ratings, and check-in history
- **Beautiful UI**: Modern, responsive design with smooth animations

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Socket.io** for real-time updates
- **Jest** for testing

### Frontend
- **React** with Vite
- **React Router** for navigation
- **Axios** for API calls
- **Socket.io Client** for real-time features
- **CSS3** with custom properties

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Anime-Music-Garden
```

### 2. Install Dependencies

**Backend (root directory):**
```bash
npm install
```

**Frontend (client directory):**
```bash
cd client
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
# For local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/anime-music-garden
# For MongoDB Atlas (Cloud - Recommended):
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/anime-music-garden
# Note: Replace username, password, and cluster0.mongodb.net with your Atlas credentials

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client URL (for CORS and Socket.io)
CLIENT_URL=http://localhost:3000
```

**Important**: 
- Change `JWT_SECRET` to a secure random string in production!
- For production, create a `.env` file in the `client` directory with `VITE_SOCKET_URL=your-backend-url` for Socket.io connection

### 4. Start MongoDB

If using local MongoDB:
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# On Windows
# Start MongoDB service from Services panel
```

Or use **MongoDB Atlas (cloud)** - no local installation needed:
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Create a database user (username and password)
4. Add your IP address to the whitelist (or use 0.0.0.0/0 for development)
5. Get your connection string from "Connect" → "Connect your application"
6. Update `MONGODB_URI` in `.env` with your connection string
7. Make sure to add the database name at the end: `/anime-music-garden`

See `MONGODB_ATLAS_SETUP.md` for detailed step-by-step instructions.

### 5. Run the Application

**Development Mode:**

You can run backend and frontend independently in separate terminals:

**Terminal 1 - Backend (root directory):**
```bash
npm start
# or for development with auto-reload:
npm run dev
```

**Terminal 2 - Frontend (client directory):**
```bash
cd client
npm start
# or for development:
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

**Production Mode:**

Build the frontend:
```bash
cd client
npm run build
```

Start the production server (root directory):
```bash
npm start
```

For frontend production preview:
```bash
cd client
npm run preview
```

## 📁 Project Structure

```
Anime-Music-Garden/
├── server/                    # Backend (Express + MongoDB)
│   ├── server.js              # Main server file
│   ├── controllers/           # Request handlers
│   │   ├── authControllers.js
│   │   ├── checkInControllers.js
│   │   ├── userControllers.js
│   │   └── _tests_/           # Controller tests
│   ├── services/              # Business logic
│   │   ├── authService.js
│   │   ├── checkInService.js
│   │   └── userService.js
│   ├── routes/                # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── checkins.js
│   │   └── anime.js
│   ├── models/                # MongoDB models
│   │   ├── User.js
│   │   └── CheckIn.js
│   ├── middleware/            # Express middleware
│   │   └── auth.js
│   ├── db/                    # Database connection
│   │   └── db.js
│   └── test-resources/        # Test files
│       └── AnimeMusicGarden.pm_collection.json
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React contexts
│   │   ├── services/          # API services
│   │   └── App.jsx            # Main app component
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── jest.config.js             # Jest configuration
├── package.json               # Backend dependencies
└── README.md
```

## 🧪 Testing

### Run Backend Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

### Postman Collection

Import `server/test-resources/AnimeMusicGarden.pm_collection.json` into Postman to test the API endpoints. The collection includes:
- Authentication endpoints (register)
- User profile endpoints
- Check-in CRUD operations
- Health check endpoint

**Note**: After registering, the collection automatically saves the auth token for subsequent requests.

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user (returns access + refresh tokens)
- `POST /api/auth/login` - Login user (returns access + refresh tokens)
- `POST /api/auth/refresh` - Refresh access token using refresh token
- `POST /api/auth/logout` - Logout and invalidate refresh token (protected)
- `GET /api/auth/me` - Get current user (protected)

### Users
- `GET /api/users/profile` - Get user profile with stats (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `GET /api/users/admin/stats` - Get admin statistics (admin only)
- `GET /api/users/admin/users` - Get all users (admin only)

### Check-ins
- `POST /api/checkins` - Create a new check-in (protected)
- `GET /api/checkins` - Get all check-ins for user (protected)
- `GET /api/checkins/:id` - Get specific check-in (protected)
- `PUT /api/checkins/:id` - Update check-in (protected)
- `DELETE /api/checkins/:id` - Delete check-in (protected)

### Health
- `GET /api/health` - Health check endpoint

## 🚢 Deployment

### Deploying to Google Cloud Platform (GCP)

#### Prerequisites
1. Google Cloud account
2. GCP project created
3. MongoDB Atlas account (recommended) or MongoDB on GCP

#### Steps

1. **Set up MongoDB Atlas** (recommended):
   - Create account at https://www.mongodb.com/cloud/atlas
   - Create a cluster
   - Get connection string
   - Update `MONGODB_URI` in `.env`

2. **Deploy Backend to Cloud Run**:
   ```bash
   # Install Google Cloud SDK
   # Build and deploy
   gcloud builds submit --tag gcr.io/PROJECT-ID/anime-music-garden
   gcloud run deploy anime-music-garden \
     --image gcr.io/PROJECT-ID/anime-music-garden \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

3. **Deploy Frontend to Firebase Hosting**:
   ```bash
   cd client
   npm run build
   firebase init hosting
   firebase deploy
   ```

4. **Environment Variables**:
   Set environment variables in Cloud Run:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLIENT_URL` (your frontend URL)
   - `NODE_ENV=production`

5. **HTTPS**: 
   - Firebase Hosting provides HTTPS automatically
   - Cloud Run provides HTTPS automatically
   - No additional configuration needed

### Alternative: Deploy to Heroku

1. Create `Procfile`:
   ```
   web: node server/index.js
   ```

2. Deploy:
   ```bash
   heroku create anime-music-garden
   heroku addons:create mongolab
   heroku config:set JWT_SECRET=your-secret
   git push heroku main
   ```

## 🔐 Security Notes

- **JWT Secret**: Always use a strong, random secret in production
- **JWT Refresh Tokens**: Access tokens expire in 15 minutes, refresh tokens in 30 days
- **Auto-login**: Refresh tokens enable automatic re-authentication on page reload
- **Role-based Access**: Admin routes are protected with role-based authorization
- **CORS**: Configure CORS to only allow your frontend domain
- **Password Hashing**: Passwords are hashed using bcrypt
- **Input Validation**: All inputs are validated using express-validator
- **MongoDB Change Streams**: Real-time updates via database change listeners

## 📝 Usage Instructions

### For Graders

1. **Access the Application**:
   - Visit the deployment URL provided
   - Or run locally following the "Getting Started" section

2. **Create Your Own Account**:
   - Click "Register"
   - Fill in username and password
   - You'll be automatically logged in after registration

4. **Features to Test**:
   - **Dashboard**: View statistics and recent check-ins
   - **Garden**: Visualize your check-ins as flowers (click flowers for details)
   - **New Check-in**: Add anime episodes or music
   - **Profile**: View detailed statistics
   - **Real-time Updates**: Open garden in two tabs, add a check-in in one, see it appear in the other

5. **API Testing**:
   - Import `server/test-resources/AnimeMusicGarden.pm_collection.json` into Postman
   - Run the "Register" request first to get auth token
   - Test other endpoints

## 🎨 Features Implemented

### Basic Criteria ✅
- ✅ Authentication (JWT-based)
- ✅ User-specific CRUD functionality
- ✅ Protected routes using JWTs
- ✅ Error handling with fall-through handlers
- ✅ Test coverage (Jest + Postman collection)
- ✅ REST architecture
- ✅ Clean, componentized API access on client

### Challenge Criteria (Medium) ✅
- ✅ **Sockets**: Real-time garden updates using Socket.io
- ✅ **MongoDB Change Listeners**: Change streams for automatic real-time updates
- ✅ **HTTPS**: Available through deployment platforms (GCP/Firebase)
- ✅ **Server-side 3rd Party API**: AniList API integration for anime search and details

### Challenge Criteria (High) ✅
- ✅ **JWT Refresh Tokens**: Access and refresh token system with auto-login
- ✅ **Role-based Authorization**: Admin and user roles with protected admin routes

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running (if local)
- Check `MONGODB_URI` in `.env`
- Verify network access for MongoDB Atlas

### Port Already in Use
- Change `PORT` in `.env`
- Or kill the process using the port

### CORS Errors
- Ensure `CLIENT_URL` in `.env` matches your frontend URL
- Check that backend CORS configuration is correct

### Socket.io Connection Issues
- Ensure backend is running
- Check that Socket.io server URL matches backend URL
- Verify CORS settings for Socket.io

## 📄 License

MIT License - see LICENSE file for details

## 👤 Author

Created for SI679 Final Project - Fall 2025

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js for the robust backend framework
- MongoDB for the flexible database
- Socket.io for real-time capabilities
- Cursor AI for providing inspirations and help during debug
