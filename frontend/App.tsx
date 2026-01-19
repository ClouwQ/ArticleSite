import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ArticleView from './pages/ArticleView';
import { AdminLogin, AdminDashboard } from './pages/Admin';
import MusicPlayer from './components/MusicPlayer';
import { Playlist } from './types';

const App: React.FC = () => {
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <HashRouter>
      <div className="font-sans text-dark min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/article/:id" 
            element={<ArticleView onPlayMusic={setCurrentPlaylist} />} 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/login" 
            element={!isAuthenticated ? <AdminLogin onLogin={handleLogin} /> : <Navigate to="/admin" />} 
          />
          <Route 
            path="/admin" 
            element={isAuthenticated ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/admin/login" />} 
          />
        </Routes>

        {/* Global Persistent Player */}
        <MusicPlayer 
          currentPlaylist={currentPlaylist} 
          onClose={() => setCurrentPlaylist(null)} 
        />
      </div>
    </HashRouter>
  );
};

export default App;
