from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import requests
import os

router = APIRouter()

class CodePayload(BaseModel):
    code: str

@router.post("/exchange-code")
def exchange_code(payload: CodePayload):
    print("🔁 Received code:", payload.code)
    data = {
        "code": payload.code,
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
        "redirect_uri": os.getenv("OAUTH_REDIRECT_URI"),
        "grant_type": "authorization_code",
    }

    token_res = requests.post("https://oauth2.googleapis.com/token", data=data)
    if not token_res.ok:
        raise HTTPException(status_code=400, detail=token_res.json())

    tokens = token_res.json()
    print("🔐 Token response:", tokens)
    access_token = tokens.get("access_token")

    if not access_token:
        raise HTTPException(status_code=400, detail="No access token in response")

    user_info_res = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"}
    )

    if not user_info_res.ok:
        raise HTTPException(status_code=400, detail="Failed to fetch user info")

    return JSONResponse(content={
        "access_token": access_token,
        "user": user_info_res.json()
    })