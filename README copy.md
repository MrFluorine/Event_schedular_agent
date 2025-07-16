# 🧠 Smart Scheduler AI Agent

An AI-powered personal assistant that helps you schedule meetings via voice or text. Seamlessly integrates with Google Calendar, Gemini Pro, and OpenAI's Whisper & TTS.

---

## 🔧 Features

- 🎤 Voice or 📝 Text input
- 📅 Google Calendar integration (create events via chat)
- 🤖 Gemini Pro for intelligent responses
- 🗣️ OpenAI Whisper for voice-to-text transcription
- 🔊 TTS responses using OpenAI’s TTS
- 🔐 Google OAuth Login
- 💬 Chat-like UI with audio playback

---

## 🏗️ Project Structure

### Backend (FastAPI)

```
/backend
│
├── main.py                # FastAPI entry point
├── auth/
│   └── google_oauth.py    # Token exchange logic
├── routes/
│   ├── auth.py            # /api/exchange-code
│   ├── calendar.py        # Scheduling logic
│   ├── chat.py            # Gemini conversation route
│   └── transcribe.py      # Audio transcription
└── services/
    ├── calendar_utils.py  # Create + find free slots
    └── llm_agent.py       # Gemini + TTS logic
```

### Frontend (React + Vite + Tailwind)

```
/frontend
│
├── public/
│   └── default-avatar.png
├── src/
│   ├── components/
│   │   ├── ChatBar.jsx
│   │   ├── ChatMessage.jsx
│   │   ├── Header.jsx
│   │   └── Recorder.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   └── Login.jsx
│   ├── api.js
│   ├── App.jsx
│   └── index.jsx
└── .env
```

---

## 🚀 Getting Started

### Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

uvicorn main:app --reload --port 8000
```

Ensure you have the following in `.env`:
```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
OAUTH_REDIRECT_URI=http://localhost:5173/login
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend `.env`:
```env
VITE_GOOGLE_CLIENT_ID=...
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/login
VITE_BACKEND_URL=http://localhost:8000
```

---

## 🔒 OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 Client ID
3. Set redirect URI to `http://localhost:5173/login`
4. Enable APIs:
   - Google Calendar API
   - Google People API

---

## 📸 UI Preview

```
📥 Login → 💬 Chat UI → 🔊 Voice interaction → 📅 Calendar scheduling
```

---

## 🧑‍💻 Built With

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Gemini Pro](https://ai.google.dev/)
- [OpenAI Whisper & TTS](https://platform.openai.com/)

---

## 📜 License

MIT License. Use it freely, contribute responsibly ✨
