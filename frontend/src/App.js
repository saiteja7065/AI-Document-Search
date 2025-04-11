import React, { createContext, useState, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import DocumentViewer from './pages/DocumentViewer';
import Upload from './pages/Upload';
import AdminDashboard from './pages/AdminDashboard';
import Tags from './pages/Tags';
import Login from './pages/Login';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Authentication context
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check for stored auth data on component mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
      }
    }
    
    setLoading(false);
  }, []);
  
  const signIn = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };
  
  const signOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
  };
  
  const isAdmin = currentUser?.isAdmin || false;
  const isSignedIn = !!currentUser;
  
  return (
    <AuthContext.Provider value={{ currentUser, isSignedIn, isAdmin, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom user button component
export const UserButton = () => {
  const { isSignedIn, currentUser, signOut } = useAuth();
  
  if (!isSignedIn) {
    return null;
  }
  
  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      signOut();
    }
  };
  
  const initials = currentUser?.username?.substring(0, 1).toUpperCase() || 'U';
  
  return (
    <button 
      onClick={handleSignOut}
      title="Click to sign out"
      style={{
        background: currentUser?.isAdmin ? '#dc004e' : '#1976d2',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        color: 'white'
      }}
    >
      {initials}
    </button>
  );
};

// Route guard for protected routes
function ProtectedRoute({ children, requireAdmin }) {
  const { isSignedIn, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Navbar />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <Search />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/document/:id"
              element={
                <ProtectedRoute>
                  <DocumentViewer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tags"
              element={
                <ProtectedRoute>
                  <Tags />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App; 