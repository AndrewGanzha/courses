<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "../stores/appStore";
import placeholderImage from "../assets/images.png";

const store = useAppStore();
const router = useRouter();

const displayCourses = computed(() => (store.state.courses || []).slice(0, 6));
const courseImage = (course) => course?.image_url || course?.image || placeholderImage;

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
          <div class="catalog-card__icon-shell">
            <img :src="courseImage(course)" :alt="course.title" loading="lazy" />
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
  width: 100%;
  justify-items: stretch;
  align-items: stretch;
}

.catalog-card {
  position: relative;
  aspect-ratio: 1 / 1;
  width: 100%;
  height: 100%;
  justify-self: stretch;
  align-self: stretch;
  border-radius: 18px;
  cursor: pointer;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.08);
  box-shadow:
    0 14px 38px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    inset 0 -18px 26px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
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
    linear-gradient(145deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.06) 45%, rgba(0, 0, 0, 0.14)),
    radial-gradient(circle at 25% 15%, rgba(255, 255, 255, 0.22), transparent 55%),
    radial-gradient(circle at 85% 80%, rgba(0, 0, 0, 0.26), transparent 55%);
  opacity: 0.9;
}

.catalog-card::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 46px;
  height: 46px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.52), rgba(255, 255, 255, 0.08));
  clip-path: polygon(0 0, 100% 0, 100% 100%);
  box-shadow: -10px 12px 18px rgba(0, 0, 0, 0.34);
  opacity: 0.8;
  pointer-events: none;
}

.catalog-card__top {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px 14px 10px;
}

.catalog-card__icon-shell {
  position: relative;
  width: 72%;
  max-width: 160px;
  aspect-ratio: 1 / 1;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow:
    0 18px 34px rgba(0, 0, 0, 0.38),
    inset 0 1px 0 rgba(255, 255, 255, 0.85),
    inset 0 -18px 26px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.catalog-card__icon-shell::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0) 55%);
  opacity: 0.9;
}

.catalog-card__icon-shell img {
  position: relative;
  z-index: 1;
  width: 74%;
  height: 74%;
  object-fit: contain;
  filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.22));
}

.catalog-card__bottom {
  position: relative;
  padding: 12px 12px 16px;
  text-align: center;
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
  font-size: 15px;
  line-height: 1.2;
  color: var(--color-text-primary);
  text-shadow: 0 10px 20px rgba(0, 0, 0, 0.42);
}

@media (min-width: 720px) {
  .catalog-grid {
    gap: 14px;
  }

  .catalog-card__title {
    font-size: 16px;
  }
}
</style>
