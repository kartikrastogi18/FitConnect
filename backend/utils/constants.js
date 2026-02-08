// User Roles
export const ROLES = {
  TRAINEE: "trainee",
  TRAINER: "trainer",
  ADMIN: "admin",
};

// User Status
export const USER_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  SUSPENDED: "SUSPENDED",
  REJECTED: "REJECTED",
};

// Chat Types
export const CHAT_TYPE = {
  AI: "AI",
  TRAINER: "TRAINER",
};

// Chat Status
export const CHAT_STATUS = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

// Payment Status
export const PAYMENT_STATUS = {
  CREATED: "CREATED",
  HELD: "HELD",
  RELEASED: "RELEASED",
  REFUNDED: "REFUNDED",
  FAILED: "FAILED",
};

// Message Sender Roles
export const MESSAGE_SENDER = {
  TRAINEE: "trainee",
  TRAINER: "trainer",
  AI: "ai",
  SYSTEM: "system",
};

// Payment Amounts (in paise/cents)
export const PAYMENT_AMOUNTS = {
  TRAINER_CHAT_PRICE: 19900, // ₹199
  PLATFORM_FEE_PERCENT: 10, // 10% platform fee
};

// BMI Categories
export const BMI_CATEGORY = {
  UNDERWEIGHT: "underweight",
  NORMAL: "normal",
  OVERWEIGHT: "overweight",
  OBESE: "obese",
};

// Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// AI Chat
export const AI_CHAT = {
  MAX_CONTEXT_MESSAGES: 10,
  SYSTEM_PROMPT: "You are a fitness coach. Answer in 3–4 lines.",
};
