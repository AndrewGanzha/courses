<script setup>
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from '../stores/appStore';

const store = useAppStore();
const route = useRoute();
const router = useRouter();

const projectId = computed(() => route.params.projectId);
const courseId = computed(() => route.params.courseId);
const isInactive = computed(
  () => store.state.courseDetails && store.state.courseDetails.is_active === false
);

const availableLessons = computed(() => {
  const lessons = store.state.courseDetails?.lessons || [];
  return lessons.filter((lesson) => lesson.has_video).map((lesson, index) => ({
    ...lesson,
    displayTitle: lesson.title || `Разбор ${index + 1}`,
  }));
});

const formatPrice = (value) =>
  typeof value === 'number' ? `${new Intl.NumberFormat('ru-RU').format(value)} ₽` : '—';

const loadCourse = async (id) => {
  if (!id || !projectId.value) return;
  await store.openCourse(projectId.value, id);
};

const openLesson = (lesson) => {
  if (!lesson || !lesson.has_video) return;
  router.push(`/projects/${projectId.value}/courses/${courseId.value}/lessons/${lesson.id}`);
};

const goBack = () => router.push(`/projects/${projectId.value}`);

onMounted(() => loadCourse(courseId.value));
watch(courseId, (id) => loadCourse(id));
watch(projectId, () => loadCourse(courseId.value));
</script>

<template>
  <div class="card" v-if="store.state.courseDetails">
    <div class="section-title">
      {{ store.state.courseDetails.title }}
    </div>
    <div class="course-desc">{{ store.state.courseDetails.description }}</div>
    <div class="course-meta">
      <span
        :class="
          store.state.courseDetails.is_purchased
            ? 'pill pill-green'
            : 'pill pill-gray'
        "
      >
        {{
          store.state.courseDetails.is_purchased ? "Куплен" : "Доступ платный"
        }}
      </span>
      <span class="pill pill-gray">{{
        formatPrice(store.state.courseDetails.price)
      }}</span>
    </div>

    <div class="controls">
      <button class="btn btn-ghost" style="margin-top: 20px" @click="goBack">Назад к списку</button>
    </div>
  </div>

  <div class="card">
    <div class="section-title">Разборы</div>
    <div v-if="isInactive" class="empty">Скоро здесь появятся обучающие видео№</div>
    <template v-else>
      <div v-if="!availableLessons.length" class="empty">Пока нет опубликованных видео</div>
      <template v-else>
        <div
          v-for="lesson in availableLessons"
          :key="lesson.id"
          class="lesson"
          @click="openLesson(lesson)"
        >
          <div class="lesson-icon">🎬</div>
          <div class="lesson-body">
            <div class="lesson-title">{{ lesson.displayTitle }}</div>
            <div class="lesson-meta">
              <span class="pill pill-green" style="margin-top: 10px">Видео доступно</span>
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
