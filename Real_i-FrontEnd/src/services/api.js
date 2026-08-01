const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';


class ApiClient {
  constructor() {
    this.baseUrl = API_BASE;
  }

  async request(endpoint, options = {}, retries = 2, backoff = 1000) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = { 
      'Content-Type': 'application/json', 
      'ngrok-skip-browser-warning': 'true',
      ...options.headers 
    };
    const token = localStorage.getItem('reali_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

    const config = {
      ...options,
      headers,
      signal: controller.signal,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    if (config.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      if (response.status === 401) {
        localStorage.removeItem('reali_token');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        if (response.status >= 500 && retries > 0) {
          console.warn(`API Error ${response.status}. Retrying in ${backoff}ms...`);
          await new Promise(r => setTimeout(r, backoff));
          return this.request(endpoint, options, retries - 1, backoff * 2);
        }

        const errorData = await response.json().catch(() => ({}));
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail);
        } else if (errorData.signal) {
          errorMessage = `Signal: ${errorData.signal}`;
        }
        throw new Error(errorMessage);
      }
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. The server took too long to respond.', { cause: error });
      }
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        if (retries > 0) {
          console.warn(`Network Error. Retrying in ${backoff}ms...`);
          await new Promise(r => setTimeout(r, backoff));
          return this.request(endpoint, options, retries - 1, backoff * 2);
        }
        throw new Error('Network error: Unable to reach the server. Is the backend running?', { cause: error });
      }
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  upload(endpoint, file, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);

      xhr.open('POST', `${this.baseUrl}${endpoint}`);

      const token = localStorage.getItem('reali_token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.setRequestHeader('ngrok-skip-browser-warning', 'true');

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed: Network error'));
      xhr.send(formData);
    });
  }
}

export const api = new ApiClient();

// ══════════════════════════════════════════════════════════════
//  SERVICE FUNCTIONS
// ══════════════════════════════════════════════════════════════

// ── Health ───────────────────────────────────────────────────
export const healthCheck = () => api.get('/health');

// ── Data (Python AI Backend) ─────────────────────────────────
export const uploadFile = (projectId, file, onProgress) =>
  api.upload(`/data/upload/${projectId}`, file, onProgress);

export const processFiles = (projectId, options = {}) =>
  api.post(`/data/process/${projectId}`, {
    chunk_size: options.chunkSize || 100,
    overlap_size: options.overlapSize || 20,
    do_reset: options.doReset ? 1 : 0,
    file_id: options.fileId || null,
  });

// ── NLP (Python AI Backend) ──────────────────────────────────
export const pushToIndex = (projectId, doReset = false) =>
  api.post(`/nlp/index/push/${projectId}`, { do_reset: doReset ? 1 : 0 });

export const getIndexInfo = (projectId) =>
  api.get(`/nlp/index/info/${projectId}`);

export const searchIndex = (projectId, text, limit = 5) =>
  api.post(`/nlp/index/search/${projectId}`, { text, limit });

export const answerQuestion = (projectId, text, limit = 5) =>
  api.post(`/nlp/index/answer/${projectId}`, { text, limit });

// ── Agent (Python AI Backend) ────────────────────────────────
export const chatWithAgent = (projectId, message, sessionId = null) =>
  api.post(`/agent/chat/${projectId}`, { message, session_id: sessionId });

export const generateQuiz = (projectId, topic, numQuestions = 5) =>
  api.post(`/agent/quiz/${projectId}`, { topic, num_questions: numQuestions });

export const clearSession = (sessionId) =>
  api.delete(`/agent/session/${sessionId}`);

export const getActiveGuidelines = (projectId) =>
  api.get(`/agent/guidelines/active/${projectId}`);

export const getAssignedQuizzes = (projectId) =>
  api.get(`/agent/quizzes/${projectId}`);

export const submitQuizResult = (payload) =>
  api.post('/agent/quizzes/results', payload);

export const getCompletedQuizzes = (studentId) =>
  api.get(`/agent/quizzes/completed/${studentId}`);

// ── Admin AI (Python AI Backend) ─────────────────────────────
export const createTask = (request, sessionId = null) =>
  api.post('/admin/task/create', { request, session_id: sessionId });

export const adminHealthCheck = () =>
  api.get('/admin/health');

// ── Projects & Assets (Python AI Backend) ────────────────────
export const getProjects = () =>
  api.get('/data/projects');

export const deleteProject = (projectId) =>
  api.delete(`/data/projects/${projectId}`);

export const getAssets = () =>
  api.get('/data/assets');

export const deleteAsset = (assetId) =>
  api.delete(`/data/assets/${assetId}`);

// ── Guidelines (Python AI Backend) ───────────────────────────
export const getGuidelines = () =>
  api.get('/admin/guidelines');

