import dotenv from "dotenv";
dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  
  database: {
    url: process.env.DATABASE_URL,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || "kartik", // fallback for existing setup
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || "http://localhost:5173",
  },
};

// Validate required config
const requiredConfig = [
  "jwt.secret",
  "stripe.secretKey",
];

requiredConfig.forEach((key) => {
  const keys = key.split(".");
  let value = config;
  keys.forEach((k) => {
    value = value[k];
  });
  
  if (!value) {
    console.warn(`⚠️  Warning: ${key} is not set in environment variables`);
  }
});

export default config;
