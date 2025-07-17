import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
from services.calendar_utils import find_free_slots, create_event, create_meeting_event, list_events, delete_event, reschedule_event, get_meeting_link


load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

function_declarations = [
    types.FunctionDeclaration(
        name="find_free_slots",
        description="Get user's available meeting times",
        parameters=types.Schema(
            type=types.Type.OBJECT,
            properties={
                "duration_minutes": types.Schema(
                    type=types.Type.INTEGER,
                    description="Desired meeting duration in minutes"
                )
            },
            required=["duration_minutes"]
        )
    ),
    types.FunctionDeclaration(
        name="create_event",
        description="Create a regular calendar event without meeting link",
        parameters=types.Schema(
            type=types.Type.OBJECT,
            properties={
                "summary": types.Schema(type=types.Type.STRING),
                "start_time": types.Schema(type=types.Type.STRING),
                "end_time": types.Schema(type=types.Type.STRING)
            },
            required=["summary", "start_time", "end_time"]
        )
    ),
    types.FunctionDeclaration(
        name="create_meeting_event",
        description="Create a meeting event with Google Meet link attached",
        parameters=types.Schema(
            type=types.Type.OBJECT,
            properties={
                "summary": types.Schema(type=types.Type.STRING),
                "start_time": types.Schema(type=types.Type.STRING),
                "end_time": types.Schema(type=types.Type.STRING)
            },
            required=["summary", "start_time", "end_time"]
        )
    ),
    types.FunctionDeclaration(
        name="list_events",
        description="List upcoming events for a specific day or time range",
        parameters=types.Schema(
            type=types.Type.OBJECT,
            properties={
                "date": types.Schema(
                    type=types.Type.STRING,
                    description="Specific date to check (YYYY-MM-DD format)"
                ),
                "start_date": types.Schema(
                    type=types.Type.STRING,
                    description="Start date for range query (YYYY-MM-DD format)"
                ),
                "end_date": types.Schema(
                    type=types.Type.STRING,
                    description="End date for range query (YYYY-MM-DD format)"
                )
            }
        )
    ),
    types.FunctionDeclaration(
        name="delete_event",
        description="Cancel an existing meeting by date and summary",
        parameters=types.Schema(
            type=types.Type.OBJECT,
            properties={
                "date": types.Schema(
                    type=types.Type.STRING,
                    description="Date of the event to delete (YYYY-MM-DD format)"
                ),
                "summary": types.Schema(
                    type=types.Type.STRING,
                    description="Summary/title of the event to delete"
                )
            },
            required=["date", "summary"]
        )
    ),
    types.FunctionDeclaration(
        name="reschedule_event",
        description="Move an event to a new time by date and summary",
        parameters=types.Schema(
            type=types.Type.OBJECT,
            properties={
                "date": types.Schema(
                    type=types.Type.STRING,
                    description="Current date of the event (YYYY-MM-DD format)"
                ),
                "summary": types.Schema(
                    type=types.Type.STRING,
                    description="Summary/title of the event to reschedule"
                ),
                "new_start_time": types.Schema(
                    type=types.Type.STRING,
                    description="New start time for the event (ISO format)"
                ),
                "new_end_time": types.Schema(
                    type=types.Type.STRING,
                    description="New end time for the event (ISO format)"
                )
            },
            required=["date", "summary", "new_start_time", "new_end_time"]
        )
    ),
    types.FunctionDeclaration(
        name="get_meeting_link",
        description="Get meeting link for an event by date and summary",
        parameters=types.Schema(
            type=types.Type.OBJECT,
            properties={
                "date": types.Schema(
                    type=types.Type.STRING,
                    description="Date of the event (YYYY-MM-DD format)"
                ),
                "summary": types.Schema(
                    type=types.Type.STRING,
                    description="Summary/title of the event to get meeting link for"
                )
            },
            required=["date", "summary"]
        )
    )
]

tools = types.Tool(function_declarations=function_declarations)
config = types.GenerateContentConfig(tools=[tools])
from datetime import datetime
import pytz

# Set your timezone (e.g., Asia/Kolkata for IST)
tz = pytz.timezone("Asia/Kolkata")
now = datetime.now(tz)

formatted_time = now.strftime("%A, %B %d, %Y at %I:%M %p %Z")
SYSTEM_PROMPT = f"""
You are Smart Scheduler, an AI scheduling assistant built on top of Gemini and integrated with Google Calendar, OpenAI Whisper, and Text-to-Speech APIs. Your job is to help the user manage their time and meetings through natural, human-like conversation. You understand voice-to-text inputs and reply with responses suitable for both text and voice synthesis. Always keep your answers polite, concise, and context-aware.

The current date and time is: {formatted_time}

Your core functions include:
- Scheduling single or recurring events on the user's Google Calendar
- Creating meetings with Google Meet links automatically attached
- Cancelling or rescheduling existing events
- Answering availability queries like "What's on my calendar today?" or "Am I free next Monday at 2 PM?"
- Understanding fuzzy or informal inputs like "Book a dentist on Friday at 10"
- Respecting the user's timezone and preferences
- Calling calendar tools only when intent is clear (via function/tool calling)
- Returning formatted output compatible with Text-to-Speech response
- Retrieving meeting links for scheduled events

When to use which function:
- Use `create_event` for regular calendar events (appointments, reminders, personal events)
- Use `create_meeting_event` for meetings that need video conferencing (team meetings, client calls, interviews)
- If user mentions "meeting", "call", "video call", "conference", or similar collaborative terms, use `create_meeting_event`
- If user mentions "appointment", "reminder", "dentist", "personal" or similar individual activities, use `create_event`

Constraints:
- Never hallucinate events or confirm actions unless the calendar tool was successfully invoked
- If required arguments are missing (e.g. time or date), ask follow-up questions
- Use clear and friendly language, appropriate for spoken replies
- If a user is not authenticated or lacks calendar access, gracefully inform them and suggest logging in
- Never leak access tokens, internal logs, or credentials

Available tools:
- `create_event`: Schedule a regular calendar event without meeting link
- `create_meeting_event`: Schedule a meeting with Google Meet link attached
- `find_free_slots`: Get user's available meeting times
- `list_events`: List upcoming events for a specific day or time range
- `delete_event`: Cancel an existing meeting by date and summary
- `reschedule_event`: Move an event to a new time by date and summary
- `get_meeting_link`: Get meeting link for an event by date and summary

The user's voice will be converted to text by Whisper, and your response will be converted to speech. Ensure responses are short and listener-friendly.

Be helpful, calm, and efficient. Your goal is to make scheduling effortless.
"""

