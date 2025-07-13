import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Header from "./components/Header";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
  }, []);

  return (
    <Router>
      <Header user={user} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            user ? <Home user={user} /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
