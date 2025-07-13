


# 🧠 Smart Scheduler AI Agent

The Smart Scheduler AI Agent is a voice-enabled conversational assistant that helps users schedule meetings by understanding natural language requests. It integrates with Google Calendar, uses Gemini for intent extraction and tool-calling, and provides voice-based interaction using Whisper and ElevenLabs.

---

## ✨ Features

- 🔐 Google OAuth2 login (per-user calendar access)
- 🎙️ Voice input using OpenAI Whisper
- 🧠 Gemini-powered LLM with tool-calling for calendar functions
- 🗓️ Real-time integration with Google Calendar
- 🔊 Voice responses via ElevenLabs
- ⚙️ Built with Streamlit, deployable on Vercel or GCP

---

## 📦 Stack

- **LLM**: Google Gemini (via `google-generativeai`)
- **STT**: OpenAI Whisper
- **TTS**: ElevenLabs
- **Calendar API**: Google Calendar v3
- **UI**: Streamlit

---

## 🛠️ Setup

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/smart-scheduler.git
cd smart-scheduler
```

### 2. Create a `.env` file

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
OAUTH_REDIRECT_URI=http://localhost:8501
SCOPES=https://www.googleapis.com/auth/calendar
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### 3. Install Dependencies

```bash
uv venv .venv
source .venv/bin/activate
uv pip install -r requirements.txt
```

### 4. Run Locally

```bash
streamlit run app.py
```

---

## 🔑 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable **Google Calendar API**
3. Set up OAuth 2.0 credentials (Desktop app)
4. Add `http://localhost:8501` to authorized redirect URIs
5. Copy `client_id` and `client_secret` to your `.env`

---

## 🧪 Demo Flow

1. Open the app in browser
2. Click **Login with Google**
3. Speak your request (e.g. “Schedule a meeting Tuesday at 4 PM for 1 hour”)
4. The agent will:
   - Transcribe your voice 📝
   - Extract intent via Gemini 🤖
   - Query your calendar 🗓️
   - Propose or book the meeting 💬
   - Speak the response 🔊

---

## 📦 Deployment

- Recommended platforms: Vercel, GCP App Engine, or Streamlit Cloud
- For public deployment, you must submit your OAuth app for verification

---

## 👨‍💻 Author

Dhananjay Agnihotri  
[LinkedIn](https://linkedin.com/in/your-profile) • [GitHub](https://github.com/your-username)

---