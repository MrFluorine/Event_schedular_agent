import React, { useRef, useEffect, useState } from "react";

const ChatMessage = ({ message, sender, audio, timestamp, isLatest }) => {
  const isUser = sender === "user";
  const audioRef = useRef(null);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play audio for latest assistant message
  useEffect(() => {
    if (audio && !isUser && isLatest && !hasAutoPlayed && audioRef.current) {
      const playAudio = async () => {
        try {
          console.log("Attempting auto-play for audio");
          setIsPlaying(true);
          // Ensure audio is loaded before playing
          if (audioRef.current.readyState >= 2) {
            await audioRef.current.play();
            console.log("Auto-play successful");
          } else {
            // Wait for audio to load
            audioRef.current.addEventListener('canplay', async () => {
              try {
                await audioRef.current.play();
                console.log("Auto-play successful after loading");
              } catch (err) {
                console.log("Auto-play failed after loading:", err);
                setIsPlaying(false);
              }
            }, { once: true });
          }
          setHasAutoPlayed(true);
        } catch (error) {
          console.log("Auto-play prevented by browser:", error);
          setHasAutoPlayed(true);
          setIsPlaying(false);
        }
      };
      
      // Small delay to ensure component is mounted
      const timer = setTimeout(playAudio, 300);
      return () => clearTimeout(timer);
    }
  }, [audio, isUser, isLatest, hasAutoPlayed]);

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  const handlePlay = async () => {
    if (audioRef.current && !isPlaying) {
      try {
        setIsPlaying(true);
        // Reset audio to beginning
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        console.log("Audio started playing");
      } catch (error) {
        console.error("Failed to play audio:", error);
        setIsPlaying(false);
        
        // Show user-friendly error
        alert("Unable to play audio. Please check your browser settings and try again.");
      }
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageWithLinks = (text) => {
    // URL regex pattern
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        // Check if it's a Google Calendar link
        if (part.includes('google.com/calendar')) {
          return (
            <div key={index} className="mt-2 mb-1">
              <a
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isUser 
                    ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30' 
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300'
                  }
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                📅 Open Calendar Event
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          );
        }
        
        // Generic link formatting
        const displayUrl = part.length > 50 ? part.substring(0, 47) + '...' : part;
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              underline hover:no-underline transition-all duration-200
              ${isUser ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:text-blue-800'}
            `}
          >
            {displayUrl}
          </a>
        );
      }
      
      return part;
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group message-animation`}>
      <div className={`max-w-xs lg:max-w-md ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        {!isUser && (
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
              <span className="text-white text-sm font-semibold">AI</span>
            </div>
            <span className="text-xs text-gray-500">Smart Assistant</span>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`
            relative px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md
            ${isUser 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md user-message' 
              : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md assistant-message'
            }
          `}
        >
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {formatMessageWithLinks(message)}
          </div>
          
          {/* Audio Player */}
          {audio && (
            <div className="mt-3 pt-3 border-t border-gray-200/30">
              <div 
                onClick={handlePlay}
                className={`
                  flex items-center space-x-2 cursor-pointer transition-all duration-200 p-2 rounded-lg
                  ${isUser 
                    ? 'hover:bg-white/10 bg-white/5' 
                    : 'hover:bg-gray-50 bg-gray-25'
                  }
                `}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
                  ${isPlaying 
                    ? (isUser ? 'bg-white/20' : 'bg-blue-100') 
                    : (isUser ? 'bg-white/10' : 'bg-blue-50')
                  }
                `}>
                  {isPlaying ? (
                    <div className="flex space-x-1">
                      <div className={`w-1 h-3 rounded-full animate-pulse ${isUser ? 'bg-white' : 'bg-blue-500'}`}></div>
                      <div className={`w-1 h-2 rounded-full animate-pulse ${isUser ? 'bg-white' : 'bg-blue-500'}`} style={{ animationDelay: '0.1s' }}></div>
                      <div className={`w-1 h-4 rounded-full animate-pulse ${isUser ? 'bg-white' : 'bg-blue-500'}`} style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  ) : (
                    <svg className={`w-4 h-4 ${isUser ? 'text-white' : 'text-blue-500'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 5v10l8-5-8-5z"/>
                    </svg>
                  )}
                </div>
                <span className={`text-xs ${isUser ? 'text-white/80' : 'text-gray-600'}`}>
                  {isPlaying ? 'Playing...' : 'Click to play audio'}
                </span>
              </div>
              
              <audio 
                ref={audioRef} 
                preload="auto"
                onEnded={handleAudioEnd}
                onError={(e) => {
                  console.error("Audio error:", e);
                  setIsPlaying(false);
                }}
                onLoadStart={() => console.log("Audio loading started")}
                onCanPlay={() => console.log("Audio can play")}
                onLoadedData={() => console.log("Audio loaded")}
                className="hidden"
              >
                <source src={`data:audio/mp3;base64,${audio}`} type="audio/mp3" />
                <source src={`data:audio/wav;base64,${audio}`} type="audio/wav" />
                <source src={`data:audio/ogg;base64,${audio}`} type="audio/ogg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className={`mt-1 text-xs text-gray-400 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;