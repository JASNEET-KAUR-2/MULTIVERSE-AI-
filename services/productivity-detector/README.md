# Productivity Detector Service

FastAPI service for productivity prediction from text.

## Run

```bash
cd services/productivity-detector
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

## API

`POST /predict`

Request:

```json
{ "text": "Finished two focused study sessions and cleared my task list." }
```

Response:

```json
{
  "input": "Finished two focused study sessions and cleared my task list.",
  "predicted_label": "POSITIVE",
  "confidence": 0.9981,
  "numeric_metrics_placeholder": {
    "status": "not_enabled",
    "message": "Hook a RandomForest or XGBoost model here for task-count, focus-time, and habit metrics."
  }
}
```
