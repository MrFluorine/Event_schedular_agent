from fastapi import APIRouter, File, UploadFile, HTTPException
from services.whisper import transcribe_audio
import tempfile

router = APIRouter()

@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        with tempfile.NamedTemporaryFile(suffix=".webm") as tmp:
            tmp.write(audio_bytes)
            tmp.flush()
            transcript = transcribe_audio(tmp.name)
        return {"transcript": transcript}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
