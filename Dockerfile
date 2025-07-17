FROM python:3.10-slim

WORKDIR /app

# Copy requirements first for better layer caching
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend directory
COPY backend/ .

# Expose port 8080
EXPOSE 8080

# Run the application - note the path change
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]