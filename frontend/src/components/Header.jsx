

import React from "react";

function Header({ user }) {
  return (
    <div className="flex justify-between items-center p-4 bg-white shadow-md">
      <h1 className="text-xl font-bold">🧠 Smart Scheduler</h1>
      {user && (
        <div className="flex items-center gap-2">
          <img
            src={user.picture}
            alt="User"
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-medium">{user.name}</span>
        </div>
      )}
    </div>
  );
}

export default Header;