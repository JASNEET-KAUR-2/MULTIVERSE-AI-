from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from feature_engineering import engineer_features
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import ExtraTreesClassifier, GradientBoostingClassifier, RandomForestClassifier, StackingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, log_loss
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split


BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "synthetic_user_behavior.csv"
MODEL_PATH = BASE_DIR / "model.pkl"
METRICS_PATH = BASE_DIR / "metrics.json"


def score_row(study_hours, sleep_hours, exercise, screen_time, consistency, procrastination, goal_clarity):
    score = 0

    score += study_hours * 1.7
    score += max(0, 8 - abs(sleep_hours - 7.5)) * 1.1
    score += exercise * 2.2
    score -= screen_time * 0.95
    score += consistency * 1.6
    score -= procrastination * 1.7
    score += goal_clarity * 1.5

    if score >= 22:
        return "High"
    if score >= 11:
        return "Average"
    return "Negative"

def build_dataset(rows: int = 2400) -> pd.DataFrame:
    rng = np.random.default_rng(42)
    personas = [
        {
            "name": "disciplined",
            "weight": 0.28,
            "study_hours": (6.6, 1.3),
            "sleep_hours": (7.4, 0.7),
            "exercise_prob": 0.82,
            "screen_time": (3.1, 1.1),
            "consistency": (8.2, 1.0),
            "procrastination": (2.5, 1.2),
            "goal_clarity": (8.7, 0.9),
        },
        {
            "name": "balanced",
            "weight": 0.34,
            "study_hours": (4.6, 1.2),
            "sleep_hours": (7.1, 0.9),
            "exercise_prob": 0.55,
            "screen_time": (4.8, 1.6),
            "consistency": (6.3, 1.3),
            "procrastination": (4.8, 1.5),
            "goal_clarity": (6.7, 1.2),
        },
        {
            "name": "overwhelmed",
            "weight": 0.22,
            "study_hours": (2.4, 1.1),
            "sleep_hours": (6.0, 1.4),
            "exercise_prob": 0.25,
            "screen_time": (7.0, 1.9),
            "consistency": (4.0, 1.4),
            "procrastination": (7.0, 1.4),
            "goal_clarity": (4.8, 1.5),
        },
        {
            "name": "burnout_risk",
            "weight": 0.16,
            "study_hours": (6.1, 1.7),
            "sleep_hours": (5.5, 1.1),
            "exercise_prob": 0.2,
            "screen_time": (6.2, 1.8),
            "consistency": (5.3, 1.7),
            "procrastination": (6.2, 1.5),
            "goal_clarity": (6.0, 1.3),
        },
        {
            "name": "night_owl_builder",
            "weight": 0.12,
            "study_hours": (5.5, 1.4),
            "sleep_hours": (6.2, 1.0),
            "exercise_prob": 0.48,
            "screen_time": (5.5, 1.4),
            "consistency": (6.9, 1.1),
            "procrastination": (4.1, 1.3),
            "goal_clarity": (7.8, 1.0),
        },
        {
            "name": "hyper_connected",
            "weight": 0.1,
            "study_hours": (3.8, 1.3),
            "sleep_hours": (6.7, 1.2),
            "exercise_prob": 0.34,
            "screen_time": (8.1, 1.7),
            "consistency": (5.2, 1.4),
            "procrastination": (6.0, 1.5),
            "goal_clarity": (5.8, 1.4),
        },
        {
            "name": "rebound_builder",
            "weight": 0.11,
            "study_hours": (5.2, 1.5),
            "sleep_hours": (7.2, 0.9),
            "exercise_prob": 0.58,
            "screen_time": (4.2, 1.3),
            "consistency": (6.8, 1.2),
            "procrastination": (3.8, 1.2),
            "goal_clarity": (7.4, 1.0),
        },
        {
            "name": "directionless_hustler",
            "weight": 0.09,
            "study_hours": (5.9, 1.4),
            "sleep_hours": (6.4, 1.1),
            "exercise_prob": 0.41,
            "screen_time": (5.3, 1.5),
            "consistency": (5.4, 1.3),
            "procrastination": (5.1, 1.4),
            "goal_clarity": (3.9, 1.2),
        },
        {
            "name": "high_potential_drifter",
            "weight": 0.08,
            "study_hours": (6.4, 1.3),
            "sleep_hours": (6.9, 1.0),
            "exercise_prob": 0.47,
            "screen_time": (6.8, 1.6),
            "consistency": (4.8, 1.4),
            "procrastination": (5.8, 1.5),
            "goal_clarity": (7.6, 1.1),
        },
    ]

    persona_names = [persona["name"] for persona in personas]
    persona_weights = np.array([persona["weight"] for persona in personas], dtype=float)
    persona_weights = (persona_weights / persona_weights.sum()).tolist()
    selected_personas = rng.choice(persona_names, size=rows, p=persona_weights)
    persona_lookup = {persona["name"]: persona for persona in personas}

    records = []
    for persona_name in selected_personas:
        persona = persona_lookup[persona_name]
        study_hours = np.clip(rng.normal(*persona["study_hours"]), 0, 10)
        sleep_hours = np.clip(rng.normal(*persona["sleep_hours"]), 3, 10)
        exercise = int(rng.random() < persona["exercise_prob"])
        screen_time = np.clip(rng.normal(*persona["screen_time"]), 0.5, 12)
        consistency = int(np.clip(round(rng.normal(*persona["consistency"])), 1, 10))
        procrastination = int(np.clip(round(rng.normal(*persona["procrastination"])), 1, 10))
        goal_clarity = int(np.clip(round(rng.normal(*persona["goal_clarity"])), 1, 10))

        if rng.random() < 0.12:
            sleep_hours = np.clip(sleep_hours + rng.normal(0, 1.1), 3, 10)
            screen_time = np.clip(screen_time + rng.normal(0.6, 1.4), 0.5, 12)

        if rng.random() < 0.18:
            study_hours = np.clip(study_hours + rng.normal(0.7, 1.1), 0, 10)
            procrastination = int(np.clip(round(procrastination + rng.normal(-0.8, 1.0)), 1, 10))

        if rng.random() < 0.14:
            consistency = int(np.clip(round(consistency + rng.normal(-1.2, 1.0)), 1, 10))
            goal_clarity = int(np.clip(round(goal_clarity + rng.normal(-0.9, 0.8)), 1, 10))

        if rng.random() < 0.1:
            # Late recovery week: better sleep and movement reduce drag quickly.
            sleep_hours = np.clip(sleep_hours + rng.normal(0.8, 0.6), 3, 10)
            exercise = int(rng.random() < min(0.95, persona["exercise_prob"] + 0.2))
            procrastination = int(np.clip(round(procrastination + rng.normal(-1.0, 0.9)), 1, 10))

        if rng.random() < 0.08:
            # Direction slip: goals get fuzzy and screen drift grows.
            goal_clarity = int(np.clip(round(goal_clarity + rng.normal(-1.6, 0.9)), 1, 10))
            screen_time = np.clip(screen_time + rng.normal(1.0, 0.8), 0.5, 12)

        if rng.random() < 0.07:
            # Compounding discipline phase.
            study_hours = np.clip(study_hours + rng.normal(1.0, 0.7), 0, 10)
            consistency = int(np.clip(round(consistency + rng.normal(1.1, 0.8)), 1, 10))
            goal_clarity = int(np.clip(round(goal_clarity + rng.normal(0.9, 0.7)), 1, 10))

        label = score_row(
            study_hours,
            sleep_hours,
            exercise,
            screen_time,
            consistency,
            procrastination,
            goal_clarity,
        )

        records.append(
            {
                "study_hours": round(float(study_hours), 2),
                "sleep_hours": round(float(sleep_hours), 2),
                "exercise": exercise,
                "screen_time": round(float(screen_time), 2),
                "consistency": consistency,
                "procrastination": procrastination,
                "goal_clarity": goal_clarity,
                "target": label,
            }
        )

    dataset = pd.DataFrame.from_records(records)

    return dataset.sample(frac=1, random_state=42).reset_index(drop=True)


