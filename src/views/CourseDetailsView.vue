<script setup>
import { computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "../stores/appStore";

const store = useAppStore();
const route = useRoute();
const router = useRouter();

const courseId = computed(() => route.params.id);

const formatPrice = (value) =>
  typeof value === "number"
    ? `${new Intl.NumberFormat("ru-RU").format(value)} ₽`
    : "—";

const loadCourse = async (id) => {
  if (!id) return;
  await store.openCourse(id);
};

const openLesson = (lesson) => {
  if (!lesson?.has_video) return;
  router.push(`/courses/${courseId.value}/lessons/${lesson.id}`);
};

const goBack = () => router.push("/");

onMounted(() => loadCourse(courseId.value));
watch(courseId, (id) => loadCourse(id));
</script>

<template>
  <div class="card" v-if="store.state.courseDetails">
    <div class="section-title">
      {{ store.state.courseDetails.title }}
    </div>
    <div class="course-desc">{{ store.state.courseDetails.description }}</div>
    <div class="course-meta">
      <span class="pill pill-blue">ID: {{ store.state.courseDetails.id }}</span>
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
      <button
        class="btn btn-primary"
        :disabled="store.isLoading('payment')"
        @click="store.startPayment"
      >
        {{
          store.isLoading("payment")
            ? "Получаем ссылку..."
            : "Оплатить (POST /payments/course)"
        }}
      </button>
      <button class="btn btn-ghost" @click="goBack">Назад к списку</button>
    </div>

    <div v-if="store.state.paymentUrl" class="notice">
      Ссылка на оплату:
      <a :href="store.state.paymentUrl" target="_blank" rel="noopener">{{
        store.state.paymentUrl
      }}</a>
    </div>
  </div>

  <div class="card">
    <div class="section-title">Уроки</div>
    <div v-if="!store.state.courseDetails?.lessons?.length" class="empty">
      У этого курса пока нет уроков
    </div>

    <div
      v-for="lesson in store.state.courseDetails?.lessons"
      :key="lesson.id"
      class="lesson"
      :class="{ disabled: !lesson.has_video }"
      @click="openLesson(lesson)"
    >
      <div class="lesson-icon">🎬</div>
      <div class="lesson-body">
        <div class="lesson-title">{{ lesson.title }}</div>
        <div class="lesson-desc">{{ lesson.description }}</div>
        <div class="lesson-meta">
          <span
            :class="lesson.has_video ? 'pill pill-green' : 'pill pill-gray'"
          >
            {{ lesson.has_video ? "Видео доступно" : "Нужно купить курс" }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
