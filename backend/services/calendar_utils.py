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
    try:
        service = get_calendar_service(access_token)

        # Make sure we're working with timezone-aware datetimes
        now = datetime.utcnow().replace(tzinfo=pytz.UTC)  # Make UTC timezone-aware
        end = now + timedelta(days=7)  # look 1 week ahead

        body = {
            "timeMin": now.isoformat(),  # Remove the 'Z' since we have proper timezone
            "timeMax": end.isoformat(),
            "items": [{"id": "primary"}],
        }

        events_result = service.freebusy().query(body=body).execute()
        busy_times = events_result["calendars"]["primary"]["busy"]

        all_slots = []
        slot_start = now.replace(minute=0, second=0, microsecond=0)

        while slot_start < end and len(all_slots) < num_slots:
            slot_end = slot_start + timedelta(minutes=duration_minutes)
            
            # Convert busy times to timezone-aware datetime objects
            overlap = any(
                slot_start < datetime.fromisoformat(b["end"].replace("Z", "+00:00")) and
                slot_end > datetime.fromisoformat(b["start"].replace("Z", "+00:00"))
                for b in busy_times
            )
            
            # Check if slot is within business hours (9 AM to 6 PM in the specified timezone)
            local_tz = pytz.timezone(timezone)
            slot_start_local = slot_start.astimezone(local_tz)
            
            if not overlap and 9 <= slot_start_local.hour < 18:
                all_slots.append({
                    "start": slot_start.isoformat(),
                    "end": slot_end.isoformat(),
                    "display": format_slot(slot_start.isoformat(), slot_end.isoformat(), timezone)
                })
            slot_start += timedelta(minutes=30)

        return all_slots
    except Exception as e:
        print("❌ Error in find_free_slots:", e)
        raise

def create_event(access_token, summary, start_time, end_time, timezone="Asia/Kolkata"):
    service = get_calendar_service(access_token)
    event = {
        "summary": summary,
        "start": {"dateTime": start_time, "timeZone": timezone},
        "end": {"dateTime": end_time, "timeZone": timezone},
    }
    try:
        created_event = service.events().insert(calendarId="primary", body=event).execute()
        return created_event.get("htmlLink")
    except Exception as e:
        print("❌ Error in create_event:", e)
        raise

def create_meeting_event(access_token, summary, start_time, end_time, timezone="Asia/Kolkata"):
    """
    Create a calendar event with an attached Google Meet link.
    
    Args:
        access_token: Google OAuth access token
        summary: Title/summary of the event
        start_time: Start time (ISO format)
        end_time: End time (ISO format)
        timezone: Timezone string (default: Asia/Kolkata)
    
    Returns:
        Dictionary containing event link and meeting link information
    """
    try:
        service = get_calendar_service(access_token)
        
        # Create event with Google Meet conference
        event = {
            "summary": summary,
            "start": {"dateTime": start_time, "timeZone": timezone},
            "end": {"dateTime": end_time, "timeZone": timezone},
            "conferenceData": {
                "createRequest": {
                    "requestId": f"meet-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                    "conferenceSolutionKey": {
                        "type": "hangoutsMeet"
                    }
                }
            }
        }
        
        # Create the event with conference data
        created_event = service.events().insert(
            calendarId="primary", 
            body=event, 
            conferenceDataVersion=1
        ).execute()
        
        # Extract meeting information
        meeting_info = {
            "event_link": created_event.get("htmlLink"),
            "event_id": created_event.get("id"),
            "summary": summary,
            "meeting_links": []
        }
        
        # Extract Google Meet link from conference data
        if 'conferenceData' in created_event and 'entryPoints' in created_event['conferenceData']:
            for entry_point in created_event['conferenceData']['entryPoints']:
                if entry_point.get('entryPointType') == 'video':
                    meeting_info['meeting_links'].append({
                        'type': 'Google Meet',
                        'url': entry_point.get('uri'),
                        'label': entry_point.get('label', 'Join meeting')
                    })
        
        # Also check for hangoutLink (fallback)
        if 'hangoutLink' in created_event:
            meeting_info['meeting_links'].append({
                'type': 'Google Meet (Legacy)',
                'url': created_event['hangoutLink'],
                'label': 'Join meeting'
            })
        
        # Format time information for display
        tz = pytz.timezone(timezone)
        start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00')).astimezone(tz)
        end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00')).astimezone(tz)
        
        meeting_info['start_time'] = start_dt.strftime('%I:%M %p')
        meeting_info['end_time'] = end_dt.strftime('%I:%M %p')
        meeting_info['date'] = start_dt.strftime('%Y-%m-%d')
        meeting_info['day'] = start_dt.strftime('%A')
        
        if meeting_info['meeting_links']:
            print(f"✅ Created meeting event: {summary}")
            print(f"📅 Time: {meeting_info['day']} {meeting_info['start_time']} – {meeting_info['end_time']}")
            for link in meeting_info['meeting_links']:
                print(f"🔗 {link['type']}: {link['url']}")
        else:
            print(f"⚠️ Event created but no meeting link generated: {summary}")
        
        return meeting_info
        
    except Exception as e:
        print("❌ Error in create_meeting_event:", e)
        raise

