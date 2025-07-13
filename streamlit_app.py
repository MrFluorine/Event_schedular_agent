import streamlit as st
from dotenv import load_dotenv
from audio_recorder_streamlit import audio_recorder
from auth.google_oauth import get_auth_url, exchange_code_for_tokens
from backend.voice import transcribe_audio, stream_reply_audio
from backend.services.llm_agent import chat_with_gemini

load_dotenv()

from datetime import datetime
import pytz

if "chat" not in st.session_state:
    st.session_state.chat = []
if "history" not in st.session_state:
    st.session_state.history = []

st.set_page_config(page_title="Smart Scheduler", layout="centered")
st.title("📅 Smart Scheduler AI Agent")

# --- Authentication ---
query_params = st.query_params
print("🔍 Query Params:", query_params)
raw_code = query_params.get("code")
code = raw_code[0] if isinstance(raw_code, list) else raw_code
print("🔍 FULL CODE:", code)

if "access_token" not in st.session_state:
    if code:
        with st.spinner("🔐 Logging you in..."):
            tokens = exchange_code_for_tokens(code)
            st.session_state["access_token"] = tokens.get("access_token")
            st.session_state["refresh_token"] = tokens.get("refresh_token")
            st.success("✅ Logged in!")

            # Clear code from query params after use
            query_params.clear()
            st.rerun()
    else:
        login_url = get_auth_url()
        st.markdown(f"[🟢 Click here to log in with Google]({login_url})")
        st.stop()

# --- Voice Scheduler Main UI ---
# --- Voice Scheduler Main UI ---
st.success("🎉 You're logged in!")

if "recording" not in st.session_state:
    st.session_state.recording = False
if "audio_data" not in st.session_state:
    st.session_state.audio_data = None

# Display chat messages from oldest to newest
for role, message in st.session_state.chat:
    st.chat_message(role).markdown(message)

# Chat bar layout (text input + mic)
col1, col2 = st.columns([10, 1])
with col1:
    user_input = st.text_input("You", label_visibility="collapsed")
with col2:
    st.markdown("##")
    audio_bytes = audio_recorder(text="Click to record", icon_size="2x")

# If audio is recorded, transcribe automatically
if 'audio_bytes' in locals() and audio_bytes:
    st.audio(audio_bytes, format="audio/wav")
    with st.spinner("Transcribing your message..."):
        transcript = transcribe_audio(audio_bytes)
    user_input = transcript

# Process input when user_input is present
if user_input:
    now = datetime.now(pytz.timezone("Asia/Kolkata"))
    date_context = f"Today's date is {now.strftime('%B %d, %Y')}. The time is {now.strftime('%I:%M %p %Z')}."
    prompt = f"{date_context}\n\n{user_input}"

    st.session_state.chat.append(("user", user_input))
    st.chat_message("user").markdown(user_input)

    with st.spinner("Thinking..."):
        reply, _ = chat_with_gemini(
            prompt,
            history=st.session_state.history,
            access_token=st.session_state.get("access_token")
        )

    st.session_state.chat.append(("assistant", reply))
    st.chat_message("assistant").markdown(reply)
    stream_reply_audio(reply)

    st.session_state.history.append(prompt)