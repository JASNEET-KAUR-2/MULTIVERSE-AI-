const mlApiUrl = process.env.ML_API_URL;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const round = (value, digits = 4) => Number(value.toFixed(digits));

const normalizeProbabilities = (probabilities) => {
  const total = Object.values(probabilities).reduce((sum, value) => sum + value, 0) || 1;

  return Object.fromEntries(
    Object.entries(probabilities).map(([label, value]) => [label, round(value / total)])
  );
};

const buildLocalPrediction = (features) => {
  const score = clamp(
    50 +
      (Number(features.study_hours || 0) - 4) * 4 +
      (Number(features.sleep_hours || 0) - 7) * 3 +
      (Number(features.exercise || 0) ? 6 : -2) +
      (Number(features.consistency || 0) - 5) * 5 +
      (Number(features.goal_clarity || 0) - 5) * 4 -
      (Number(features.screen_time || 0) - 4) * 2.5 -
      (Number(features.procrastination || 0) - 5) * 5,
    1,
    99
  );

  const high = clamp((score - 42) / 58, 0.05, 0.9);
  const negative = clamp((58 - score) / 58, 0.05, 0.9);
  const average = clamp(1 - Math.max(high, negative) - Math.min(high, negative) * 0.55, 0.05, 0.9);
  const probabilities = normalizeProbabilities({
    High: high,
    Average: average,
    Negative: negative
  });

  const confidence = Math.max(probabilities.High, probabilities.Average, probabilities.Negative);
  const prediction =
    confidence === probabilities.High
      ? "High"
      : confidence === probabilities.Average
        ? "Average"
        : "Negative";

  return {
    prediction,
    probabilities,
    confidence: round(confidence),
    model_name: "local-heuristic-fallback"
  };
};

const shouldFallbackToLocalPrediction = (error) => {
  const message = String(error?.message || "");
  return (
    !mlApiUrl ||
    error?.name === "AbortError" ||
    /fetch failed|econnrefused|enotfound|timed out|timeout|network/i.test(message) ||
    Number(error?.status || 0) >= 500
  );
};

export const predictFutureOutcome = async (features) => {
  if (!mlApiUrl) {
    return buildLocalPrediction(features);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);

  try {
    const response = await fetch(`${mlApiUrl}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(features),
      signal: controller.signal
    });

    const rawBody = await response.text();
    let data = {};

    if (rawBody) {
      try {
        data = JSON.parse(rawBody);
      } catch {
        if (!response.ok) {
          const error = new Error("ML service returned an invalid response.");
          error.status = response.status;
          throw error;
        }
      }
    }

    if (!response.ok) {
      const error = new Error(data.detail || "ML prediction failed.");
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    if (shouldFallbackToLocalPrediction(error)) {
      console.warn(`[mlService] Falling back to local predictor: ${error.message || "unknown error"}`);
      return buildLocalPrediction(features);
    }

    error.status = error.status || 502;
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};
