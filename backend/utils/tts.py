import os
from openai import OpenAI
import tempfile
from pydub import AudioSegment
from dotenv import load_dotenv

load_dotenv()
openai_client = OpenAI()
def synthesize_audio(text):
    try:
        speech_response = openai_client.audio.speech.create(
            model="tts-1",
            voice="nova",
            input=text
        )
        audio_path = os.path.join(tempfile.gettempdir(), "response.mp3")
        speech_response.stream_to_file(audio_path)

        # os.system(f"afplay {audio_path}" if os.name == "posix" else f"start {audio_path}")

        with open(audio_path, "rb") as f:
            return f.read()

    except Exception as e:
        print(f"🔇 OpenAI TTS error: {e}")
        return None