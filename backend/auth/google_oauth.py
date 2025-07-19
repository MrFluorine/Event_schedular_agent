# Google OAuth 2.0 for Web Application Flow (NOT "installed" desktop flow)
from dotenv import load_dotenv
load_dotenv()
import os
import requests
from urllib.parse import urlencode

CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = os.getenv("OAUTH_REDIRECT_URI", "https://event-schedular-agent.vercel.app/login")
SCOPES = os.getenv("SCOPES", "https://www.googleapis.com/auth/calendar").split(",")

AUTH_URL = "https://accounts.google.com/o/oauth2/auth"
TOKEN_URL = "https://oauth2.googleapis.com/token"

def get_auth_url():
    # print("🔑 [DEBUG] get_auth_url()")
    # print("CLIENT_ID:", CLIENT_ID)
    # print("REDIRECT_URI:", REDIRECT_URI)
    # print("SCOPES:", SCOPES)
    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "scope": " ".join(SCOPES),
        "response_type": "code",
        "access_type": "offline",
        "prompt": "consent"
    }
    return f"{AUTH_URL}?{urlencode(params)}"

def exchange_code_for_tokens(code):
    # print("🔑 [DEBUG] exchange_code_for_tokens()")
    # print("Using CODE:", code)
    data = {
        "code": code,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code"
    }
    print("POSTing to:", TOKEN_URL)
    response = requests.post(TOKEN_URL, data=data)
    if response.status_code != 200:
        print("❌ Token exchange failed:", response.text)
        raise Exception(f"Token exchange failed: {response.status_code} - {response.text}")
    print("✅ Token exchange success")
    return response.json()

def refresh_access_token(refresh_token):
    print("🔁 [DEBUG] refresh_access_token()")
    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }
    print("Refreshing token via:", TOKEN_URL)
    response = requests.post(TOKEN_URL, data=data)
    if response.status_code != 200:
        print("❌ Refresh failed:", response.text)
        raise Exception(f"Token refresh failed: {response.status_code} - {response.text}")
    print("✅ Refresh success")
    return response.json()