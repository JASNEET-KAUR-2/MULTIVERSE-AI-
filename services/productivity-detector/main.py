"""
FastAPI productivity detector service.

Run locally:
    python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
"""

from functools import lru_cache
from typing import Dict, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from transformers import pipeline


class PredictRequest(BaseModel):
    text: str = Field(..., min_length=1, description="User activity description")


class PredictResponse(BaseModel):
    input: str
    predicted_label: str
    confidence: float
    numeric_metrics_placeholder: Optional[Dict[str, str]] = None


@lru_cache(maxsize=1)
def get_classifier():
    """
    DistilBERT sentiment is used here as a productivity proxy:
    POSITIVE -> high productivity signal
    NEGATIVE -> low productivity signal
    """
    return pipeline(
        task="text-classification",
        model="distilbert-base-uncased-finetuned-sst-2-english",
        return_all_scores=False,
    )


def numeric_model_placeholder() -> Dict[str, str]:
    return {
        "status": "not_enabled",
        "message": "Hook a RandomForest or XGBoost model here for task-count, focus-time, and habit metrics.",
    }


app = FastAPI(
    title="Productivity Detector API",
    version="1.0.0",
    description="Predicts high/low productivity from free-text activity descriptions.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "service": "productivity-detector",
        "status": "ok",
        "predict_endpoint": "/predict",
        "docs": "/docs",
    }


@app.post("/predict", response_model=PredictResponse)
def predict_productivity(payload: PredictRequest):
    classifier = get_classifier()
    result = classifier(payload.text)[0]

    return PredictResponse(
        input=payload.text,
        predicted_label=result["label"],
        confidence=round(float(result["score"]), 4),
        numeric_metrics_placeholder=numeric_model_placeholder(),
    )
