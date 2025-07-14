import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Header from "./components/Header";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log("✅ User loaded from localStorage:", parsed);
        setUser(parsed);
      } catch (e) {
        console.error("❌ Failed to parse user data from localStorage");
      }
    } else if (localStorage.getItem("loggedIn")) {
      console.log("⚠️ No user, but loggedIn flag found");
      setUser({});
    } else {
      console.log("🔒 No login state found");
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <Router>
      <Header user={user} />
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route
          path="/"
          element={
            user ? <Home user={user} /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="*"
          element={<Navigate to={user ? "/" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
