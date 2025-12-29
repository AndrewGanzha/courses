<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "../stores/appStore";

const store = useAppStore();
const router = useRouter();

const hasProject = (id) =>
  !!store.state.courses.find((c) => String(c.id) === String(id));

const goToCourse = (id) => {
  const course = store.state.courses.find((c) => String(c.id) === String(id));
  const projectId = course?.project_id;
  if (projectId) {
    router.push(`/projects/${projectId}/courses/${id}`);
  }
};

onMounted(async () => {
  if (!store.state.myCourses.length && (store.state.token || store.useMocks)) {
    await store.loadMyCourses();
  }
  if (!store.state.courses.length && (store.useMocks || store.state.token)) {
    await store.loadAllCourses();
  }
});
</script>

<template>
  <div class="card">
    <div class="section-title">Мои курсы</div>
    <div v-if="!store.state.myCourses.length" class="empty">
      У вас пока нет купленных курсов
    </div>
    <div v-else class="cards">
      <div
        v-for="course in store.state.myCourses"
        :key="course.id"
        :class="['card course-card', { disabled: !hasProject(course.id) }]"
        @click="goToCourse(course.id)"
      >
        <div class="course-head">
          <div class="course-title">{{ course.title }}</div>
          <span class="pill pill-green text-center">Доступ открыт</span>
        </div>
      </div>
    </div>
    <div class="controls">
      <button class="btn btn-ghost" @click="router.push('/')">
        Назад к списку
      </button>
    </div>
  </div>
</template>

<style scoped>
.course-card.disabled {
  opacity: 0.65;
  cursor: not-allowed;
  pointer-events: none;
}

.empty {
  padding-bottom: 14px;
}
</style>
