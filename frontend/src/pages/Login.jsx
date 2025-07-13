

import React, { useEffect } from "react";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_OAUTH_REDIRECT_URI;
const SCOPE = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile";

function Login() {
  const handleLogin = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${encodeURIComponent(
      SCOPE
    )}&access_type=offline&prompt=consent`;
    window.location.href = authUrl;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      // Placeholder: You can trigger backend call to exchange code
      console.log("OAuth code received:", code);
    }
  }, []);

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