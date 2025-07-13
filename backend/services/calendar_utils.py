import os
from datetime import datetime, timedelta
import pytz
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

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

def find_free_slots(access_token, duration_minutes=30, num_slots=5, timezone="Asia/Kolkata"):
    service = get_calendar_service(access_token)

    now = datetime.utcnow()
    end = now + timedelta(days=7)  # look 1 week ahead

    body = {
        "timeMin": now.isoformat() + "Z",
        "timeMax": end.isoformat() + "Z",
        "items": [{"id": "primary"}],
    }

    events_result = service.freebusy().query(body=body).execute()
    busy_times = events_result["calendars"]["primary"]["busy"]

    all_slots = []
    slot_start = now.replace(minute=0, second=0, microsecond=0)

    while slot_start < end and len(all_slots) < num_slots:
        slot_end = slot_start + timedelta(minutes=duration_minutes)
        overlap = any(
            slot_start < datetime.fromisoformat(b["end"].replace("Z", "+00:00")) and
            slot_end > datetime.fromisoformat(b["start"].replace("Z", "+00:00"))
            for b in busy_times
        )
        if not overlap and 9 <= slot_start.hour < 18:
            all_slots.append({
                "start": slot_start.isoformat() + "Z",
                "end": slot_end.isoformat() + "Z",
                "display": format_slot(slot_start.isoformat() + "Z", slot_end.isoformat() + "Z", timezone)
            })
        slot_start += timedelta(minutes=30)

    return all_slots

def create_event(access_token, summary, start_time, end_time, timezone="Asia/Kolkata"):
    service = get_calendar_service(access_token)
    event = {
        "summary": summary,
        "start": {"dateTime": start_time, "timeZone": timezone},
        "end": {"dateTime": end_time, "timeZone": timezone},
    }
    created_event = service.events().insert(calendarId="primary", body=event).execute()
    return created_event.get("htmlLink")