import React, { useRef } from "react";

const ChatMessage = ({ message, sender, audio }) => {
  const isUser = sender === "user";
  const audioRef = useRef(null);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  return (
    <div className={`chat-message ${isUser ? "user" : "assistant"}`}>
      <div className="bubble">
        <p>{message}</p>
        {audio && (
          <div onClick={handlePlay} style={{ cursor: "pointer" }}>
            <audio ref={audioRef} preload="auto">
              <source src={`data:audio/mp3;base64,${audio}`} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
            🔊 Click to play audio
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;