<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "../stores/appStore";
import placeholderImage from "../assets/images.png";

const store = useAppStore();
const router = useRouter();

const displayCourses = computed(() => (store.state.courses || []).slice(0, 6));
const courseImage = (course) => placeholderImage;

const openCourse = (id) => router.push(`/courses/${id}`);

onMounted(async () => {
  if (!store.state.courses.length && (store.useMocks || store.state.token)) {
    await store.loadCourses();
  }
});
</script>

<template>
  <div class="card">
    <div class="section-title">Курсы</div>
    <div class="controls">
      <button class="btn btn-ghost" @click="router.push('/my')">
        Мои курсы
      </button>
    </div>

    <div v-if="!store.state.courses.length" class="empty">Пока нет курсов</div>
    <div v-else class="catalog-grid">
      <div
        v-for="course in displayCourses"
        :key="course.id"
        class="catalog-card"
        @click="openCourse(course.id)"
      >
        <div class="catalog-card__top">
          <div class="catalog-card__glass-icon" aria-hidden="true">🏆</div>
          <div class="catalog-card__logo">
            <img :src="courseImage(course)" alt="" loading="lazy" />
          </div>
        </div>
        <div class="catalog-card__bottom">
          <div class="catalog-card__title">{{ course.title }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.catalog-card {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 18px;
  cursor: pointer;
  overflow: hidden;
  border: 1px solid rgba(205, 186, 255, 0.18);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(18, 12, 37, 0.88));
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.32), inset 0 1px 0 rgba(205, 186, 255, 0.18);
  transition: 0.25s ease;
  display: grid;
  grid-template-rows: 1fr auto;
}

.catalog-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.4), 0 0 22px var(--color-glow);
}

.catalog-card::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 0% 0%, rgba(0, 0, 0, 0.45), transparent 55%),
    radial-gradient(circle at 100% 0%, rgba(0, 0, 0, 0.4), transparent 55%),
    radial-gradient(circle at 0% 100%, rgba(0, 0, 0, 0.35), transparent 55%),
    radial-gradient(circle at 100% 100%, rgba(0, 0, 0, 0.5), transparent 55%);
  mix-blend-mode: multiply;
  opacity: 0.95;
}

.catalog-card::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 46px;
  height: 46px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.42), rgba(255, 255, 255, 0.06));
  clip-path: polygon(0 0, 100% 0, 100% 100%);
  box-shadow: -10px 12px 16px rgba(0, 0, 0, 0.32);
  opacity: 0.7;
  pointer-events: none;
}

.catalog-card__top {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
}

.catalog-card__logo {
  width: 100%;
  height: 100%;
  border-radius: 14px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow:
    0 14px 28px rgba(0, 0, 0, 0.25),
    inset 0 0 0 1px rgba(0, 0, 0, 0.06);
}

.catalog-card__logo img {
  width: 88%;
  height: 88%;
  object-fit: cover;
}

.catalog-card__glass-icon {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.24);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: rgba(255, 255, 255, 0.92);
  font-size: 16px;
}

.catalog-card__bottom {
  position: relative;
  padding: 12px 12px 14px;
}

.catalog-card__bottom::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(18, 12, 37, 0), rgba(18, 12, 37, 0.94)),
    repeating-radial-gradient(
      circle at 20% 20%,
      rgba(255, 255, 255, 0.09) 0 1px,
      rgba(255, 255, 255, 0) 1px 4px
    );
  opacity: 0.9;
}

.catalog-card__title {
  position: relative;
  font-weight: 800;
  font-size: 14px;
  line-height: 1.2;
  color: var(--color-text-primary);
  text-shadow: 0 10px 20px rgba(0, 0, 0, 0.42);
}

@media (min-width: 720px) {
  .catalog-grid {
    gap: 14px;
  }

  .catalog-card__title {
    font-size: 15px;
  }
}
</style>
