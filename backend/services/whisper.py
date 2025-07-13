import os
from openai import OpenAI
import tempfile
from pydub import AudioSegment
from dotenv import load_dotenv

load_dotenv()
openai_client = OpenAI()

def transcribe_audio(file_path):
    try:
        with open(file_path, "rb") as f:
            transcript = openai_client.audio.transcriptions.create(
                model="whisper-1",
                file=f
            )
        return transcript.text
    except Exception as e:
        return f"⚠️ Whisper Error: {str(e)}"
