<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "../stores/appStore";

const store = useAppStore();
const router = useRouter();

const formatPrice = (value) =>
  typeof value === "number"
    ? `${new Intl.NumberFormat("ru-RU").format(value)} ₽`
    : "—";

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
    <div v-else class="cards">
      <div
        v-for="course in store.state.courses"
        :key="course.id"
        class="card course-card"
        @click="openCourse(course.id)"
      >
        <div class="course-head">
          <div class="course-title">{{ course.title }}</div>
          <div class="course-price">{{ formatPrice(course.price) }}</div>
        </div>
        <div class="course-desc">{{ course.description }}</div>
        <div class="course-meta">
          <span
            :class="course.is_purchased ? 'pill pill-green' : 'pill pill-gray'"
          >
            {{ course.is_purchased ? "Доступ открыт" : "Не куплен" }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
