import React, { useEffect, useState, useMemo } from "react";

function Header({ user: propUser }) {
  const [user, setUser] = useState(propUser);

  useEffect(() => {
    if (!propUser) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse user from localStorage");
        }
      }
    }
  }, [propUser]);

  const memoizedPicture = useMemo(() => user?.picture, [user?.picture]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="flex justify-between items-center p-4 bg-white shadow-md">
      <h1 className="text-xl font-bold">🧠 Smart Scheduler</h1>
      {user && (
        <div className="flex items-center gap-3">
          <img
            src={memoizedPicture}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/default-avatar.png";
            }}
            alt="User"
            loading="lazy"
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-medium">{user.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default Header;