def train_model():
    dataset = build_dataset(rows=3200)
    dataset.to_csv(DATA_PATH, index=False)

    feature_columns = [
        "study_hours",
        "sleep_hours",
        "exercise",
        "screen_time",
        "consistency",
        "procrastination",
        "goal_clarity",
    ]

    X = dataset[feature_columns]
    y = dataset["target"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    feature_pipeline = FunctionTransformer(engineer_features, validate=False)
    base_model = StackingClassifier(
        estimators=[
            (
                "random_forest",
                RandomForestClassifier(
                    n_estimators=180,
                    max_depth=10,
                    min_samples_leaf=3,
                    random_state=42,
                ),
            ),
            (
                "extra_trees",
                ExtraTreesClassifier(
                    n_estimators=220,
                    max_depth=12,
                    min_samples_leaf=3,
                    random_state=42,
                ),
            ),
            (
                "gradient_boosting",
                GradientBoostingClassifier(
                    max_depth=4,
                    learning_rate=0.06,
                    n_estimators=140,
                    random_state=42,
                ),
            ),
        ],
        final_estimator=LogisticRegression(max_iter=1800),
        stack_method="predict_proba",
        passthrough=True,
        n_jobs=1,
    )
    model = Pipeline(
        steps=[
            ("feature_builder", feature_pipeline),
            ("classifier", CalibratedClassifierCV(base_model, method="sigmoid", cv=2)),
        ]
    )
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    probabilities = model.predict_proba(X_test)
    accuracy = accuracy_score(y_test, predictions)
    loss = log_loss(y_test, probabilities, labels=model.classes_)
    report = classification_report(y_test, predictions, output_dict=True)
    cross_val = cross_val_score(model, X, y, cv=2, scoring="accuracy", n_jobs=1)

    payload = {
        "model": model,
        "model_name": "FeatureEngineeredCalibratedStackingClassifier",
        "training_version": "v4",
        "feature_columns": feature_columns,
        "labels": sorted(y.unique().tolist()),
    }
    joblib.dump(payload, MODEL_PATH)

    metrics = {
        "rows": len(dataset),
        "accuracy": round(float(accuracy), 4),
        "log_loss": round(float(loss), 4),
        "cross_val_accuracy_mean": round(float(np.mean(cross_val)), 4),
        "cross_val_accuracy_std": round(float(np.std(cross_val)), 4),
        "class_distribution": dataset["target"].value_counts().to_dict(),
        "classification_report": report,
        "training_version": "v4",
    }
    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    print(f"Dataset saved to {DATA_PATH.name}")
    print(f"Model saved to {MODEL_PATH.name}")
    print(f"Accuracy: {accuracy:.4f}")


if __name__ == "__main__":
    train_model()
