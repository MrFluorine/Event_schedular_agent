const BASE_URL = "https://event-schedular-agent-98441850389.asia-south1.run.app";

export async function sendMessage(user_input, history = [], voice = false, access_token) {
  const res = await fetch(`${BASE_URL}/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_input, history, voice, access_token }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function transcribeAudio(file) {
  const formData = new FormData();
  formData.append("file", file, "recording.webm"); // ✅ Name added

  const res = await fetch(`${BASE_URL}/transcribe`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Transcription failed");
  return res.json();
}

export async function getFreeSlots(access_token, duration_minutes = 30, num_slots = 5) {
  const res = await fetch(`${BASE_URL}/calendar/free-slots`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token, duration_minutes, num_slots }),
  });
  if (!res.ok) throw new Error("Failed to fetch free slots");
  return res.json();
}

export async function createCalendarEvent(access_token, summary, start_time, end_time) {
  const res = await fetch(`${BASE_URL}/calendar/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_token,
      summary,
      start_time,
      end_time,
    }),
  });
  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
}

export async function fetchUserProfile(access_token) {
  const res = await fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
}