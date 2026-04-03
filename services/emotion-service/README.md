# FutureSync Emotion Service

Python microservice for facial emotion detection.

## Run locally

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

## Endpoint

`POST /detect-emotion`

Accepted form fields:

- `image`: uploaded file
- `image_base64`: base64/data URL string

Response:

```json
{
  "emotion": "happy",
  "confidence": 0.92,
  "all_scores": {
    "happy": 0.92,
    "neutral": 0.05
  }
}
```

The service never stores raw image data. It only analyzes the request payload in memory.
