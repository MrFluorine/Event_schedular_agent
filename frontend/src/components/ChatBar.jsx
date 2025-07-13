

import React, { useState } from "react";
import Recorder from "./Recorder";

const ChatBar = ({ onSendText, onSendAudio }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim()) {
      onSendText(text.trim());
      setText("");
    }
  };

  return (
    <div className="flex items-center gap-2 p-4 bg-white border-t shadow-md">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Type a message..."
        className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none"
      />
      <Recorder onRecordingComplete={onSendAudio} />
      <button
        onClick={handleSend}
        className="bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600"
      >
        ⏎
      </button>
    </div>
  );
};

export default ChatBar;