// ==========================================================
// Centralized REST API Client: Campus Placement Assistance
// Base API: /api/v1 with Bearer JWT interceptor & offline fallback
// ==========================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
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
    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `HTTP Error ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    // If backend server is unreachable or offline, rethrow with clear identifier
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

  registerStudent: (data) =>
    request('/auth/register/student', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  registerCompany: (data) =>
    request('/auth/register/company', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getMe: () => request('/auth/me')
};

// 2. Student Services
export const studentApi = {
  getProfile: () => request('/students/me'),
  updateProfile: (profileData) => 
    request('/students/me', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }),
  getMyApplications: () => request('/students/me/applications')
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
