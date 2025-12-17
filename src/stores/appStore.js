import { computed, reactive } from 'vue';
import { defineStore } from 'pinia';
import {
  apiConfig,
  apiFeatures,
  authWithTelegram,
  createCoursePayment,
  devLogin,
  fetchCourseById,
  fetchCourses,
  fetchLessonVideo,
  fetchMe,
  fetchMyCourses,
  getAuthToken,
  logout,
} from '../api';

export const useAppStore = defineStore('app', () => {
  const state = reactive({
    loading: {},
    error: '',
    status: '',

    token: getAuthToken(),
    user: null,
    courses: [],
    courseDetails: null,
    myCourses: [],

    selectedLesson: null,
    lessonVideo: '',
    paymentUrl: '',
  });

  const useMocks = apiFeatures?.useMocks ?? false;
  const tokenPreview = computed(() => (state.token ? `${state.token.slice(0, 10)}...` : 'нет'));
  const isLoading = (key) => !!state.loading[key];

  const setError = (err) => {
    const msg = err?.message || 'Что-то пошло не так';
    state.error = msg;
    console.error(err);
  };

  const run = async (key, fn) => {
    state.loading[key] = true;
    state.error = '';
    try {
      return await fn();
    } catch (err) {
      setError(err);
      return null;
    } finally {
      state.loading[key] = false;
    }
  };

  const setToken = (token) => {
    state.token = token;
  };

  const init = async () => {
    if (state.token) {
      await loadProfile();
    }

    if (useMocks || state.token) {
      await loadCourses();
    }
  };

  const handleDevLogin = async () =>
    run('auth', async () => {
      const res = await devLogin();
      setToken(res?.token || getAuthToken());
      state.status = 'Авторизован (dev)';
      await loadProfile();
      await loadCourses();
    });

  const performTelegramAuth = async (initData) =>
    run('auth', async () => {
      const res = await authWithTelegram(initData);
      setToken(res?.token || getAuthToken());
      state.status = 'Авторизован через Telegram';
      await loadProfile();
      await loadCourses();
    });

  const clearAuth = () => {
    logout();
    setToken(null);
    state.user = null;
    state.myCourses = [];
    state.status = 'Токен очищен';
  };

  const loadProfile = async () =>
    run('me', async () => {
      const me = await fetchMe();
      state.user = me;
      state.myCourses = me?.courses || [];
      state.status = 'Профиль загружен';
    });

  const loadCourses = async () =>
    run('courses', async () => {
      state.courses = await fetchCourses();
      state.status = 'Курсы обновлены';
    });

  const openCourse = async (courseId) =>
    run('course', async () => {
      state.courseDetails = await fetchCourseById(courseId);
      state.paymentUrl = '';
      state.selectedLesson = null;
      state.lessonVideo = '';
      state.status = 'Данные курса загружены';
      return state.courseDetails;
    });

  const ensureCourseLoaded = async (courseId) => {
    const id = Number(courseId);
    if (!state.courseDetails || Number(state.courseDetails.id) !== id) {
      await openCourse(id);
    }
  };

  const loadMyCourses = async () =>
    run('myCourses', async () => {
      state.myCourses = await fetchMyCourses();
      state.status = 'Мои курсы обновлены';
    });

  const startPayment = async () =>
    run('payment', async () => {
      if (!state.courseDetails) return;
      const res = await createCoursePayment(state.courseDetails.id);
      state.paymentUrl = res?.payment_url || '';
      state.status = 'Ссылка на оплату получена';
    });

  const openLesson = async (courseId, lessonId) =>
    run('lesson', async () => {
      await ensureCourseLoaded(courseId);
      const lesson =
        state.courseDetails?.lessons?.find((l) => String(l.id) === String(lessonId)) || null;
      state.selectedLesson = lesson;
      const res = await fetchLessonVideo(lessonId);
      state.lessonVideo = res?.video_url || '';
      state.status = 'Видео урока загружено';
      return lesson;
    });

  return {
    state,
    useMocks,
    apiConfig,
    tokenPreview,
    isLoading,
    init,
    handleDevLogin,
    performTelegramAuth,
    clearAuth,
    loadCourses,
    loadMyCourses,
    openCourse,
    startPayment,
    openLesson,
  };
});
