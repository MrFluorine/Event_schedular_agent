import React, { useState, useRef, useEffect } from "react";
import Recorder from "./Recorder";

const ChatBar = ({ onSendText, onSendAudio }) => {
  const [text, setText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleSend = () => {
    if (text.trim()) {
      onSendText(text.trim());
      setText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="p-4">
      <div className={`
        flex items-end gap-3 p-3 bg-white rounded-2xl shadow-sm border transition-all duration-200
        ${isFocused ? 'border-blue-300 shadow-md' : 'border-gray-200'}
      `}>
        {/* Text Input */}
        <div className="flex-1">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type your message or ask about your schedule..."
            className="w-full resize-none border-none outline-none text-sm leading-relaxed placeholder-gray-400 max-h-32 min-h-[20px]"
            rows="1"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#e5e7eb transparent'
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Voice Recorder */}
          <Recorder onRecordingComplete={onSendAudio} />
          
          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
              ${text.trim()
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm hover:shadow-md transform hover:scale-105'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Helper Text */}
      <div className="mt-2 px-3">
        <p className="text-xs text-gray-500 flex items-center gap-2">
          <span>💡</span>
          <span>Press Enter to send, Shift + Enter for new line</span>
        </p>
      </div>
    </div>
  );
};

export default ChatBar;