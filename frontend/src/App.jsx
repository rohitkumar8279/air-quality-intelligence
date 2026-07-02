import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import AirQuality from './pages/AirQuality';
import Weather from './pages/Weather';
import MapView from './pages/MapView';
import History from './pages/History';
import HealthAdvice from './pages/HealthAdvice';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import AIInsights from './pages/AIInsights';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <div className="page-content">
          <Routes>
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/ai-insights" element={<AIInsights />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/air-quality" element={<AirQuality />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/history" element={<History />} />
              <Route path="/health" element={<HealthAdvice />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