export const saveGuideline = (guideline) =>
  api.post('/admin/guidelines', guideline);

export const toggleGuideline = (taskId) =>
  api.put(`/admin/guidelines/${taskId}/toggle`);

export const deleteGuideline = (taskId) =>
  api.delete(`/admin/guidelines/${taskId}`);

// ══════════════════════════════════════════════════════════════
//  NODE.JS BACKEND SERVICES
// ══════════════════════════════════════════════════════════════

// ── User Management (Node.js) ────────────────────────────────
export const getUsers = () =>
  api.get('/users');

export const getUser = (userId) =>
  api.get(`/users/${userId}`);

export const updateUserRole = (userId, role) =>
  api.put(`/users/${userId}/role`, { role });

export const updateUserProfile = (userId, data) =>
  api.put(`/users/${userId}/profile`, data);

export const getUserResults = (userId) =>
  api.get(`/users/${userId}/results`);

export const toggleLessonComplete = (userId, lessonId) =>
  api.post(`/users/${userId}/lessons/${lessonId}/toggle`);

export const deleteUser = (userId) =>
  api.delete(`/users/${userId}`);


// ── Courses (Node.js) ────────────────────────────────────────
export const getCourses = (params = {}) => {
  const query = new URLSearchParams();
  if (params.category) query.set('category', params.category);
  if (params.level) query.set('level', params.level);
  if (params.search) query.set('search', params.search);
  const qs = query.toString();
  return api.get(`/courses${qs ? `?${qs}` : ''}`);
};

export const getCourse = (courseId) =>
  api.get(`/courses/${courseId}`);

export const createCourse = (data) =>
  api.post('/courses', data);

export const updateCourse = (courseId, data) =>
  api.put(`/courses/${courseId}`, data);

export const deleteCourse = (courseId) =>
  api.delete(`/courses/${courseId}`);

export const enrollCourse = (courseId) =>
  api.post(`/courses/${courseId}/enroll`);

export const unenrollCourse = (courseId) =>
  api.delete(`/courses/${courseId}/enroll`);

// Admin Course Enrollment
export const adminEnrollStudent = (courseId, studentId) =>
  api.post(`/courses/${courseId}/enroll/${studentId}`);

export const adminUnenrollStudent = (courseId, studentId) =>
  api.delete(`/courses/${courseId}/enroll/${studentId}`);

export const getCourseStudents = (courseId) =>
  api.get(`/courses/${courseId}/students`);

export const getCourseStats = () =>
  api.get('/courses/stats');

export const getCourseCategories = () =>
  api.get('/courses/categories');

// ── Assessments (Node.js) ────────────────────────────────────
export const getAssessments = (params = {}) => {
  const query = new URLSearchParams();
  if (params.course_id) query.set('course_id', params.course_id);
  if (params.type) query.set('type', params.type);
  if (params.status) query.set('status', params.status);
  const qs = query.toString();
  return api.get(`/assessments${qs ? `?${qs}` : ''}`);
};

export const getAssessment = (id) =>
  api.get(`/assessments/${id}`);

export const createAssessment = (data) =>
  api.post('/assessments', data);

export const updateAssessment = (id, data) =>
  api.put(`/assessments/${id}`, data);

export const deleteAssessment = (id) =>
  api.delete(`/assessments/${id}`);

export const publishAssessment = (id) =>
  api.request(`/assessments/${id}/publish`, { method: 'PATCH' });

export const submitAssessment = (id, data) =>
  api.post(`/assessments/${id}/submit`, data);

export const getAssessmentSubmissions = (id) =>
  api.get(`/assessments/${id}/submissions`);

export const getMySubmissions = () =>
  api.get('/assessments/student/me');

export const gradeSubmission = (assessmentId, submissionId, data) =>
  api.request(`/assessments/${assessmentId}/submissions/${submissionId}/grade`, {
    method: 'PATCH',
    body: data,
  });

// ── Calendar Events (Node.js) ────────────────────────────────
export const getEvents = (params = {}) => {
  const query = new URLSearchParams();
  if (params.month) query.set('month', params.month);
  if (params.year) query.set('year', params.year);
  const qs = query.toString();
  return api.get(`/events${qs ? `?${qs}` : ''}`);
};

export const createEvent = (data) =>
  api.post('/events', data);

export const updateEvent = (id, data) =>
  api.put(`/events/${id}`, data);

export const deleteEvent = (id) =>
  api.delete(`/events/${id}`);

// ── Analytics (Node.js) ──────────────────────────────────────
export const getAnalyticsOverview = () =>
  api.get('/analytics/overview');

export const getStudentAnalytics = () =>
  api.get('/analytics/students');

export const getCourseAnalytics = (courseId) =>
  api.get(`/analytics/courses/${courseId}`);

