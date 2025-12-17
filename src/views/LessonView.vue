<script setup>
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from '../stores/appStore';

const store = useAppStore();
const route = useRoute();
const router = useRouter();

const courseId = computed(() => route.params.id);
const lessonId = computed(() => route.params.lessonId);

const loadLesson = async () => {
  if (!courseId.value || !lessonId.value) return;
  await store.openLesson(courseId.value, lessonId.value);
};

const backToCourse = () => router.push(`/courses/${courseId.value}`);

onMounted(loadLesson);
watch([courseId, lessonId], loadLesson);
</script>

<template>
  <div class="card">
    <div class="section-title">
      {{ store.state.selectedLesson?.title || 'Урок' }}
    </div>
    <div class="course-desc">{{ store.state.selectedLesson?.description || 'Без описания' }}</div>

    <div class="video-box" v-if="store.state.lessonVideo">
      <iframe :src="store.state.lessonVideo" allowfullscreen></iframe>
    </div>
    <div v-else class="empty">Видео не загружено</div>

    <div class="controls">
      <button class="btn btn-ghost" @click="backToCourse">Назад к курсу</button>
    </div>
  </div>
</template>
