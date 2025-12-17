<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "../stores/appStore";

const store = useAppStore();
const route = useRoute();
const router = useRouter();

const courseId = computed(() => route.params.id);
const paymentWindow = ref(null);
const lastOpenedPaymentUrl = ref("");

const displayReviews = computed(() => {
  const lessons = store.state.courseDetails?.lessons || [];
  const result = lessons.slice(0, 10).map((lesson, index) => ({
    ...lesson,
    displayTitle: `Разбор ${index + 1}`,
    placeholder: false,
  }));

  for (let i = result.length; i < 10; i += 1) {
    result.push({
      id: `placeholder-${i + 1}`,
      has_video: false,
      displayTitle: `Разбор ${i + 1}`,
      placeholder: true,
    });
  }

  return result;
});

const formatPrice = (value) =>
  typeof value === "number"
    ? `${new Intl.NumberFormat("ru-RU").format(value)} ₽`
    : "—";

const loadCourse = async (id) => {
  if (!id) return;
  await store.openCourse(id);
};

const openLesson = (lesson) => {
  if (!lesson || lesson.placeholder || !lesson.has_video) return;
  router.push(`/courses/${courseId.value}/lessons/${lesson.id}`);
};

const goBack = () => router.push("/");

const pay = async () => {
  lastOpenedPaymentUrl.value = "";
  try {
    paymentWindow.value = window.open("about:blank", "_blank");
    if (paymentWindow.value) paymentWindow.value.opener = null;
  } catch {
    paymentWindow.value = null;
  }
  await store.startPayment();
};

onMounted(() => loadCourse(courseId.value));
watch(courseId, (id) => loadCourse(id));

watch(
  () => store.state.paymentUrl,
  (url) => {
    if (!url || url === lastOpenedPaymentUrl.value) return;
    lastOpenedPaymentUrl.value = url;
    if (paymentWindow.value && !paymentWindow.value.closed) {
      paymentWindow.value.location.href = url;
    } else {
      window.open(url, "_blank", "noopener");
    }
  }
);
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
      <button
        class="btn btn-primary"
        :disabled="store.isLoading('payment')"
        @click="pay"
      >
        {{
          store.isLoading("payment")
            ? "Оплатить..."
            : "Оплатить"
        }}
      </button>
      <button class="btn btn-ghost" @click="goBack">Назад к списку</button>
    </div>
  </div>

  <div class="card">
    <div class="section-title">Разборы</div>
    <div
      v-for="lesson in displayReviews"
      :key="lesson.id"
      class="lesson"
      :class="{ disabled: !lesson.has_video }"
      @click="openLesson(lesson)"
    >
      <div class="lesson-icon">🎬</div>
      <div class="lesson-body">
        <div class="lesson-title">{{ lesson.displayTitle }}</div>
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
