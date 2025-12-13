import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import DecorativeFigures from './components/DecorativeFigures';
import AnimeBackground from './components/AnimeBackground';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Garden from './pages/Garden';
import CheckInForm from './pages/CheckInForm';
import Profile from './pages/Profile';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <AnimeBackground />
        <DecorativeFigures />
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/garden"
              element={
                <ProtectedRoute>
                  <Garden />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkin"
              element={
                <ProtectedRoute>
                  <CheckInForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkin/edit/:id"
              element={
                <ProtectedRoute>
                  <CheckInForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/garden" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;

