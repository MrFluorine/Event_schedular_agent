import React, { useState, useEffect, useRef } from "react";
import ChatMessage from "../components/ChatMessage";
import ChatBar from "../components/ChatBar";
import { sendMessage, transcribeAudio } from "../api";

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendText = async (text) => {
    const userMsg = { sender: "user", message: text, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const token = localStorage.getItem("access_token");
      const res = await sendMessage(text, history, true, token);
      
      setTimeout(() => {
        const botMsg = {
          sender: "assistant",
          message: res.reply,
          audio: res.audio || null,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setHistory(res.history);
        setIsTyping(false);
      }, 800); // Simulate realistic response time
    } catch (err) {
      console.error(err);
      setIsTyping(false);
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
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Chat Header */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            AI Assistant
          </h2>
          <p className="text-sm text-gray-500">Ask me anything about your schedule</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Smart Scheduler!</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  I'm here to help you manage your schedule. You can type or use voice commands to get started.
                </p>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <ChatMessage 
                key={i} 
                sender={msg.sender} 
                message={msg.message} 
                audio={msg.audio}
                timestamp={msg.timestamp}
                isLatest={i === messages.length - 1}
              />
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md">
                  <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-gray-500">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <ChatBar onSendText={handleSendText} onSendAudio={handleSendAudio} />
        </div>
      </div>
    </div>
  );
};

export default Home;