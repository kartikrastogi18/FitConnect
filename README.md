# 🏋️‍♂️ FitConnect – AI & Trainer Fitness Platform
### FitConnect is a full-stack fitness platform that connects trainees, certified trainers, and an AI fitness coach in one seamless experience.
Users can chat with trainers, get instant AI advice, and unlock premium chats using Stripe demo payments.
## ✨ Features
### 👤 Authentication
Email signup with OTP verification

Secure JWT-based authentication

Role-based access (Trainee / Trainer / Admin)
### 🤖 AI Fitness Coach
Free AI chat for instant fitness guidance

Context-aware replies

Optimized for low-memory environments
### 🧑‍🏫 Trainer Chat System
Browse approved trainers

Request trainer chat

Trainer approval flow

Real-time messaging using Socket.IO
### 💬 Real-Time Chat
REST API for sending messages (safe & reliable)

Socket.IO for receiving messages

Room-based socket architecture (user_<id>)
### 💳 Payments (Demo)
Stripe test mode integration

Unlock trainer chat after successful payment

Payment status tracking (HELD / RELEASED)
### 📊 Dashboards
Trainee dashboard (AI chat, trainers, payments)

Trainer dashboard (pending & active chats)

Admin dashboard (trainer approval)
## 🛠️ Tech Stack
### Frontend
React + Vite

Tailwind CSS

Axios

Socket.IO Client

Deployed on Vercel
### Backend
Node.js + Express

PostgreSQL

Sequelize ORM

JWT Authentication

Nodemailer (Gmail App Password)

Stripe (Test Mode)

Socket.IO

Deployed on Render
### 🧠 Architecture Decisions
Messages via REST, sockets only for listening (prevents duplication)

Async email sending to avoid signup delay

Payment-based chat unlock

Role & ownership checks on every chat/message

Production-safe CORS configuration
### 🐞 Known Limitations
Render free tier cold starts

Gmail requires App Password (not regular password)

Stripe is in test mode only
