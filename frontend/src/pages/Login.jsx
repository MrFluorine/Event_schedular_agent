import React, { useEffect, useState, useRef } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_OAUTH_REDIRECT_URI;
const SCOPE = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile";

function Login() {
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const hasRun = useRef(false);

  // Debug environment variables on component mount
  useEffect(() => {
    const debug = {
      backendUrl: BACKEND_URL,
      clientId: CLIENT_ID,
      redirectUri: REDIRECT_URI,
      currentUrl: window.location.href,
      origin: window.location.origin,
      hostname: window.location.hostname
    };
    
    setDebugInfo(debug);
    console.log("🔍 Debug Info:", debug);
    
    // Check for missing environment variables
    if (!BACKEND_URL) {
      console.error("❌ VITE_BACKEND_URL is undefined!");
    }
    if (!CLIENT_ID) {
      console.error("❌ VITE_GOOGLE_CLIENT_ID is undefined!");
    }
    if (!REDIRECT_URI) {
      console.error("❌ VITE_OAUTH_REDIRECT_URI is undefined!");
    }
  }, []);

  const handleLogin = () => {
    console.log("🚀 Starting OAuth flow...");
    
    // Validate environment variables before proceeding
    if (!CLIENT_ID || !REDIRECT_URI) {
      console.error("❌ Missing required environment variables for OAuth");
      alert("OAuth configuration error. Please check environment variables.");
      return;
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(SCOPE)}` +
      `&access_type=offline` +
      `&prompt=consent` +
      `&include_granted_scopes=true`;

    console.log("🔗 OAuth URL:", authUrl);
    console.log("🔗 Redirect URI being used:", REDIRECT_URI);
    
    window.location.href = authUrl;
  };

  useEffect(() => {
    if (hasRun.current) {
      return;
    }
    hasRun.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    console.log("📍 URL params:", { code, error });

    if (error) {
      console.error("❌ OAuth error:", error);
      setLoading(false);
      return;
    }

    const exchangeCodeForToken = async () => {
      try {
        setLoading(true);
        console.log("🔄 Exchanging code for token...");
        
        if (!code) {
          console.log('ℹ️ No code found in URL.');
          setLoading(false);
          return;
        }

        if (!BACKEND_URL) {
          console.error("❌ Backend URL not configured");
          setLoading(false);
          return;
        }

        const res = await fetch(`${BACKEND_URL}/api/exchange-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const data = await res.json();
        console.log("📊 Token exchange response:", { status: res.status, ok: res.ok });

        if (res.ok) {
          console.log("✅ Token exchange successful");
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('loggedIn', 'true');
          window.location.href = '/';
        } else {
          console.error('❌ Failed to exchange code:', data);
          setLoading(false);
        }
      } catch (error) {
        console.error('🚨 Error exchanging code:', error);
        setLoading(false);
      }
    };

    if (code && !localStorage.getItem('loggedIn')) {
      exchangeCodeForToken();
    } else {
      console.log("🧭 No code in URL or already logged in.");
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h2 className="text-xl font-semibold">Loading...</h2>
        <p className="text-sm text-gray-600 mt-2">Exchanging authorization code...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">🧠 Smart Scheduler</h1>
      
      {/* Debug information - you can remove this after confirming it works */}
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md">
        <h3 className="font-semibold text-yellow-800 mb-2">Debug Info:</h3>
        <div className="text-xs text-yellow-700 space-y-1">
          <div>Backend: {debugInfo.backendUrl || 'NOT SET'}</div>
          <div>Client ID: {debugInfo.clientId ? '✓ SET' : '❌ NOT SET'}</div>
          <div>Redirect URI: {debugInfo.redirectUri || 'NOT SET'}</div>
          <div>Current URL: {debugInfo.currentUrl}</div>
        </div>
      </div>
      
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        disabled={!CLIENT_ID || !REDIRECT_URI}
      >
        Sign in with Google
      </button>
      
      {(!CLIENT_ID || !REDIRECT_URI) && (
        <p className="text-red-500 text-sm mt-2">
          OAuth configuration incomplete. Check environment variables.
        </p>
      )}
    </div>
  );
}

export default Login;