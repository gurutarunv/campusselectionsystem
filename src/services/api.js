// ==========================================================
// Centralized REST API Client: Campus Placement Assistance
// Base API: /api/v1 with Bearer JWT interceptor & multipart support
// ==========================================================

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type') || '';
    
    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}`;
      if (contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMsg = errorData?.message || errorData?.error || errorMsg;
      } else {
        const textData = await response.text();
        if (textData) errorMsg = textData;
      }
      throw new Error(errorMsg);
    }

    if (contentType.includes('application/json')) {
      return await response.json();
    }
    return response;
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      const netErr = new Error(`Cannot connect to backend server at ${API_BASE_URL}.`);
      netErr.isNetworkError = true;
      netErr.originalMessage = error.message;
      console.warn(`[API] Network error connecting to ${endpoint}:`, error.message);
      throw netErr;
    }
    console.warn(`[API] Request to ${endpoint} failed:`, error.message);
    throw error;
  }
}

// 1. Authentication Services
export const authApi = {
  login: (email, password) => 
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  registerStudent: (data) => {
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      return request('/auth/register/student', {
        method: 'POST',
        body: data
      });
    }
    return request('/auth/register/student', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  registerCompany: (data) =>
    request('/auth/register/company', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getMe: () => request('/auth/me')
};

// 2. Student & Resume Services
export const studentApi = {
  getProfile: () => request('/students/me'),
  updateProfile: (profileData) => 
    request('/students/me', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }),
  getMyApplications: () => request('/students/me/applications'),
  
  // PDF Resume upload & management
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/students/resume', {
      method: 'POST',
      body: formData
    });
  },
  deleteResume: () => 
    request('/students/resume', {
      method: 'DELETE'
    }),
  getResumeResourceBlob: async (path = '/students/resume/download') => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to download resume (HTTP ${response.status})`);
    }
    return await response.blob();
  },
  getResumeDownloadUrl: () => `${API_BASE_URL}/students/resume/download`,
  getResumePreviewUrl: () => `${API_BASE_URL}/students/resume/preview`,
  getCandidateProfile: (userId) => request(`/students/${userId}`),
  getCandidateResumeDownloadUrl: (userId) => `${API_BASE_URL}/students/${userId}/resume/download`,
  getCandidateResumePreviewUrl: (userId) => `${API_BASE_URL}/students/${userId}/resume/preview`
};

// 3. Job Services
export const jobsApi = {
  getJobs: (stream, search) => {
    const params = new URLSearchParams();
    if (stream) params.append('stream', stream);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/jobs${query}`);
  },

  getJobById: (id) => request(`/jobs/${id}`),

  createJob: (jobData) => 
    request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    }),

  updateJob: (id, jobData) =>
    request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData)
    }),

  updateJobStatus: (id, status) =>
    request(`/jobs/${id}/status?status=${status}`, {
      method: 'PATCH'
    }),

  getMyPostedJobs: () => request('/jobs/recruiter/my-jobs')
};

// 4. Application Services
export const applicationsApi = {
  applyForJob: (jobId, coverNote = '') =>
    request(`/applications/jobs/${jobId}`, {
      method: 'POST',
      body: JSON.stringify({ coverNote })
    }),

  getJobApplications: (jobId) => request(`/applications/jobs/${jobId}`),

  getRecruiterPipeline: () => request('/applications/recruiter/my-pipeline'),

  updateStatus: (id, status, comments = '') =>
    request(`/applications/${id}/status?status=${status}&comments=${encodeURIComponent(comments)}`, {
      method: 'PATCH'
    }),

  withdraw: (id) =>
    request(`/applications/${id}/withdraw`, {
      method: 'POST'
    })
};

// 5. Interview Services
export const interviewsApi = {
  scheduleInterview: (scheduleData) =>
    request('/interviews', {
      method: 'POST',
      body: JSON.stringify(scheduleData)
    }),

  getMySchedule: () => request('/interviews/my-schedule'),

  getRecruiterInterviews: () => request('/interviews/recruiter/my-interviews'),

  updateFeedback: (id, feedbackNotes) =>
    request(`/interviews/${id}/feedback?feedbackNotes=${encodeURIComponent(feedbackNotes)}`, {
      method: 'PATCH'
    })
};

// 6. Admin & Governance Services
export const adminApi = {
  getDashboardStats: () => request('/admin/dashboard'),
  getCompanies: (verified) => {
    const query = verified !== undefined ? `?verified=${verified}` : '';
    return request(`/admin/companies${query}`);
  },
  verifyCompany: (id, verified) =>
    request(`/admin/companies/${id}/verify?verified=${verified}`, {
      method: 'PATCH'
    }),
  getAllStudents: () => request('/admin/students'),
  getAuditLogs: () => request('/admin/audit-logs')
};

// 7. Notification Services
export const notificationsApi = {
  getMyNotifications: () => request('/notifications'),
  markAsRead: (id) =>
    request(`/notifications/${id}/read`, {
      method: 'PATCH'
    })
};
