from pydantic import BaseModel
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from model import detect_emotion_from_bytes


class EmotionDetectionPayload(BaseModel):
    image_base64: str | None = None

app = FastAPI(title="FutureSync Emotion Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/detect-emotion")
async def detect_emotion(
    request: Request,
    image: UploadFile | None = File(default=None),
    image_base64: str | None = Form(default=None),
):
    body_image_base64 = None

    if request.headers.get("content-type", "").startswith("application/json"):
        payload = EmotionDetectionPayload.model_validate(await request.json())
        body_image_base64 = payload.image_base64

    resolved_image_base64 = image_base64 or body_image_base64

    if image is None and not resolved_image_base64:
        raise HTTPException(status_code=400, detail="Provide either an image upload or image_base64.")

    if image is not None:
        image_bytes = await image.read()
    else:
        image_bytes = resolved_image_base64.encode("utf-8")

    try:
        return detect_emotion_from_bytes(image_bytes)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
