import base64
import io
import os
from pathlib import Path
from functools import lru_cache
from typing import Any

import numpy as np
from PIL import Image

try:
    import cv2
except Exception:  # pragma: no cover
    cv2 = None


@lru_cache(maxsize=1)
def _get_deepface():
    if cv2 is None:
        raise RuntimeError(
            "OpenCV is unavailable. Install requirements.txt before calling /detect-emotion."
        )

    deepface_home = Path(__file__).resolve().parent / ".deepface-home"
    deepface_home.mkdir(exist_ok=True)
    os.environ.setdefault("DEEPFACE_HOME", str(deepface_home))

    try:
        from deepface import DeepFace
    except Exception as error:  # pragma: no cover
        raise RuntimeError(
            "DeepFace dependencies are unavailable. Install requirements.txt before calling /detect-emotion."
        ) from error

    return DeepFace


def _load_image_bytes(image_bytes: bytes) -> np.ndarray:
    raw = image_bytes

    try:
        return np.array(Image.open(io.BytesIO(raw)).convert("RGB"))
    except Exception:
        pass

    if image_bytes.startswith(b"data:"):
        raw = image_bytes.split(b",", 1)[1]

    try:
        decoded = base64.b64decode(raw, validate=False)
        image = Image.open(io.BytesIO(decoded)).convert("RGB")
        return np.array(image)
    except Exception as error:
        raise ValueError("Invalid image payload. Send a valid image file or base64 data URL.") from error


def detect_emotion_from_bytes(image_bytes: bytes) -> dict[str, Any]:
    image_array = _load_image_bytes(image_bytes)
    bgr_image = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
    deepface = _get_deepface()

    analysis = deepface.analyze(
        img_path=bgr_image,
        actions=["emotion"],
        enforce_detection=False,
        detector_backend="opencv",
        silent=True,
    )

    result = analysis[0] if isinstance(analysis, list) else analysis
    emotion = result.get("dominant_emotion", "neutral")
    scores = result.get("emotion", {}) or {}
    confidence = float(scores.get(emotion, 0.0)) / 100.0

    return {
        "emotion": emotion,
        "confidence": round(confidence, 4),
        "all_scores": {key: round(float(value) / 100.0, 4) for key, value in scores.items()},
    }
