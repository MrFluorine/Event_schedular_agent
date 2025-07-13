import React, { useState, useEffect, useRef } from "react";

const Recorder = ({ onRecordingComplete }) => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const chunksRef = useRef([]);

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

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    setMediaRecorder(recorder);
    chunksRef.current = [];
    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <button onClick={isRecording ? stopRecording : startRecording}>
      {isRecording ? "⏹️ Stop" : "🎤 Record"}
    </button>
  );
};

export default Recorder;