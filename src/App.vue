<script setup>
import { computed, onMounted, reactive } from 'vue';
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
} from './api';

const state = reactive({
  activeScreen: 'courses',
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

const formatPrice = (value) =>
  typeof value === 'number'
    ? new Intl.NumberFormat('ru-RU').format(value) + ' ₽'
    : '—';

const goTo = (screen) => {
  state.activeScreen = screen;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleDevLogin = async () =>
  run('auth', async () => {
    const res = await devLogin();
    state.token = res?.token || getAuthToken();
    state.status = 'Авторизован (dev)';
    await loadProfile();
  });

const handleLogout = () => {
  logout();
  state.token = null;
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
    goTo('course');
  });

const openMyCourses = async () => {
  if (!state.myCourses.length) {
    await run('myCourses', async () => {
      state.myCourses = await fetchMyCourses();
    });
  }
  goTo('my');
};

const startPayment = async () =>
  run('payment', async () => {
    if (!state.courseDetails) return;
    const res = await createCoursePayment(state.courseDetails.id);
    state.paymentUrl = res?.payment_url || '';
    state.status = 'Ссылка на оплату получена';
  });

const viewLesson = async (lesson) =>
  run('lesson', async () => {
    state.selectedLesson = lesson;
    const res = await fetchLessonVideo(lesson.id);
    state.lessonVideo = res?.video_url || '';
    goTo('lesson');
  });

const backToCourses = () => {
  state.courseDetails = null;
  state.selectedLesson = null;
  state.lessonVideo = '';
  state.paymentUrl = '';
  goTo('courses');
};

const backToLessons = () => {
  state.selectedLesson = null;
  state.lessonVideo = '';
  goTo('course');
};

const performTelegramAuth = async (initData) =>
  run('auth', async () => {
    const res = await authWithTelegram(initData);
    state.token = res?.token || getAuthToken();
    state.status = 'Авторизован через Telegram';
    await loadProfile();
  });

onMounted(async () => {
  if (state.token) {
    await loadProfile();
  }

  if (useMocks || state.token) {
    await loadCourses();
  }
});
</script>

<template>
  <div class="app">
    <header>
      <div class="logo">✏️</div>
      ПОПРАВОК — Курсы
    </header>

    <div class="screen active">
      <div class="card meta-card">
        <div class="meta-row">
          <b>API:</b> <span>{{ apiConfig.baseUrl }}</span>
        </div>
        <div class="meta-row">
          <b>Моки:</b>
          <span :class="useMocks ? 'pill pill-green' : 'pill pill-gray'">
            {{ useMocks ? 'включены (VITE_USE_MOCKS=true)' : 'выключены' }}
          </span>
        </div>
        <div class="meta-row">
          <b>Токен:</b> <span>{{ tokenPreview }}</span>
        </div>
        <div v-if="state.status" class="meta-row status">{{ state.status }}</div>
        <div v-if="state.error" class="meta-row error">⚠️ {{ state.error }}</div>
      </div>

      <div class="card">
        <div class="section-title">1. Авторизация</div>
        <div class="controls">
          <button class="btn btn-primary" :disabled="isLoading('auth')" @click="handleDevLogin">
            {{ isLoading('auth') ? 'Входим...' : 'Dev login (POST /dev/login)' }}
          </button>
          <button class="btn btn-ghost" @click="handleLogout">Сбросить токен</button>
        </div>
        <p class="hint">
          Для Telegram-инициализации вызовите
          <code>performTelegramAuth(initData)</code> из компонента с initData Mini App.
        </p>
      </div>

      <div class="card">
        <div class="section-title">2. Курсы</div>
        <div class="controls">
          <button class="btn btn-primary" :disabled="isLoading('courses')" @click="loadCourses">
            {{ isLoading('courses') ? 'Загружаем...' : 'Обновить список (GET /courses)' }}
          </button>
          <button class="btn btn-ghost" @click="openMyCourses">Мои курсы</button>
        </div>

        <div v-if="!state.courses.length" class="empty">Пока нет курсов</div>
        <div v-else class="cards">
          <div
            v-for="course in state.courses"
            :key="course.id"
            class="card course-card"
            @click="openCourse(course.id)"
          >
            <div class="course-head">
              <div class="course-title">{{ course.title }}</div>
              <div class="course-price">{{ formatPrice(course.price) }}</div>
            </div>
            <div class="course-desc">{{ course.description }}</div>
            <div class="course-meta">
              <span :class="course.is_purchased ? 'pill pill-green' : 'pill pill-gray'">
                {{ course.is_purchased ? 'Доступ открыт' : 'Не куплен' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="state.courseDetails" class="screen active">
        <div class="card">
          <div class="section-title">
            {{ state.courseDetails.title }}
          </div>
          <div class="course-desc">{{ state.courseDetails.description }}</div>
          <div class="course-meta">
            <span class="pill pill-blue">ID: {{ state.courseDetails.id }}</span>
            <span :class="state.courseDetails.is_purchased ? 'pill pill-green' : 'pill pill-gray'">
              {{ state.courseDetails.is_purchased ? 'Куплен' : 'Доступ платный' }}
            </span>
            <span class="pill pill-gray">{{ formatPrice(state.courseDetails.price) }}</span>
          </div>

          <div class="controls">
            <button
              class="btn btn-primary"
              :disabled="isLoading('payment')"
              @click="startPayment"
            >
              {{ isLoading('payment') ? 'Получаем ссылку...' : 'Оплатить (POST /payments/course)' }}
            </button>
            <button class="btn btn-ghost" @click="backToCourses">Назад к списку</button>
          </div>

          <div v-if="state.paymentUrl" class="notice">
            Ссылка на оплату:
            <a :href="state.paymentUrl" target="_blank" rel="noopener">{{ state.paymentUrl }}</a>
          </div>
        </div>

        <div class="card">
          <div class="section-title">Уроки</div>
          <div v-if="!state.courseDetails.lessons?.length" class="empty">
            У этого курса пока нет уроков
          </div>

          <div
            v-for="lesson in state.courseDetails.lessons"
            :key="lesson.id"
            class="lesson"
            :class="{ disabled: !lesson.has_video }"
            @click="lesson.has_video && viewLesson(lesson)"
          >
            <div class="lesson-icon">🎬</div>
            <div class="lesson-body">
              <div class="lesson-title">{{ lesson.title }}</div>
              <div class="lesson-desc">{{ lesson.description }}</div>
              <div class="lesson-meta">
                <span :class="lesson.has_video ? 'pill pill-green' : 'pill pill-gray'">
                  {{ lesson.has_video ? 'Видео доступно' : 'Нужно купить курс' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="state.selectedLesson" class="screen active">
        <div class="card">
          <div class="section-title">
            {{ state.selectedLesson.title }}
          </div>
          <div class="course-desc">{{ state.selectedLesson.description }}</div>

          <div class="video-box" v-if="state.lessonVideo">
            <iframe :src="state.lessonVideo" allowfullscreen></iframe>
          </div>
          <div v-else class="empty">Видео не загружено</div>

          <div class="controls">
            <button class="btn btn-ghost" @click="backToLessons">Назад к урокам</button>
          </div>
        </div>
      </div>

      <div v-if="state.activeScreen === 'my'" class="screen active">
        <div class="card">
          <div class="section-title">Мои курсы</div>
          <div v-if="!state.myCourses.length" class="empty">У вас пока нет купленных курсов</div>
          <div v-else class="cards">
            <div v-for="course in state.myCourses" :key="course.id" class="card course-card">
              <div class="course-head">
                <div class="course-title">{{ course.title }}</div>
                <span class="pill pill-green">Доступ открыт</span>
              </div>
              <div class="course-desc">Приобретен: {{ course.purchased_at || '—' }}</div>
            </div>
          </div>
          <div class="controls">
            <button class="btn btn-ghost" @click="backToCourses">Назад к списку</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  background: linear-gradient(145deg, #e8f1ff 0%, #d4e7ff 35%, #b7d7ff 70%, #9ac8ff 100%);
  background-attachment: fixed;
  -webkit-font-smoothing: antialiased;
  color: #0d1b2a;
}

.app {
  max-width: 960px;
  margin: 0 auto;
  min-height: 100vh;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 22px;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

header {
  padding: 16px;
  font-size: 22px;
  font-weight: 700;
  color: #0d1b2a;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.45);
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.logo {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(150deg, #5bb8ff, #007aff);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  color: white;
  font-weight: 900;
  box-shadow: 0 4px 14px rgba(0, 122, 255, 0.35), inset 0 0 8px rgba(255, 255, 255, 0.4);
}

.screen {
  flex: 1;
  padding: 18px;
  overflow-y: auto;
  animation: fadeIn 0.35s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.25);
  margin-bottom: 16px;
  transition: 0.25s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.meta-card .meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.meta-card .status {
  color: #0d1b2a;
}

.meta-card .error {
  color: #c0392b;
  font-weight: 600;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;
}

.controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  border: none;
  transition: 0.25s ease;
}

.btn-primary {
  background: #007aff;
  color: white;
  box-shadow: 0 6px 18px rgba(0, 122, 255, 0.35);
}

.btn-primary:active {
  transform: scale(0.97);
}

.btn-ghost {
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(0, 0, 0, 0.12);
  color: #0d1b2a;
  backdrop-filter: blur(20px);
}

.hint {
  margin-top: 10px;
  color: #4b5563;
  font-size: 14px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.course-card {
  cursor: pointer;
}

.course-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.course-title {
  font-weight: 700;
  font-size: 17px;
}

.course-price {
  font-weight: 600;
  color: #0d1b2a;
}

.course-desc {
  margin: 8px 0;
  color: #4b5563;
}

.course-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pill {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.pill-green {
  background: #e5f9e7;
  color: #0f9d58;
}

.pill-gray {
  background: #eef2f6;
  color: #374151;
}

.pill-blue {
  background: #e6f2ff;
  color: #0f4aaa;
}

.lesson {
  padding: 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(20px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
  margin-bottom: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: 0.25s ease;
}

.lesson:hover {
  transform: translateX(4px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.15);
}

.lesson.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.lesson-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.lesson-title {
  font-weight: 700;
}

.lesson-desc {
  color: #4b5563;
  margin: 4px 0;
}

.lesson-meta {
  display: flex;
  gap: 8px;
}

.video-box {
  width: 100%;
  height: 360px;
  border-radius: 20px;
  overflow: hidden;
  background: black;
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.25), inset 0 0 0 1px rgba(255, 255, 255, 0.15);
  margin: 12px 0;
}

.video-box iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.notice {
  margin-top: 10px;
  background: #f0f6ff;
  border: 1px solid #c9defe;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 14px;
}

.empty {
  color: #4b5563;
  font-size: 14px;
}

@media (max-width: 600px) {
  .app {
    border-radius: 0;
  }
}
</style>
