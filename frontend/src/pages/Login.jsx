import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_OAUTH_REDIRECT_URI;
const SCOPE = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile";

function Login({ setUser }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasRun = useRef(false);
  const navigate = useNavigate();

  // Debug environment variables
  useEffect(() => {
    console.log("🔍 Login Component Environment Check:", {
      BACKEND_URL: BACKEND_URL || 'MISSING',
      CLIENT_ID: CLIENT_ID ? 'SET' : 'MISSING',
      REDIRECT_URI: REDIRECT_URI || 'MISSING',
      currentURL: window.location.href
    });
  }, []);

  const handleLogin = () => {
    if (!CLIENT_ID || !REDIRECT_URI) {
      setError("OAuth configuration missing. Check environment variables.");
      return;
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(SCOPE)}` +
      `&access_type=offline` +
      `&prompt=consent`;

    console.log("🚀 Redirecting to OAuth:", authUrl);
    window.location.href = authUrl;
  };

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    console.log("📍 Login page loaded with params:", { 
      code: code ? `${code.substring(0, 10)}...` : null, 
      error,
      fullURL: window.location.href 
    });

    if (error) {
      console.error("❌ OAuth error:", error);
      setError(`OAuth error: ${error}`);
      return;
    }

    if (!code) {
      console.log("ℹ️ No authorization code found. Showing login form.");
      return;
    }

    // We have a code, attempt token exchange
    const exchangeCodeForToken = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🔄 Starting token exchange...");

        if (!BACKEND_URL) {
          throw new Error("Backend URL not configured");
        }

        console.log("📡 Making request to:", `${BACKEND_URL}/api/exchange-code`);
        
        const response = await fetch(`${BACKEND_URL}/api/exchange-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        console.log("📊 Response status:", response.status, response.ok);
        
        const data = await response.json();
        console.log("📦 Response data:", data);

        if (!response.ok) {
          throw new Error(data.message || `HTTP ${response.status}`);
        }

        console.log("✅ Token exchange successful!");
        
        // Store authentication data
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('loggedIn', 'true');
        
        console.log("💾 Data stored in localStorage");
        
        // Update app state
        console.log("🔄 Updating app state with user:", data.user);
        setUser(data.user);
        
        // Clean URL and navigate
        console.log("🧭 Navigating to home page...");
        navigate('/', { replace: true });
        
      } catch (err) {
        console.error('🚨 Token exchange failed:', err);
        setError(`Login failed: ${err.message}`);
        setLoading(false);
        
        // Clear URL params on error
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    exchangeCodeForToken();
  }, [setUser, navigate]);

  const isConfigured = BACKEND_URL && CLIENT_ID && REDIRECT_URI;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Processing Login...</h2>
          <p className="text-sm text-gray-600 mt-2">Exchanging authorization code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">🧠 Smart Scheduler</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md">
          <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      {!isConfigured && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md">
          <h3 className="font-semibold text-yellow-800 mb-2">Configuration Status:</h3>
          <div className="text-xs text-yellow-700 space-y-1">
            <div>Backend: {BACKEND_URL ? '✓ Set' : '❌ Missing'}</div>
            <div>Client ID: {CLIENT_ID ? '✓ Set' : '❌ Missing'}</div>
            <div>Redirect URI: {REDIRECT_URI ? '✓ Set' : '❌ Missing'}</div>
          </div>
        </div>
      )}
      
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={!isConfigured}
      >
        Sign in with Google
      </button>
    </div>
  );
}

export default Login;