import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Get user profile
  getProfile: async (userId) => {
    const response = await api.get(`/auth/profile/${userId}`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (userId, profileData) => {
    const response = await api.put(`/auth/profile/${userId}`, profileData);
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },
};

// Education API calls
export const educationAPI = {
  save: async (userId, education) => {
    const response = await api.post("/education", {
      user_id: userId,
      education: education,
    });
    return response.data;
  },

  get: async (userId) => {
    const response = await api.get(`/education/${userId}`);
    return response.data;
  },
};

// Upload API calls
export const uploadAPI = {
  uploadFiles: async (userId, files, fileType, onProgress) => {
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("file_type", fileType);
    files.forEach((file) => formData.append("files", file));

    const response = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress,
    });
    return response.data;
  },

  listDocuments: async (userId) => {
    const response = await api.get(`/upload/list/${userId}`);
    return response.data;
  },

  deleteDocument: async (documentId, userId) => {
    const response = await api.delete(`/upload/${documentId}/${userId}`);
    return response.data;
  },

  // Get stream URL for document preview
  getDocumentUrl: (mongoFileId) => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
    return `${baseUrl}/upload/${mongoFileId}`;
  },
};

// Job Description API calls
export const jobDescriptionAPI = {
  save: async (userId, description) => {
    const response = await api.post("/job-description", {
      user_id: userId,
      description: description,
    });
    return response.data;
  },

  get: async (userId) => {
    const response = await api.get(`/job-description/${userId}`);
    return response.data;
  },
};

// Resume API calls
export const resumeAPI = {
  // Process documents and generate resume via LLM
  process: async (userId, selectedDocIds = null) => {
    const payload = { user_id: userId };
    if (selectedDocIds && selectedDocIds.length > 0) {
      payload.selected_doc_ids = selectedDocIds;
    }
    const response = await api.post("/upload/process", payload);
    return response.data;
  },

  // Get all resumes for a user
  getAll: async (userId) => {
    const response = await api.get(`/resume/${userId}`);
    return response.data;
  },

  // Get the latest resume
  getLatest: async (userId) => {
    const response = await api.get(`/resume/latest/${userId}`);
    return response.data;
  },

  // Get a specific resume by ID
  getById: async (resumeId) => {
    const response = await api.get(`/resume/single/${resumeId}`);
    return response.data;
  },

  // Save or update a resume
  save: async (resumeData) => {
    const response = await api.post("/resume/save", resumeData);
    return response.data;
  },

  // Regenerate resume with user feedback prompt
  regenerate: async (userId, resumeId, currentResume, userPrompt) => {
    const response = await api.post("/resume/regenerate", {
      user_id: userId,
      resume_id: resumeId,
      current_resume: currentResume,
      user_prompt: userPrompt,
    });
    return response.data;
  },

  // Export resume as PDF
  exportPdf: async (html, fileName) => {
    const response = await api.post(
      "/export-pdf",
      { html, fileName },
      { responseType: "blob" },
    );
    return response.data;
  },

  // Delete a resume
  delete: async (resumeId) => {
    const response = await api.delete(`/resume/${resumeId}`);
    return response.data;
  },

  // Analyze resume for ATS compatibility
  analyzeATS: async (resumeId, resumeData, jobDescription = null) => {
    const response = await api.post("/resume/analyze-ats", {
      resume_id: resumeId,
      resume_data: resumeData,
      job_description: jobDescription,
    });
    return response.data;
  },
};

export default api;
