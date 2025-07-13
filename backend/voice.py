import os
from openai import OpenAI
import tempfile
from pydub import AudioSegment
from dotenv import load_dotenv

load_dotenv()
openai_client = OpenAI()

def transcribe_audio(audio_bytes):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as f:
            transcript = openai_client.audio.transcriptions.create(
                model="whisper-1",
                file=f
            )
        return transcript.text
    except Exception as e:
        return f"⚠️ Whisper Error: {str(e)}"
    finally:
        os.remove(tmp_path)

def stream_reply_audio(text):
    try:
        speech_response = openai_client.audio.speech.create(
            model="tts-1",
            voice="nova",
            input=text
        )
        audio_path = os.path.join(tempfile.gettempdir(), "response.mp3")
        speech_response.stream_to_file(audio_path)
        os.system(f"afplay {audio_path}" if os.name == "posix" else f"start {audio_path}")
    except Exception as e:
        print(f"🔇 OpenAI TTS error: {e}")