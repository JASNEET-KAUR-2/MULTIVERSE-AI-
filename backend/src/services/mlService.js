const mlApiUrl = process.env.ML_API_URL;

export const predictFutureOutcome = async (features) => {
  if (!mlApiUrl) {
    const error = new Error("ML_API_URL is missing.");
    error.status = 500;
    throw error;
  }

  const response = await fetch(`${mlApiUrl}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(features)
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.detail || "ML prediction failed.");
    error.status = 502;
    throw error;
  }

  return data;
};
