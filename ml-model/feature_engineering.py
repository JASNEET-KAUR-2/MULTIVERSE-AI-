from __future__ import annotations

import numpy as np
import pandas as pd


def engineer_features(frame: pd.DataFrame) -> pd.DataFrame:
    features = frame.copy()
    features["sleep_alignment"] = np.clip(1 - np.abs(features["sleep_hours"] - 7.5) / 4.5, 0, 1)
    features["focus_balance"] = np.clip(features["study_hours"] / (features["screen_time"] + 1), 0, 4)
    features["discipline_index"] = np.clip(
        (features["consistency"] + features["goal_clarity"] - features["procrastination"]) / 20,
        -1,
        1,
    )
    features["recovery_score"] = np.clip(
        features["sleep_alignment"] * 0.55 + features["exercise"] * 0.45,
        0,
        1,
    )
    features["burnout_risk"] = np.clip(
        (features["study_hours"] * 0.35 + features["screen_time"] * 0.4 + features["procrastination"] * 0.55)
        - (features["sleep_hours"] * 0.28 + features["exercise"] * 1.8),
        0,
        10,
    )
    features["execution_gap"] = np.clip(features["goal_clarity"] - features["consistency"], -9, 9)
    features["momentum_score"] = np.clip(
        features["study_hours"] * 1.25
        + features["consistency"] * 1.4
        + features["goal_clarity"] * 1.35
        + features["exercise"] * 1.4
        - features["screen_time"] * 0.85
        - features["procrastination"] * 1.3,
        -10,
        35,
    )
    return features
