<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/appStore';

const store = useAppStore();
const router = useRouter();

const goToCourse = (id) => router.push(`/courses/${id}`);

onMounted(async () => {
  if (!store.state.myCourses.length) {
    await store.loadMyCourses();
  }
});
</script>

<template>
  <div class="card">
    <div class="section-title">Мои курсы</div>
    <div v-if="!store.state.myCourses.length" class="empty">У вас пока нет купленных курсов</div>
    <div v-else class="cards">
      <div
        v-for="course in store.state.myCourses"
        :key="course.id"
        class="card course-card"
        @click="goToCourse(course.id)"
      >
        <div class="course-head">
          <div class="course-title">{{ course.title }}</div>
          <span class="pill pill-green text-center">Доступ открыт</span>
        </div>
      </div>
    </div>
    <div class="controls">
      <button class="btn btn-ghost" @click="router.push('/')">Назад к списку</button>
    </div>
  </div>
</template>
