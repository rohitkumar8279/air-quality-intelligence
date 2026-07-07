import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';
import ServerWakeupToast from './components/ServerWakeupToast';

// Lazy-load all pages — each is only downloaded when first visited
const Dashboard     = React.lazy(() => import('./pages/Dashboard'));
const Analytics     = React.lazy(() => import('./pages/Analytics'));
const AirQuality    = React.lazy(() => import('./pages/AirQuality'));
const Weather       = React.lazy(() => import('./pages/Weather'));
const MapView       = React.lazy(() => import('./pages/MapView'));
const History       = React.lazy(() => import('./pages/History'));
const HealthAdvice  = React.lazy(() => import('./pages/HealthAdvice'));
const Alerts        = React.lazy(() => import('./pages/Alerts'));
const Settings      = React.lazy(() => import('./pages/Settings'));
const AIInsights    = React.lazy(() => import('./pages/AIInsights'));
const ExplainableAI = React.lazy(() => import('./pages/ExplainableAI'));
const Login         = React.lazy(() => import('./pages/Login'));
const Register      = React.lazy(() => import('./pages/Register'));
const Profile       = React.lazy(() => import('./pages/Profile'));

// Reuses the existing spinner classes — no UI change
const PageLoader = () => (
  <div className="loader-container">
    <span className="loader"></span>
  </div>
);

function App() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Suspense>
    );
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40" 
          onClick={toggleSidebar}
        />
      )}
      <main className="main-content">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="page-content">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<PrivateRoute />}>
                <Route path="/"               element={<Dashboard />} />
                <Route path="/profile"        element={<Profile />} />
                <Route path="/ai-insights"    element={<AIInsights />} />
                <Route path="/explainable-ai" element={<ExplainableAI />} />
                <Route path="/analytics"      element={<Analytics />} />
                <Route path="/air-quality"    element={<AirQuality />} />
                <Route path="/weather"        element={<Weather />} />
                <Route path="/map"            element={<MapView />} />
                <Route path="/history"        element={<History />} />
                <Route path="/health"         element={<HealthAdvice />} />
                <Route path="/alerts"         element={<Alerts />} />
                <Route path="/settings"       element={<Settings />} />
              </Route>
            </Routes>
          </Suspense>
        </div>
      </main>
      <ServerWakeupToast />
    </div>
  );
}

export default App;
