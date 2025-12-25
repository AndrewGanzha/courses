<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useAppStore } from '../stores/appStore';

const emit = defineEmits(['open-auth']);

const store = useAppStore();
const route = useRoute();

const navItems = [
  { to: '/', label: 'Олимпиады' },
  { to: '/my', label: 'Мои курсы' },
];

const navClass = (to) => (route.path === to ? 'nav-link active' : 'nav-link');
const isAuthLoading = computed(() => store.isLoading('auth'));
const userName = computed(
  () => store.state.user?.first_name || store.state.user?.username || 'Пользователь'
);

const openAuth = () => {
  emit('open-auth');
};
</script>

<template>
  <header class="app-header">
    <nav class="app-nav">
      <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" :class="navClass(item.to)">
        {{ item.label }}
      </RouterLink>
    </nav>
    <div class="user-actions">
      <div v-if="store.state.user" class="user-pill">
        {{ userName }}
      </div>
      <button v-else class="btn btn-ghost btn-small" :disabled="isAuthLoading" @click="openAuth">
        {{ isAuthLoading ? 'Входим...' : 'Войти' }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  padding: 16px;
  background: linear-gradient(135deg, rgba(18, 12, 37, 0.85), rgba(18, 12, 37, 0.65));
  border-bottom: 1px solid rgba(205, 186, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.35);
}

.app-nav {
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

@media (max-width: 600px) {
  .app-header {
    flex-wrap: nowrap;
    gap: 10px;
    padding: 12px;
  }

  .app-nav {
    width: auto;
    flex: 1 1 auto;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .app-nav::-webkit-scrollbar {
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
