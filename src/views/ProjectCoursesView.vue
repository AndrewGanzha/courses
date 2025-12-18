<script setup>
import { computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "../stores/appStore";
import placeholderImage from "../assets/images.png";

const store = useAppStore();
const route = useRoute();
const router = useRouter();

const projectId = computed(() => route.params.projectId);
const project = computed(() =>
  store.state.projects.find((p) => String(p.id) === String(projectId.value))
);
const courses = computed(
  () => store.state.projectCourses[projectId.value] || []
);
const courseImage = (course) => course.image || placeholderImage;

const loadCourses = async () => {
  if (projectId.value) {
    await store.loadProjectCourses(projectId.value);
  }
};

const openCourse = (courseId) => {
  router.push(`/projects/${projectId.value}/courses/${courseId}`);
};

onMounted(async () => {
  if (!store.state.projects.length) {
    await store.loadProjects();
  }
  await loadCourses();
});

watch(projectId, () => loadCourses());
</script>

<template>
  <div class="card">
    <div class="section-title">
      {{ project?.title || "Проект" }}
    </div>
    <div class="controls">
      <button class="btn btn-ghost" @click="router.push('/')">
        Все проекты
      </button>
      <button class="btn btn-ghost" @click="router.push('/my')">
        Мои курсы
      </button>
    </div>

    <div v-if="!courses.length" class="empty">
      Пока нет курсов в этом проекте
    </div>
    <div v-else class="cards">
      <div
        v-for="course in courses"
        :key="course.id"
        class="card course-card"
        @click="openCourse(course.id)"
      >
        <div class="course-head">
          <div class="course-title">{{ course.title }}</div>
          <div class="course-price">
            {{
              typeof course.price === "number"
                ? new Intl.NumberFormat("ru-RU").format(course.price) + " ₽"
                : "—"
            }}
          </div>
        </div>
        <div class="course-desc">{{ course.description }}</div>
        <div class="course-meta">
          <span
            :class="course.is_purchased ? 'pill pill-green' : 'pill pill-gray'"
          >
            {{ course.is_purchased ? "Доступ открыт" : "Не куплен" }}
          </span>
        </div>
        <div class="course-thumb">
          <img :src="courseImage(course)" :alt="course.title" loading="lazy" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
  margin-top: 12px;
}

.course-card {
  cursor: pointer;
  position: relative;
  overflow: hidden;
  min-height: 220px;
  display: grid;
  grid-template-rows: auto auto 1fr;
}

.course-thumb {
  margin: 10px auto 0;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.course-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
</style>
