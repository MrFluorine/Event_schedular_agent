import React, { useEffect, useState, useRef } from "react"; // Import useRef
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
if (!BACKEND_URL) {
  console.error("❌ VITE_BACKEND_URL is undefined!");
}
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_OAUTH_REDIRECT_URI;
const SCOPE = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile";
console.log((`🔗 Using Redirect URI: ${REDIRECT_URI}`));
console.log((`🔗 Using Backend URL ${BACKEND_URL}`));
function Login() {
  const [loading, setLoading] = useState(false);
  const hasRun = useRef(false); // Initialize useRef

  const handleLogin = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(SCOPE)}` +
      `&access_type=offline` +
      `&prompt=consent` +
      `&include_granted_scopes=true`;

    window.location.href = authUrl;
  };

  useEffect(() => {
    // Prevent the effect from running multiple times
    if (hasRun.current) {
      return;
    }
    hasRun.current = true; // Set to true after the first run

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    const exchangeCodeForToken = async () => {
      try {
        setLoading(true);
        if (!code) {
          console.error('🚨 No code found in URL.');
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

        if (res.ok) {
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
  }, []); // Empty dependency array ensures this runs once on mount

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h2 className="text-xl font-semibold">Loading...</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">🧠 Smart Scheduler</h1>
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        Sign in with Google
      </button>
    </div>
  );
}

export default Login;