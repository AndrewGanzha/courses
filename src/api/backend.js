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
  mockCourses,
  mockCreateCoursePayment,
  mockLessonVideo,
  mockMe,
  mockMyCourses,
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

// Courses ---------------------------------------------------------

export const fetchCourses = () => withMock(mockCourses, () => apiGet('/courses'));
export const fetchCourseById = (courseId) =>
  withMock(() => mockCourseById(courseId), () => apiGet(`/courses/${courseId}`));
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
