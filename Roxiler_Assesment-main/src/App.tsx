import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './contexts/AuthContext';

// Public pages
import Login from './pages/Login';
import Register from './pages/Register';

// Protected pages
import Settings from './pages/Settings';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import UserList from './pages/admin/UserList';
import StoreList from './pages/admin/StoreList';

// Normal user pages
import UserStoreList from './pages/user/StoreList';

// Store owner pages
import StoreDashboard from './pages/store/Dashboard';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    } else if (user.role === 'store_owner') {
      return <Navigate to="/owner/dashboard" />;
    } else {
      return <Navigate to="/stores" />;
    }
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/stores" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <StoreList />
              </ProtectedRoute>
            } 
          />

          {/* Normal user routes */}
          <Route 
            path="/stores" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserStoreList />
              </ProtectedRoute>
            } 
          />

          {/* Store owner routes */}
          <Route 
            path="/owner/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['store_owner']}>
                <StoreDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Shared routes */}
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;