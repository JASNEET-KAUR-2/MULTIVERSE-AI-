export const sanitizeText = (value = "") => value.trim().replace(/\s+/g, " ");

export const ensureLength = (value, label, { min = 1, max = 120 } = {}) => {
  const normalized = sanitizeText(value);

  if (normalized.length < min || normalized.length > max) {
    const error = new Error(`${label} must be between ${min} and ${max} characters.`);
    error.status = 400;
    throw error;
  }

  return normalized;
};

export const ensureEmail = (value = "") => {
  const normalized = sanitizeText(value).toLowerCase();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);

  if (!isValid) {
    const error = new Error("A valid email address is required.");
    error.status = 400;
    throw error;
  }

  return normalized;
};

export const ensurePassword = (value = "") => {
  if (typeof value !== "string" || value.length < 6) {
    const error = new Error("Password must be at least 6 characters long.");
    error.status = 400;
    throw error;
  }

  return value;
};

export const ensureStringArray = (items = [], label, { maxItems = 8, maxLength = 40 } = {}) => {
  if (!Array.isArray(items)) {
    const error = new Error(`${label} must be an array.`);
    error.status = 400;
    throw error;
  }

  return items
    .map((item) => sanitizeText(String(item || "")))
    .filter(Boolean)
    .slice(0, maxItems)
    .map((item) => {
      if (item.length > maxLength) {
        const error = new Error(`${label} items must be at most ${maxLength} characters.`);
        error.status = 400;
        throw error;
      }

      return item;
    });
};
