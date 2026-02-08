import { ValidationError } from "./errors.js";

// Email Validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password Validation (min 6 chars)
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Required Fields Validation
export const validateRequired = (fields, data) => {
  const missing = [];
  
  fields.forEach((field) => {
    if (!data[field]) {
      missing.push(field);
    }
  });
  
  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(", ")}`);
  }
};

// Enum Validation
export const validateEnum = (value, enumObj, fieldName) => {
  const validValues = Object.values(enumObj);
  if (!validValues.includes(value)) {
    throw new ValidationError(
      `Invalid ${fieldName}. Must be one of: ${validValues.join(", ")}`
    );
  }
};

// Positive Number Validation
export const isPositiveNumber = (value) => {
  return typeof value === "number" && value > 0;
};

// Sanitize String (basic XSS prevention)
export const sanitizeString = (str) => {
  if (typeof str !== "string") return str;
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};
