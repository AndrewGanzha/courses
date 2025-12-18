<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { useAppStore } from './stores/appStore';

const store = useAppStore();
const route = useRoute();
const showAuthModal = ref(false);

const navItems = [
  { to: '/', label: 'Проекты' },
  { to: '/my', label: 'Мои курсы' },
];

const navClass = (to) => (route.path === to ? 'nav-link active' : 'nav-link');

const openAuth = () => {
  showAuthModal.value = true;
};

const closeAuth = () => {
  showAuthModal.value = false;
};

const loginAndClose = async () => {
  await store.handleDevLogin();
  if (!store.state.error) {
    closeAuth();
  }
};

onMounted(() => {
  store.init();
});
</script>

<template>
  <div class="app">
    <header>
      <nav>
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" :class="navClass(item.to)">
          {{ item.label }}
        </RouterLink>
      </nav>
      <div class="user-actions">
        <div v-if="store.state.user" class="user-pill">
          {{ store.state.user.first_name || store.state.user.username || 'Пользователь' }}
        </div>
        <button v-else class="btn btn-ghost btn-small" :disabled="store.isLoading('auth')" @click="openAuth">
          {{ store.isLoading('auth') ? 'Входим...' : 'Войти' }}
        </button>
      </div>
    </header>

    <div class="screen">
      <div v-if="store.state.error" class="alert alert-error">
        {{ store.state.error }}
      </div>

      <RouterView />
    </div>

    <div v-if="showAuthModal" class="modal" @click.self="closeAuth">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-title">Вход</div>
          <button class="modal-close" @click="closeAuth">×</button>
        </div>
        <div class="modal-body">
          <p class="modal-text">
            Войдите, чтобы видеть свои курсы и оплачивать новые. Для теста используйте быструю авторизацию.
          </p>
          <div class="controls">
            <button class="btn btn-primary" :disabled="store.isLoading('auth')" @click="loginAndClose">
              {{ store.isLoading('auth') ? 'Входим...' : 'Быстрый вход' }}
            </button>
            <button class="btn btn-ghost" @click="closeAuth">Отмена</button>
          </div>
          <p class="hint">
            В продакшене вызовите <code>performTelegramAuth(initData)</code> из мини-аппа, чтобы получить токен.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: 'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif;
  background: var(--gradient-bg);
  background-attachment: fixed;
  -webkit-font-smoothing: antialiased;
  color: var(--color-text-primary);
}

.app {
  max-width: 1100px;
  margin: 0 auto;
  min-height: 100vh;
  background: linear-gradient(145deg, rgba(28, 12, 52, 0.72), rgba(18, 12, 37, 0.86));
  border: 1px solid rgba(205, 186, 255, 0.15);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45), 0 0 60px var(--color-glow);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 22px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

header {
  padding: 16px;
  background: linear-gradient(135deg, rgba(18, 12, 37, 0.85), rgba(18, 12, 37, 0.65));
  border-bottom: 1px solid rgba(205, 186, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.35);
}

nav {
  display: flex;
  gap: 10px;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-pill {
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(205, 186, 255, 0.12);
  border: 1px solid rgba(205, 186, 255, 0.25);
  color: var(--color-text-primary);
  font-weight: 700;
}

.nav-link {
  color: var(--color-text-primary);
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(205, 186, 255, 0.12);
  border: 1px solid rgba(205, 186, 255, 0.25);
  transition: 0.25s ease;
}

.nav-link:hover {
  border-color: rgba(205, 186, 255, 0.5);
}

.nav-link.active {
  background: var(--color-accent);
  color: #0b0617;
  border-color: var(--color-accent);
  box-shadow: 0 8px 24px var(--color-glow);
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
  background: radial-gradient(
    circle at 10% 10%,
    rgba(205, 186, 255, 0.08),
    rgba(18, 12, 37, 0.9)
  );
  border: 1px solid rgba(205, 186, 255, 0.18);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.32), inset 0 1px 0 rgba(205, 186, 255, 0.25);
  margin-bottom: 16px;
  transition: 0.25s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4), 0 0 22px var(--color-glow);
}

