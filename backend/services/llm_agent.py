import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
from routes.calendar import find_free_slots, create_event

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
        description="Create a meeting on user's calendar",
        parameters=types.Schema(
            type=types.Type.OBJECT,
            properties={
                "summary": types.Schema(type=types.Type.STRING),
                "start_time": types.Schema(type=types.Type.STRING),
                "end_time": types.Schema(type=types.Type.STRING)
            },
            required=["summary", "start_time", "end_time"]
        )
    )
]

tools = types.Tool(function_declarations=function_declarations)
config = types.GenerateContentConfig(tools=[tools])

def chat_with_gemini(user_input, history=[], access_token=None):
    try:
        # Maintain conversation history
        history.append(user_input)

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=history,
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