def list_events(access_token, date=None, start_date=None, end_date=None, timezone="Asia/Kolkata"):
    """
    List events for a specific date or date range.
    
    Args:
        access_token: Google OAuth access token
        date: Single date to check (YYYY-MM-DD format)
        start_date: Start date for range (YYYY-MM-DD format)
        end_date: End date for range (YYYY-MM-DD format)
        timezone: Timezone string (default: Asia/Kolkata)
    
    Returns:
        List of events with summary, start, and end times
    """
    try:
        service = get_calendar_service(access_token)
        tz = pytz.timezone(timezone)
        
        if date:
            # Single date query
            start_dt = datetime.strptime(date, "%Y-%m-%d")
            start_dt = tz.localize(start_dt.replace(hour=0, minute=0, second=0))
            end_dt = start_dt + timedelta(days=1)
        elif start_date and end_date:
            # Date range query
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            start_dt = tz.localize(start_dt.replace(hour=0, minute=0, second=0))
            end_dt = datetime.strptime(end_date, "%Y-%m-%d")
            end_dt = tz.localize(end_dt.replace(hour=23, minute=59, second=59))
        else:
            # Default to today if no date specified
            now = datetime.now(tz)
            start_dt = now.replace(hour=0, minute=0, second=0)
            end_dt = start_dt + timedelta(days=1)
        
        events_result = service.events().list(
            calendarId='primary',
            timeMin=start_dt.isoformat(),
            timeMax=end_dt.isoformat(),
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        
        formatted_events = []
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            end = event['end'].get('dateTime', event['end'].get('date'))
            
            # Format times for display
            if 'T' in start:  # DateTime event
                start_dt = datetime.fromisoformat(start.replace('Z', '+00:00')).astimezone(tz)
                end_dt = datetime.fromisoformat(end.replace('Z', '+00:00')).astimezone(tz)
                start_display = start_dt.strftime('%I:%M %p')
                end_display = end_dt.strftime('%I:%M %p')
            else:  # All-day event
                start_display = "All day"
                end_display = "All day"
            
            formatted_events.append({
                'summary': event.get('summary', 'No title'),
                'start': start_display,
                'end': end_display,
                'id': event['id']
            })
        
        return formatted_events
        
    except Exception as e:
        print("❌ Error in list_events:", e)
        raise

def delete_event(access_token, date, summary, timezone="Asia/Kolkata"):
    """
    Delete an event by date and summary.
    
    Args:
        access_token: Google OAuth access token
        date: Date of the event (YYYY-MM-DD format)
        summary: Title/summary of the event to delete
        timezone: Timezone string (default: Asia/Kolkata)
    
    Returns:
        Boolean indicating success
    """
    try:
        service = get_calendar_service(access_token)
        tz = pytz.timezone(timezone)
        
        # Get events for the specified date
        start_dt = datetime.strptime(date, "%Y-%m-%d")
        start_dt = tz.localize(start_dt.replace(hour=0, minute=0, second=0))
        end_dt = start_dt + timedelta(days=1)
        
        events_result = service.events().list(
            calendarId='primary',
            timeMin=start_dt.isoformat(),
            timeMax=end_dt.isoformat(),
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        
        # Find the event with matching summary
        for event in events:
            if event.get('summary', '').lower() == summary.lower():
                service.events().delete(calendarId='primary', eventId=event['id']).execute()
                print(f"✅ Deleted event: {summary}")
                return True
        
        print(f"❌ Event not found: {summary} on {date}")
        return False
        
    except Exception as e:
        print("❌ Error in delete_event:", e)
        return False

def reschedule_event(access_token, date, summary, new_start_time, new_end_time, timezone="Asia/Kolkata"):
    """
    Reschedule an event to a new time.
    
    Args:
        access_token: Google OAuth access token
        date: Current date of the event (YYYY-MM-DD format)
        summary: Title/summary of the event to reschedule
        new_start_time: New start time (ISO format)
        new_end_time: New end time (ISO format)
        timezone: Timezone string (default: Asia/Kolkata)
    
    Returns:
        Boolean indicating success
    """
    try:
        service = get_calendar_service(access_token)
        tz = pytz.timezone(timezone)
        
        # Get events for the specified date
        start_dt = datetime.strptime(date, "%Y-%m-%d")
        start_dt = tz.localize(start_dt.replace(hour=0, minute=0, second=0))
        end_dt = start_dt + timedelta(days=1)
        
        events_result = service.events().list(
            calendarId='primary',
            timeMin=start_dt.isoformat(),
            timeMax=end_dt.isoformat(),
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        
        # Find the event with matching summary
        for event in events:
            if event.get('summary', '').lower() == summary.lower():
                # Update the event with new times
                event['start'] = {'dateTime': new_start_time, 'timeZone': timezone}
                event['end'] = {'dateTime': new_end_time, 'timeZone': timezone}
                
                updated_event = service.events().update(
                    calendarId='primary',
                    eventId=event['id'],
                    body=event
                ).execute()
                
                print(f"✅ Rescheduled event: {summary}")
                return True
        
        print(f"❌ Event not found: {summary} on {date}")
        return False
        
    except Exception as e:
        print("❌ Error in reschedule_event:", e)
        return False

def get_meeting_link(access_token, date, summary, timezone="Asia/Kolkata"):
    """
    Get meeting link for an event by date and summary.
    
    Args:
        access_token: Google OAuth access token
        date: Date of the event (YYYY-MM-DD format)
        summary: Title/summary of the event
        timezone: Timezone string (default: Asia/Kolkata)
    
    Returns:
        Dictionary containing meeting link information or None if not found
    """
    try:
        service = get_calendar_service(access_token)
        tz = pytz.timezone(timezone)
        
        # Get events for the specified date
        start_dt = datetime.strptime(date, "%Y-%m-%d")
        start_dt = tz.localize(start_dt.replace(hour=0, minute=0, second=0))
        end_dt = start_dt + timedelta(days=1)
        
        events_result = service.events().list(
            calendarId='primary',
            timeMin=start_dt.isoformat(),
            timeMax=end_dt.isoformat(),
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        
        # Find the event with matching summary
        for event in events:
            if event.get('summary', '').lower() == summary.lower():
                meeting_info = {
                    'summary': event.get('summary', 'No title'),
                    'event_id': event['id'],
                    'links': []
                }
                
                # Check for Google Meet link in conferenceData
                if 'conferenceData' in event and 'entryPoints' in event['conferenceData']:
                    for entry_point in event['conferenceData']['entryPoints']:
                        if entry_point.get('entryPointType') == 'video':
                            meeting_info['links'].append({
                                'type': 'Google Meet',
                                'url': entry_point.get('uri'),
                                'label': entry_point.get('label', 'Join meeting')
                            })
                
                # Check for links in the description
                description = event.get('description', '')
                if description:
                    # Look for common meeting link patterns
                    import re
                    
                    # Zoom links
                    zoom_pattern = r'https://[a-zA-Z0-9.-]+\.zoom\.us/j/[0-9]+(?:\?[^\s]*)?'
                    zoom_matches = re.findall(zoom_pattern, description)
                    for match in zoom_matches:
                        meeting_info['links'].append({
                            'type': 'Zoom',
                            'url': match,
                            'label': 'Join Zoom meeting'
                        })
                    
                    # Teams links
                    teams_pattern = r'https://teams\.microsoft\.com/l/meetup-join/[^\s]+'
                    teams_matches = re.findall(teams_pattern, description)
                    for match in teams_matches:
                        meeting_info['links'].append({
                            'type': 'Microsoft Teams',
                            'url': match,
                            'label': 'Join Teams meeting'
                        })
                    
                    # Generic https links (catch-all for other platforms)
                    generic_pattern = r'https://[^\s]+'
                    all_links = re.findall(generic_pattern, description)
                    for link in all_links:
                        # Skip if already captured by specific patterns
                        if not any(link in existing['url'] for existing in meeting_info['links']):
                            # Check if it might be a meeting link
                            if any(keyword in link.lower() for keyword in ['meet', 'join', 'conference', 'webinar', 'call']):
                                meeting_info['links'].append({
                                    'type': 'Meeting Link',
                                    'url': link,
                                    'label': 'Join meeting'
                                })
                
                # Check for hangoutLink (legacy Google Meet)
                if 'hangoutLink' in event:
                    meeting_info['links'].append({
                        'type': 'Google Meet (Legacy)',
                        'url': event['hangoutLink'],
                        'label': 'Join meeting'
                    })
                
                # Add event details
                start = event['start'].get('dateTime', event['start'].get('date'))
                end = event['end'].get('dateTime', event['end'].get('date'))
                
                if 'T' in start:  # DateTime event
                    start_dt = datetime.fromisoformat(start.replace('Z', '+00:00')).astimezone(tz)
                    end_dt = datetime.fromisoformat(end.replace('Z', '+00:00')).astimezone(tz)
                    meeting_info['start_time'] = start_dt.strftime('%I:%M %p')
                    meeting_info['end_time'] = end_dt.strftime('%I:%M %p')
                    meeting_info['date'] = start_dt.strftime('%Y-%m-%d')
                else:  # All-day event
                    meeting_info['start_time'] = "All day"
                    meeting_info['end_time'] = "All day"
                    meeting_info['date'] = date
                
                if meeting_info['links']:
                    print(f"✅ Found {len(meeting_info['links'])} meeting link(s) for: {summary}")
                    return meeting_info
                else:
                    print(f"⚠️ No meeting links found for: {summary}")
                    return meeting_info
        
        print(f"❌ Event not found: {summary} on {date}")
        return None
        
    except Exception as e:
        print("❌ Error in get_meeting_link:", e)
        return None