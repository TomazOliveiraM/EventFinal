import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';  // Corrigido aqui

import Navbar from './components/layout/Navbar';
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import EventsPage from './pages/public/EventsPage';
import OrganizerDashboard from './pages/private/OrganizerDashboard';
import RegisterPage from './pages/public/RegisterPage';
import EventDetailPage from './pages/public/EventDetailPage';
import CreateEventPage from './pages/private/CreateEventPage';
import AdminDashboard from './pages/private/AdminDashboard';
import EditEventPage from './pages/private/EditEventPage';
import NotFoundPage from './pages/public/NotFoundPage';

import PrivateRoute from './components/common/PrivateRoute';
import RoleBasedRoute from './components/common/RoleBasedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />

          {/* Rotas Privadas */}
          <Route
            path="/organizer/dashboard"
            element={
              <PrivateRoute>
                <RoleBasedRoute allowedRoles={['organizador']}>
                  <OrganizerDashboard />
                </RoleBasedRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/events/create"
            element={
              <PrivateRoute>
                <RoleBasedRoute allowedRoles={['organizador']}>
                  <CreateEventPage />
                </RoleBasedRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/events/:id/edit"
            element={
              <PrivateRoute>
                <RoleBasedRoute allowedRoles={['organizador', 'admin']}>
                  <EditEventPage />
                </RoleBasedRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <RoleBasedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleBasedRoute>
              </PrivateRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
