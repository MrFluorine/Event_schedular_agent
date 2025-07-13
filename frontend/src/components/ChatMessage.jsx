import React from "react";

const ChatMessage = ({ message, sender, audio }) => {
  const isUser = sender === "user";

  return (
    <div className={`chat-message ${isUser ? "user" : "assistant"}`}>
      <div className="bubble">
        <p>{message}</p>
        {audio && (
          <audio autoPlay preload="auto">
            <source src={`data:audio/mp3;base64,${audio}`} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;