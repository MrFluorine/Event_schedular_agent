import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Header from "./components/Header";

// Modern loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-4">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-500 rounded-full animate-spin animate-reverse" style={{ animationDelay: '-0.5s' }}></div>
      </div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Loading Smart Scheduler</h2>
      <p className="text-sm text-gray-500">Preparing your AI assistant...</p>
    </div>
  </div>
);

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-4">We're having trouble loading the application. Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Debug user state changes
  useEffect(() => {
    console.log("🔍 App user state changed:", {
      user: user ? 'SET' : 'NULL',
      userDetails: user,
      localStorage: {
        user: localStorage.getItem('user') ? 'SET' : 'NULL',
        loggedIn: localStorage.getItem('loggedIn'),
        accessToken: localStorage.getItem('access_token') ? 'SET' : 'NULL'
      }
    });
  }, [user]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("🚀 Initializing app...");
        
        // Simulate a brief loading time for smooth UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const storedUser = localStorage.getItem("user");
        const isLoggedIn = localStorage.getItem("loggedIn");
        const accessToken = localStorage.getItem("access_token");
        
        console.log("💾 Checking stored data:", {
          storedUser: storedUser ? 'Found' : 'Not found',
          isLoggedIn,
          accessToken: accessToken ? 'Found' : 'Not found'
        });
        
        if (storedUser && isLoggedIn === 'true') {
          try {
            const parsed = JSON.parse(storedUser);
            console.log("✅ User loaded from localStorage:", parsed);
            setUser(parsed);
          } catch (e) {
            console.error("❌ Failed to parse user data from localStorage:", e);
            localStorage.removeItem("user");
            localStorage.removeItem("loggedIn");
            localStorage.removeItem("access_token");
          }
        } else {
          console.log("🔒 No valid login state found");
        }
      } catch (error) {
        console.error("❌ Failed to initialize app:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Function to update user state (called from Login component)
  const updateUser = (userData) => {
    console.log("🔄 Updating user state with:", userData);
    setUser(userData);
  };

  // Function to clear user state (for logout)
  const clearUser = () => {
    console.log("🚪 Clearing user state");
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("access_token");
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          {/* Always show Header, pass user data */}
          <Header user={user} onLogout={clearUser} />
          
          <main className="relative">
            <Routes>
              <Route 
                path="/login" 
                element={
                  user ? (
                    <Navigate to="/" replace />
                  ) : (
                    <Login setUser={updateUser} />
                  )
                } 
              />
              <Route
                path="/"
                element={
                  user ? (
                    <Home user={user} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="*"
                element={<Navigate to={user ? "/" : "/login"} replace />}
              />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;