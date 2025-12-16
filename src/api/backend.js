import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
  clearAuthToken,
  setAuthToken,
} from './httpClient';

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

export const fetchMe = () => apiGet('/me');

// Courses ---------------------------------------------------------

export const fetchCourses = () => apiGet('/courses');
export const fetchCourseById = (courseId) => apiGet(`/courses/${courseId}`);
export const fetchMyCourses = () => apiGet('/my/courses');

// Lessons ---------------------------------------------------------

export const fetchLessonVideo = (lessonId) => apiGet(`/lessons/${lessonId}/video`);

// Payments --------------------------------------------------------

export const createCoursePayment = (courseId) =>
  apiPost('/payments/course', {
    course_id: courseId,
  });

// Expose low-level helpers for ad-hoc cases ----------------------

export const http = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
};
