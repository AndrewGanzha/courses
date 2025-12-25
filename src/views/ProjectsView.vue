<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "../stores/appStore";
import placeholderImage from "../assets/images.png";

const store = useAppStore();
const router = useRouter();

const projects = computed(() => store.state.projects || []);
const projectImage = (project) => project?.image || placeholderImage;

const openProject = (id) => router.push(`/projects/${id}`);

onMounted(async () => {
  if (!store.state.projects?.length) {
    await store.loadProjects();
  }
});
</script>

<template>
  <div class="card">
    <div class="section-title">Олимпиады</div>

    <div class="controls">
      <button class="btn btn-ghost" type="button" @click="router.push('/my')">
        Мои курсы
      </button>
    </div>

    <div v-if="!projects.length" class="empty">Пока нет проектов</div>

    <div v-else class="catalog-grid">
      <div
        v-for="project in projects"
        :key="project.id"
        class="catalog-card"
        role="button"
        tabindex="0"
        @click="openProject(project.id)"
        @keydown.enter="openProject(project.id)"
        @keydown.space.prevent="openProject(project.id)"
      >
        <div class="catalog-card__image">
          <img
            :src="projectImage(project)"
            :alt="project.title"
            loading="lazy"
          />

          <!-- ТРЕУГОЛЬНЫЙ БЕЙДЖ: делаем форму на самом элементе, без ::before -->
          <div class="catalog-card__badge" aria-label="Название проекта">
            <div class="catalog-card__title">
              {{ project.title }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px;
  margin-top: 12px;
  width: 100%;
  justify-items: stretch;
  align-items: stretch;
}

.catalog-card {
  position: relative;
  width: 100%;
  isolation: isolate;
  border-radius: 18px;
  cursor: pointer;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 14px 38px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    inset 0 -18px 26px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  transition: 0.25s ease;
  display: block;
}

.catalog-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.4), 0 0 22px var(--color-glow);
}

.catalog-card:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.6);
  outline-offset: 2px;
}

.catalog-card::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.22),
      rgba(255, 255, 255, 0.06) 45%,
      rgba(0, 0, 0, 0.14)
    ),
    radial-gradient(
      circle at 25% 15%,
      rgba(255, 255, 255, 0.22),
      transparent 55%
    ),
    radial-gradient(circle at 85% 80%, rgba(0, 0, 0, 0.26), transparent 55%);
  opacity: 0.9;
}

.catalog-card__image {
  position: relative;
  z-index: 1;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 16px;
}

.catalog-card__image img {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: inherit;
}

.catalog-card__badge {
  width: 100%;
  height: 60%;
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 2;

  display: flex;
  align-items: flex-end;
  justify-content: flex-end;

  padding: clamp(10px, 2.2vw, 14px) clamp(12px, 2.8vw, 18px)
    clamp(12px, 2.6vw, 20px) clamp(30px, 6vw, 48px);

  max-width: 82%;

  background: linear-gradient(
    145deg,
    rgba(230, 230, 235, 0.38),
    rgba(200, 200, 205, 0.32) 55%,
    rgba(170, 170, 175, 0.36)
  );

  border: 1px solid rgba(255, 255, 255, 0.2);

  clip-path: polygon(0 100%, 100% 0, 100% 100%);

  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.14),
    inset 0 -18px 26px rgba(0, 0, 0, 0.25);
}

.catalog-card__title {
  font-weight: 700;
  line-height: 1.2;
  text-align: right;

  font-size: clamp(12px, 2.6vw, 16px);

  color: rgba(18, 18, 20, 0.95);
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.45);

  word-break: normal;
  overflow-wrap: anywhere;
  hyphens: auto;

  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 3;
}

@media (max-width: 480px) {
  .catalog-card__title {
    font-size: 11px;
    font-weight: 600;
    line-height: 1.1;

    text-shadow: none;
    color: rgba(20, 20, 22, 0.85);

    -webkit-line-clamp: 2;
  }
}

@media (max-width: 360px) {
  .catalog-card__title {
    font-size: 10.5px;
    font-weight: 600;
  }
}
</style>
