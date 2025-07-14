import os
from datetime import datetime, timedelta
from typing import List, Optional
import pytz
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from services.calendar_utils import find_free_slots as service_find_free_slots, create_event as service_create_event

router = APIRouter()

def get_calendar_service(access_token):
    creds = Credentials(
        token=access_token,
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET")
    )
    return build('calendar', 'v3', credentials=creds)

def format_slot(start_iso, end_iso, tz_str="Asia/Kolkata"):
    tz = pytz.timezone(tz_str)
    start_dt = datetime.fromisoformat(start_iso.replace("Z", "+00:00")).astimezone(tz)
    end_dt = datetime.fromisoformat(end_iso.replace("Z", "+00:00")).astimezone(tz)
    return f"{start_dt.strftime('%A %I:%M %p')} – {end_dt.strftime('%I:%M %p')}"

class FreeSlotRequest(BaseModel):
    access_token: str
    duration_minutes: Optional[int] = 30
    num_slots: Optional[int] = 5
    timezone: Optional[str] = "Asia/Kolkata"

class Slot(BaseModel):
    start: str
    end: str
    display: str

@router.post("/calendar/free-slots", response_model=List[Slot])
def find_free_slots(request: FreeSlotRequest):
    try:
        return service_find_free_slots(
            access_token=request.access_token,
            duration_minutes=request.duration_minutes,
            num_slots=request.num_slots,
            timezone=request.timezone
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class CreateEventRequest(BaseModel):
    access_token: str
    summary: str
    start_time: str
    end_time: str
    timezone: Optional[str] = "Asia/Kolkata"

@router.post("/calendar/create")
def create_event(request: CreateEventRequest):
    try:
        return service_create_event(
            access_token=request.access_token,
            summary=request.summary,
            start_time=request.start_time,
            end_time=request.end_time,
            timezone=request.timezone
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))