def chat_with_gemini(user_input, history=[], access_token=None):
    try:
        # Maintain conversation history
        history.append(user_input)
        content = [SYSTEM_PROMPT] + history
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=content,
            config=config,
        )

        part = response.candidates[0].content.parts[0]
        function_call = getattr(part, "function_call", None)

        if function_call is not None:
            if not access_token:
                return "🔐 Missing calendar access. Please log in again.", history

            name = function_call.name
            args = function_call.args

            print(f"[TOOL CALL] Gemini is calling: {name} with args: {args}")

            if name == "find_free_slots":
                slots = find_free_slots(access_token, **args)
                slot_texts = [s["display"] for s in slots]
                reply_text = "🗓️ Here are some available slots:\n- " + "\n- ".join(slot_texts)
                history.append(reply_text)
                return reply_text, history

            elif name == "create_event":
                link = create_event(access_token, **args)
                reply_text = f"✅ Event created: {link}"
                history.append(reply_text)
                return reply_text, history

            elif name == "create_meeting_event":
                meeting_info = create_meeting_event(access_token, **args)
                if meeting_info['meeting_links']:
                    # Format meeting links for response
                    links_text = []
                    for link in meeting_info['meeting_links']:
                        links_text.append(f"📹 {link['type']}: {link['url']}")
                    
                    reply_text = f"✅ Meeting created: {meeting_info['summary']}\n"
                    reply_text += f"🕐 Time: {meeting_info['day']} {meeting_info['start_time']} – {meeting_info['end_time']}\n"
                    reply_text += f"📅 Event: {meeting_info['event_link']}\n"
                    reply_text += "\n".join(links_text)
                else:
                    reply_text = f"✅ Meeting created: {meeting_info['summary']}\n"
                    reply_text += f"🕐 Time: {meeting_info['day']} {meeting_info['start_time']} – {meeting_info['end_time']}\n"
                    reply_text += f"📅 Event: {meeting_info['event_link']}\n"
                    reply_text += "⚠️ No meeting link was generated"
                
                history.append(reply_text)
                return reply_text, history

            elif name == "list_events":
                events = list_events(access_token, **args)
                if events:
                    event_texts = [f"{event['summary']} ({event['start']} - {event['end']})" for event in events]
                    reply_text = "📅 Here are your upcoming events:\n- " + "\n- ".join(event_texts)
                else:
                    reply_text = "📅 No events found for the specified time period."
                history.append(reply_text)
                return reply_text, history

            elif name == "delete_event":
                success = delete_event(access_token, **args)
                if success:
                    reply_text = f"🗑️ Event '{args['summary']}' has been cancelled."
                else:
                    reply_text = f"❌ Could not find or delete event '{args['summary']}' on {args['date']}."
                history.append(reply_text)
                return reply_text, history

            elif name == "reschedule_event":
                success = reschedule_event(access_token, **args)
                if success:
                    reply_text = f"🔄 Event '{args['summary']}' has been rescheduled to the new time."
                else:
                    reply_text = f"❌ Could not find or reschedule event '{args['summary']}' on {args['date']}."
                history.append(reply_text)
                return reply_text, history

            elif name == "get_meeting_link":
                meeting_info = get_meeting_link(access_token, **args)
                if meeting_info:
                    if meeting_info['links']:
                        # Format meeting links for response
                        links_text = []
                        for link in meeting_info['links']:
                            links_text.append(f"📹 {link['type']}: {link['url']}")
                        
                        reply_text = f"🔗 Meeting links for '{meeting_info['summary']}' ({meeting_info['start_time']} - {meeting_info['end_time']}):\n" + "\n".join(links_text)
                    else:
                        reply_text = f"⚠️ No meeting links found for '{meeting_info['summary']}' on {meeting_info['date']}."
                else:
                    reply_text = f"❌ Could not find event '{args['summary']}' on {args['date']}."
                history.append(reply_text)
                return reply_text, history

        try:
            parts = response.candidates[0].content.parts
            reply_text = next((p.text for p in parts if hasattr(p, 'text')), "")
        except Exception as e:
            print("⚠️ Failed to extract reply text from Gemini response:", e)
            reply_text = response.text

        history.append(reply_text)
        return reply_text, history

    except Exception as e:
        return f"⚠️ Gemini Error: {str(e)}", history