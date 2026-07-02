import React from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';

/**
 * App Component
 * Main entry point of the application, wraps the layout.
 */
function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <div className="page-content">
          <Dashboard />
        </div>
      </main>
    </div>
  );
}

export default App;
