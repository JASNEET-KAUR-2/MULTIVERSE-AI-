const buildUrl = (url) => url;

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const raw = await response.text();

  let data = raw;

  if (raw && isJson) {
    data = JSON.parse(raw);
  }

  if (!response.ok) {
    const message = typeof data === "object" && data?.detail ? data.detail : "Request failed.";
    throw new Error(message);
  }

  return { data };
};

const axios = {
  async post(url, payload, config = {}) {
    const response = await fetch(buildUrl(url), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.headers || {})
      },
      body: JSON.stringify(payload)
    });

    return parseResponse(response);
  }
};

export default axios;
