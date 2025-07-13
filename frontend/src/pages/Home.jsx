import React, { useState, useEffect, useRef } from "react";
import ChatMessage from "../components/ChatMessage";
import ChatBar from "../components/ChatBar";
import { sendMessage, transcribeAudio } from "../api";

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendText = async (text) => {
    const userMsg = { sender: "user", message: text };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await sendMessage(text, history, true);
      const botMsg = {
        sender: "assistant",
        message: res.reply,
        audio: res.audio || null,
      };
      setMessages((prev) => [...prev, botMsg]);
      setHistory(res.history);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendAudio = async (blob) => {
    const file = new File([blob], "voice.webm", { type: "audio/webm" });
    try {
      const { transcript } = await transcribeAudio(file);
      handleSendText(transcript);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="home-page">
      <div className="chat-window overflow-y-auto" style={{ height: "400px" }}>
        {messages.map((msg, i) => (
          <ChatMessage key={i} sender={msg.sender} message={msg.message} audio={msg.audio} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatBar onSendText={handleSendText} onSendAudio={handleSendAudio} />
    </div>
  );
};

export default Home;