.meta-card .meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  color: var(--color-text-secondary);
}

.meta-card .meta-row b {
  color: var(--color-text-primary);
}

.meta-card .status {
  color: var(--color-text-primary);
}

.meta-card .error {
  color: #f76b8a;
  font-weight: 600;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;
  color: var(--color-text-primary);
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
  color: var(--color-text-primary);
}

.btn-small {
  padding: 8px 12px;
}

.btn-primary {
  background: var(--gradient-stroke);
  color: #0b0617;
  box-shadow: 0 10px 28px var(--color-glow);
}

.btn-primary:active {
  transform: scale(0.97);
}

.btn-ghost {
  background: rgba(205, 186, 255, 0.08);
  border: 1px solid rgba(205, 186, 255, 0.22);
  color: var(--color-text-primary);
}

.hint {
  margin-top: 10px;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
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
  color: var(--color-text-primary);
}

.course-desc {
  margin: 8px 0;
  color: var(--color-text-secondary);
}

.course-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pill {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid rgba(205, 186, 255, 0.2);
}

.pill-green {
  background: rgba(46, 204, 113, 0.15);
  color: #6be3a0;
}

.pill-gray {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-secondary);
}

.pill-blue {
  background: rgba(157, 92, 255, 0.18);
  color: var(--color-accent-bright);
}

.lesson {
  padding: 14px;
  border-radius: 14px;
  background: rgba(18, 12, 37, 0.85);
  border: 1px solid rgba(205, 186, 255, 0.18);
  box-shadow: inset 0 1px 0 rgba(205, 186, 255, 0.15);
  margin-bottom: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: 0.25s ease;
}

.lesson:hover {
  transform: translateX(4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.32);
}

.lesson.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.lesson-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(205, 186, 255, 0.12);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.lesson-title {
  font-weight: 700;
}

.lesson-desc {
  color: var(--color-text-secondary);
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
  background: #05030b;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35), inset 0 0 0 1px rgba(205, 186, 255, 0.1);
  margin: 12px 0;
}

.video-box iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.notice {
  margin-top: 10px;
  background: rgba(157, 92, 255, 0.12);
  border: 1px solid rgba(157, 92, 255, 0.35);
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 14px;
  color: var(--color-text-primary);
}

.empty {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.alert {
  padding: 12px 14px;
  border-radius: 12px;
  margin-bottom: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.alert-error {
  background: rgba(247, 107, 138, 0.12);
  border-color: rgba(247, 107, 138, 0.3);
  color: #ffb3c5;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(5, 3, 11, 0.6);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 50;
}

.modal-card {
  width: min(480px, 100%);
  background: rgba(18, 12, 37, 0.95);
  border: 1px solid rgba(205, 186, 255, 0.25);
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45), 0 0 24px var(--color-glow);
  padding: 18px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.modal-title {
  font-size: 20px;
  font-weight: 800;
}

.modal-close {
  background: transparent;
  border: 1px solid rgba(205, 186, 255, 0.25);
  color: var(--color-text-primary);
  border-radius: 10px;
  width: 32px;
  height: 32px;
  cursor: pointer;
}

.modal-body {
  color: var(--color-text-secondary);
}

.modal-text {
  margin-bottom: 14px;
  line-height: 1.5;
}

@media (max-width: 600px) {
  .app {
    border-radius: 0;
  }

  header {
    flex-wrap: nowrap;
    gap: 10px;
    padding: 12px;
  }

  .user-actions {
    flex: 0 0 auto;
  }

  nav {
    width: auto;
    flex: 1 1 auto;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  nav::-webkit-scrollbar {
    display: none;
  }

  .nav-link {
    white-space: nowrap;
    padding: 7px 10px;
    font-size: 14px;
    border-radius: 11px;
  }

  .user-pill {
    padding: 7px 10px;
    border-radius: 11px;
    font-size: 14px;
  }
}
</style>
