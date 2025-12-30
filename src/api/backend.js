import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
  clearAuthToken,
  setAuthToken,
} from './httpClient';
import {
  mockCourseById,
  mockCoursesByProject,
  mockCreateCoursePayment,
  mockLessonVideo,
  mockMe,
  mockMyCourses,
  mockProjects,
} from './mocks';

const USE_MOCKS = String(import.meta.env.VITE_USE_MOCKS ?? 'false').toLowerCase() === 'true';

const withMock = async (mockFactory, apiCall) => {
  if (USE_MOCKS) {
    return typeof mockFactory === 'function' ? mockFactory() : mockFactory;
  }

  return apiCall();
};

// Auth ------------------------------------------------------------

export const authWithTelegram = async (initData) => {
  const result = await apiPost(
    '/auth/telegram',
    { initData },
    {
      auth: false,
      headers: {
        // Pass raw init data in Authorization header per TMA recommendation.
        Authorization: `tma ${initData}`,
      },
    }
  );

  setAuthToken(result?.token);
  return result;
};

export const devLogin = async () => {
  const result = await apiPost(
    '/dev/login',
    {},
    {
      auth: false,
    }
  );

  setAuthToken(result?.token);
  return result;
};

export const logout = () => clearAuthToken();

// Users -----------------------------------------------------------

export const fetchMe = () => withMock(mockMe, () => apiGet('/me'));

// Projects / Courses ----------------------------------------------

export const fetchProjects = () => withMock(mockProjects, () => apiGet('/projects', { auth: false }));

export const fetchCourses = () => withMock(mockCoursesByProject, () => apiGet('/courses'));
export const fetchProjectCourses = (projectId) =>
  withMock(() => mockCoursesByProject(projectId), () =>
    apiGet(`/projects/${projectId}/courses`)
  );

export const fetchCourseById = (projectId, courseId) =>
  withMock(() => mockCourseById(projectId, courseId), () =>
    apiGet(`/projects/${projectId}/courses/${courseId}`)
  );

export const fetchMyCourses = () => withMock(mockMyCourses, () => apiGet('/my/courses'));

// Lessons ---------------------------------------------------------

export const fetchLessonVideo = (lessonId) =>
  withMock(() => mockLessonVideo(lessonId), () => apiGet(`/lessons/${lessonId}/video`));

// Payments --------------------------------------------------------

export const createCoursePayment = (courseId) =>
  withMock(
    () => mockCreateCoursePayment(courseId),
    () =>
      apiPost('/payments/course', {
        course_id: courseId,
      })
  );

// Tochka webhooks (dev/admin helpers) -----------------------------

export const setupTochkaWebhook = () => apiGet('/setup-webhook', { auth: false });

export const postTochkaWebhook = (payload) =>
  apiPost('/payments/webhook/tochka', payload, { auth: false });

// Expose low-level helpers for ad-hoc cases ----------------------

export const http = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
};

export const apiFeatures = {
  useMocks: USE_MOCKS,
};
