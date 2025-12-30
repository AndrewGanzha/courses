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
  fetchProjectCourses,
  fetchProjects,
  getAuthToken,
  logout,
} from '../api';
import { retrieveRawInitData, serializeInitDataQuery } from '@tma.js/sdk-vue';

export const useAppStore = defineStore('app', () => {
  const state = reactive({
    loading: {},
    error: '',
    status: '',

    token: getAuthToken(),
    telegramInitData: '',
    telegramReady: false,
    user: null,
    projects: [],
    courses: [],
    projectCourses: {},
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

  const readTelegramInitData = () => {
    if (typeof window === 'undefined') return '';
    const clean = (value) => (typeof value === 'string' ? value.trim() : '');

    // 1) Preferred: raw init data string from SDK (already serialized by Telegram)
    try {
      const raw = retrieveRawInitData();
      if (raw) return clean(raw);
    } catch (err) {
      console.warn('retrieveRawInitData failed, fallback to Telegram.WebApp', err);
    }

    const webApp = window.Telegram?.WebApp;

    // 2) Fallback: WebApp.initData (already serialized by Telegram)
    if (webApp?.initData) {
      return clean(webApp.initData);
    }

    // 3) Fallback: serialize initDataUnsafe object to query string compatible with Telegram signature
    if (webApp?.initDataUnsafe) {
      try {
        return clean(serializeInitDataQuery(webApp.initDataUnsafe));
      } catch (err) {
        console.warn('serializeInitDataQuery failed', err);
      }
    }

    return '';
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
    state.telegramInitData = readTelegramInitData();
    state.telegramReady = !!(state.telegramInitData || window.Telegram?.WebApp);

    await loadProjects();

    if (state.token) {
      await loadProfile();
      await loadAllCourses();
      return;
    }

    if (state.telegramInitData) {
      await performTelegramAuth(state.telegramInitData);
      return;
    }

    if (useMocks) {
      await loadAllCourses();
    }
  };

  const handleDevLogin = async () =>
    run('auth', async () => {
      const res = await devLogin();
      setToken(res?.token || getAuthToken());
      state.status = 'Авторизован';
      await loadProfile();
      await loadAllCourses();
    });

  const performTelegramAuth = async (initData) =>
    run('auth', async () => {
      const payload = initData || state.telegramInitData || readTelegramInitData();
      if (!payload) {
        throw new Error('Авторизация доступна только внутри Telegram mini app.');
      }

      // Перед телеграм-авторизацией сбрасываем старый токен, чтобы гарантированно получить новый
      logout();
      setToken(null);

      if (typeof window !== 'undefined') {
        window.alert(`Отправляем в /auth/telegram:\n\n${payload}`);
      }

      state.telegramInitData = payload;
      state.telegramReady = true;

      const res = await authWithTelegram(payload);
      setToken(res?.token || getAuthToken());
      state.status = 'Авторизован через Telegram';
      await loadProfile();
      await loadAllCourses();
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

  const loadProjects = async () =>
    run('projects', async () => {
      state.projects = await fetchProjects();
      state.status = 'Проекты обновлены';
    });

  const loadAllCourses = async () =>
    run('courses', async () => {
      state.courses = await fetchCourses();
      state.status = 'Курсы обновлены';
    });

  const loadProjectCourses = async (projectId) =>
    run(`project-${projectId}-courses`, async () => {
      const courses = await fetchProjectCourses(projectId);
      state.projectCourses[projectId] = courses;
      state.status = 'Курсы проекта обновлены';
      return courses;
    });

  const openCourse = async (projectId, courseId) =>
    run('course', async () => {
      state.courseDetails = await fetchCourseById(projectId, courseId);
      state.paymentUrl = '';
      state.selectedLesson = null;
      state.lessonVideo = '';
      state.status = 'Данные курса загружены';
      return state.courseDetails;
    });

  const ensureCourseLoaded = async (projectId, courseId) => {
    const id = Number(courseId);
    if (
      !state.courseDetails ||
      Number(state.courseDetails.id) !== id ||
      Number(state.courseDetails.project_id) !== Number(projectId)
    ) {
      await openCourse(projectId, id);
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

  const openLesson = async (projectId, courseId, lessonId) =>
    run('lesson', async () => {
      await ensureCourseLoaded(projectId, courseId);
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
    loadProjects,
    loadAllCourses,
    loadProjectCourses,
    loadMyCourses,
    openCourse,
    startPayment,
    openLesson,
  };
});
