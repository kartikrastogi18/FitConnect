import api from "./axios";

export const authAPI = {
  signup: (data) => api.post("/auth/signup", data),
  login: (data) => api.post("/auth/login", data),
  verify: (data) => api.post("/auth/verify", data),
};

export const chatAPI = {
  getMyChats: () => api.get("/chats/my"),
  getChatDetails: (chatId) => api.get(`/chats/${chatId}`),
  createAIChat: () => api.post("/chats/ai"),
  createTrainerChat: (trainerId) => api.post("/chats/trainer", { trainerId }),
  completeChat: (chatId) => api.put(`/chats/${chatId}/complete`),
};

export const messageAPI = {
  getChatMessages: (chatId, params) => api.get(`/messages/${chatId}`, { params }),
  sendMessage: (data) => api.post("/messages/send", data),
};

export const trainerAPI = {
  // Public endpoint - gets all approved trainers
  getAllTrainers: (params) => api.get("/trainers", { params }),
  getTrainerProfile: (trainerId) => api.get(`/trainers/${trainerId}`),
  completeOnboarding: (data) => api.post("/trainer/onboard", data),
  getMyEarnings: () => api.get("/trainer/earnings"),
  getMyStats: () => api.get("/trainer/stats"),
};

// Backend trainee routes are mounted at "/" so paths are:
// POST /onboarding/trainee
// GET /trainers/search (this has issues with the query - use /trainers instead)
// GET /trainee/information
// GET /trainers/:trainerId
export const traineeAPI = {
  completeOnboarding: (data) => api.post("/onboarding/trainee", data),
  // Use the public trainers endpoint that works reliably
  searchTrainers: (params) => api.get("/trainers", { params }),
  getMyInfo: () => api.get("/trainee/information"),
  getTrainerProfile: (trainerId) => api.get(`/trainers/${trainerId}`),
};

export const paymentAPI = {
  createPayment: (chatId) => api.post("/payments/create", { chatId }),
  unlockChat: (chatId) => api.post("/payments/unlock", { chatId }),
  getMyPayments: () => api.get("/payments/my"),
  getPaymentStatus: (paymentId) => api.get(`/payments/${paymentId}`),
};

export const adminAPI = {
  getPendingTrainers: () => api.get("/admin/trainers/pending"),
  approveTrainer: (trainerId) => 
    api.put(`/admin/trainers/${trainerId}/status`, { status: "APPROVED" }),
  rejectTrainer: (trainerId) => 
    api.put(`/admin/trainers/${trainerId}/status`, { status: "REJECTED" }),
  getAllPayments: (params) => api.get("/admin/payments", { params }),
  releasePayment: (paymentId) => api.post(`/admin/payments/${paymentId}/release`),
  refundPayment: (paymentId) => api.post(`/admin/payments/${paymentId}/refund`),
  getTrainerEarnings: (trainerId) => api.get(`/admin/trainers/${trainerId}/earnings`),
  getPlatformStats: () => api.get("/admin/stats"),
};
