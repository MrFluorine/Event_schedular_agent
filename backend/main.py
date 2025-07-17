from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn
from routes.chat import router as chat_router
from routes.calendar import router as calendar_router
from routes.transcribe import router as transcribe_router
from routes.auth import router as auth_router

load_dotenv()

app = FastAPI()

# Allow frontend to connect (adjust origin for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(chat_router)
app.include_router(calendar_router)
app.include_router(transcribe_router)
app.include_router(auth_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Smart Scheduler backend is running."}
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)