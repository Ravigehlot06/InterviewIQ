import { api } from "./api";

export const profileService = {
  get: () => api.get("/profile").then((r) => r.data),
  update: (payload) => api.put("/profile", payload).then((r) => r.data),
  completeOnboarding: () => api.post("/profile/onboarding-complete").then((r) => r.data),
  deleteAccount: () => api.delete("/profile/account").then((r) => r.data),
};

export const resumeService = {
  upload: (file) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post("/resumes", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },
  list: () => api.get("/resumes").then((r) => r.data),
  remove: (id) => api.delete(`/resumes/${id}`).then((r) => r.data),
};

export const catalogService = {
  roles: () => api.get("/roles").then((r) => r.data),
  companies: () => api.get("/companies").then((r) => r.data),
};

export const interviewService = {
  create: (payload) => api.post("/interviews", payload).then((r) => r.data),
  list: () => api.get("/interviews").then((r) => r.data),
  get: (id) => api.get(`/interviews/${id}`).then((r) => r.data),
  answer: (id, payload) => api.post(`/interviews/${id}/answer`, payload).then((r) => r.data),
  nextQuestion: (id) => api.post(`/interviews/${id}/next-question`).then((r) => r.data),
  complete: (id) => api.post(`/interviews/${id}/complete`).then((r) => r.data),
};

export const reportService = {
  get: (interviewId) => api.get(`/reports/${interviewId}`).then((r) => r.data),
};

export const dashboardService = {
  get: () => api.get("/dashboard").then((r) => r.data),
  history: () => api.get("/history").then((r) => r.data),
};
