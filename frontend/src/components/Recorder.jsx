import React, { useState, useEffect, useRef } from "react";

const Recorder = ({ onRecordingComplete }) => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permission, setPermission] = useState('prompt');
  const chunksRef = useRef([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (mediaRecorder) {
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecordingComplete(blob);
        chunksRef.current = [];
        // Stop the mic stream
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      };
    }
  }, [mediaRecorder, onRecordingComplete]);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermission('granted');
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      setMediaRecorder(recorder);
      chunksRef.current = [];
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setPermission('denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (permission === 'denied') {
    return (
      <div className="relative group">
        <button 
          className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors duration-200"
          disabled
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </button>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-red-500 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Microphone access denied
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isRecording && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-full text-xs whitespace-nowrap">
          Recording: {formatTime(recordingTime)}
        </div>
      )}
      
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`
          relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 group
          ${isRecording
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg animate-pulse'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-700'
          }
        `}
      >
        {isRecording ? (
          <>
            {/* Stop Icon */}
            <div className="w-3 h-3 bg-white rounded-sm"></div>
            
            {/* Recording Animation */}
            <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping"></div>
          </>
        ) : (
          <>
            {/* Microphone Icon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            
            {/* Hover Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Hold to record
            </div>
          </>
        )}
      </button>
    </div>
  );
};

export default Recorder;