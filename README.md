# 🤖 Smart Scheduler AI Agent

The Smart Scheduler AI Agent is a voice-enabled conversational assistant that helps users schedule meetings by understanding natural language requests. It integrates with Google Calendar, uses Gemini for intent extraction and tool-calling, and provides voice-based interaction using Whisper and OpenAI TTS.

## ✨ Features

- 🔐 **Google OAuth2 Integration** - Secure per-user calendar access
- 🎙️ **Voice Input** - Natural language voice commands using OpenAI Whisper
- 🧠 **AI-Powered Understanding** - Gemini LLM with tool-calling for calendar functions
- 🗓️ **Real-time Calendar Integration** - Direct integration with Google Calendar API
- 🔊 **Voice Responses** - Natural voice feedback via OpenAI TTS
- ⚙️ **Modern Frontend** - Built with React and Vite for a responsive UI
- 📱 **User-Friendly Interface** - Clean, intuitive web interface

## 🛠️ Technology Stack

- **LLM**: Google Gemini (via `google-generativeai`)
- **STT**: OpenAI Whisper
- **TTS**: OpenAI Text-to-Speech
- **Calendar API**: Google Calendar v3
- **Frontend Framework**: React + Vite
- **Backend Framework**: FastAPI (Python)
- **Authentication**: Google OAuth2

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- Google Cloud Console account
- OpenAI API key
- Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MrFluorine/smart-scheduler.git
   cd smart-scheduler
   ```

2. **Backend setup**

   - Create and activate a Python virtual environment:
     ```bash
     python -m venv .venv
     source .venv/bin/activate  # On Windows: .venv\Scripts\activate
     ```

   - Install Python dependencies:
     ```bash
     pip install -r requirements.txt
     ```

3. **Frontend setup**

   - Navigate to the frontend directory and install dependencies:
     ```bash
     cd frontend
     npm install
     ```

4. **Configure environment variables**

   Create two `.env` files: one in the `backend` directory and another in the `frontend` directory.

   **Backend `.env`:**
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   OAUTH_REDIRECT_URI=http://localhost:5173/login
   SCOPES=https://www.googleapis.com/auth/calendar
   GEMINI_API_KEY=your_gemini_key
   OPENAI_API_KEY=your_openai_key
   ```

   **Frontend `.env`:**
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_REDIRECT_URI=http://localhost:5173/login
   ```

5. **Run the application**

   - Start the backend server:
     ```bash
     uvicorn backend.main:app --reload
     ```

   - In a separate terminal, start the frontend development server:
     ```bash
     cd frontend
     npm run dev
     ```

   - Open your browser and navigate to `http://localhost:5173`

## ⚙️ Configuration

### Google Calendar API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Set up OAuth 2.0 credentials (Web application type)
5. Add `http://localhost:5173/login` to authorized redirect URIs
6. Copy `client_id` and `client_secret` to your `.env` file

### API Keys

- **Gemini API**: Get your key from [Google AI Studio](https://aistudio.google.com/)
- **OpenAI API**: Obtain from [OpenAI Platform](https://platform.openai.com/)

## 📖 Usage

1. **Launch backend** by running `uvicorn backend.main:app --reload`
2. **Launch frontend** by running `npm run dev` inside the `frontend` directory
3. **Open** `http://localhost:5173` in your browser
4. **Login with Google** using the authentication button
5. **Grant calendar permissions** when prompted
6. **Start scheduling** by speaking your requests:
   - "Schedule a meeting with John tomorrow at 2 PM for 1 hour"
   - "Book a dentist appointment next Friday at 10 AM"
   - "Set up a team standup every Monday at 9 AM"

### Voice Commands Examples

- **Simple scheduling**: "Schedule a meeting Tuesday at 4 PM for 1 hour"
- **Meeting with participants**: "Set up a project review with the team Thursday at 3 PM"
- **Recurring events**: "Book a weekly one-on-one every Friday at 2 PM"
- **Quick queries**: "What's on my calendar today?"

## 🔄 How It Works

1. **Voice Capture** 📝 - User speaks their scheduling request in the frontend
2. **Speech-to-Text** 🎯 - Whisper converts voice to text in the backend
3. **Intent Processing** 🤖 - Gemini extracts scheduling intent and parameters
4. **Calendar Integration** 🗓️ - Backend queries/updates Google Calendar
5. **Response Generation** 💬 - Gemini formulates appropriate response
6. **Voice Feedback** 🔊 - OpenAI TTS converts response to speech

## 🌐 Deployment

### Backend Deployment (Google Cloud Run)

```bash
# Build and deploy backend container to Cloud Run
gcloud builds submit --tag gcr.io/PROJECT_ID/smart-scheduler-backend
gcloud run deploy smart-scheduler-backend --image gcr.io/PROJECT_ID/smart-scheduler-backend --platform managed
```

### Frontend Deployment (Firebase Hosting)

```bash
# Install Firebase CLI if not installed
npm install -g firebase-tools

# Initialize Firebase in frontend directory (once)
firebase init hosting

# Build and deploy frontend
npm run build
firebase deploy --only hosting
```

**Note**: Update environment variables and OAuth redirect URIs in production accordingly.

## 📁 Project Structure

```
smart-scheduler/
├── backend/
│   ├── main.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── calendar.py
│   │   ├── chat.py
│   │   └── transcribe.py
│   ├── services/
│   │   ├── calendar_utils.py
│   │   ├── llm_agent.py
│   │   └── whisper.py
│   ├── auth/
│   │   └── google_oauth.py
│   └── utils/
│       └── tts.py
├── frontend/
│   ├── public/
        ├── default-avatar.png
│   ├── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   ├── api.js
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   └── Login.jsx
│   │   ├── components/
│   │   │   ├── ChatBar.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Recorder.jsx
│   └── tailwind.config.js
├── .env
├── requirements.txt
├── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Privacy & Security

- All calendar data is accessed securely through Google's OAuth2
- Voice data is processed temporarily and not stored
- API keys should be kept secure and never committed to version control
- User consent is required for all calendar operations

## 🐛 Troubleshooting

### Common Issues

**OAuth Errors**
- Ensure redirect URI matches exactly in Google Console
- Check that Calendar API is enabled
- Verify client ID and secret are correct

**Voice Input Not Working**
- Check microphone permissions in browser
- Ensure OpenAI API key is valid
- Test with shorter voice commands

**Calendar Operations Failing**
- Verify Google Calendar API quota
- Check authentication token validity
- Ensure proper calendar permissions

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/MrFluorine/smart-scheduler/issues) page
2. Create a new issue with detailed description
3. Contact: [Your Email/Contact Info]

## 🙏 Acknowledgments

- Google for Gemini AI and Calendar API
- OpenAI for Whisper speech recognition and text-to-speech
- React and Vite for the frontend framework

---

**Author**: [MrFluorine](https://github.com/MrFluorine)  
**Repository**: [smart-scheduler](https://github.com/MrFluorine/smart-scheduler)