<script setup>
import { computed, onMounted, ref, watch } from "vue";
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

const selectedCourse = ref(null);
const paymentWindow = ref(null);
const lastOpenedPaymentUrl = ref("");

const loadCourses = async () => {
  if (projectId.value) {
    await store.loadProjectCourses(projectId.value);
  }
};

const handleCourseClick = (course) => {
  if (!course) return;
  if (course.is_purchased) {
    router.push(`/projects/${projectId.value}/courses/${course.id}`);
    return;
  }
  selectedCourse.value = course;
  lastOpenedPaymentUrl.value = "";
};

const closeModal = () => {
  selectedCourse.value = null;
  lastOpenedPaymentUrl.value = "";
};

const startPurchase = async () => {
  if (!selectedCourse.value) return;
  try {
    paymentWindow.value = window.open("about:blank", "_blank");
    if (paymentWindow.value) paymentWindow.value.opener = null;
  } catch {
    paymentWindow.value = null;
  }

  await store.openCourse(projectId.value, selectedCourse.value.id);
  await store.startPayment();
};

onMounted(async () => {
  if (!store.state.projects.length) {
    await store.loadProjects();
  }
  await loadCourses();
});

watch(projectId, () => loadCourses());

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
  <div class="card">
    <div class="section-title">
      {{ project?.title || "Проект" }}
    </div>
    <div class="controls">
      <button class="btn btn-ghost" @click="router.push('/')">
        Все олимпиады
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
        @click="handleCourseClick(course)"
      >
        <div class="course-head">
          <div class="course-title">{{ course.title }}</div>
        </div>
        <div class="course-price">
          {{
            typeof course.price === "number"
              ? new Intl.NumberFormat("ru-RU").format(course.price) + " ₽"
              : "—"
          }}
        </div>
        <div class="course-desc">{{ course.description }}</div>
        <div class="course-thumb">
          <img :src="courseImage(course)" :alt="course.title" loading="lazy" />
        </div>
        <div class="course-meta">
          <span
            :class="course.is_purchased ? 'pill pill-green' : 'pill pill-gray pill-wide'"
          >
            {{ course.is_purchased ? "Доступ открыт" : "Не куплен" }}
          </span>
        </div>
      </div>
    </div>
  </div>

  <div v-if="selectedCourse" class="modal-backdrop" role="dialog" aria-modal="true">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">Покупка курса</div>
        <button class="btn btn-ghost small" @click="closeModal">✕</button>
      </div>
      <div class="modal-body">
        <div class="purchase-title">{{ selectedCourse.title }}</div>
        <div class="purchase-desc">
          {{ selectedCourse.description || "Получите доступ к курсу и урокам." }}
        </div>
        <div class="purchase-price">
          Цена:
          <b>{{
            typeof selectedCourse.price === "number"
              ? new Intl.NumberFormat("ru-RU").format(selectedCourse.price) + " ₽"
              : "—"
          }}</b>
        </div>
      </div>
      <div class="modal-actions">
        <button
          class="btn btn-primary"
          :disabled="store.isLoading('payment')"
          @click="startPurchase"
        >
          {{ store.isLoading("payment") ? "Создаём ссылку..." : "Оплатить" }}
        </button>
        <button class="btn btn-ghost" type="button" @click="closeModal">
          Отмена
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-top: 12px;
}

.course-card {
  cursor: pointer;
  position: relative;
  overflow: hidden;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  text-align: center;
}

.course-head {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 8px;
}

.course-title {
  font-weight: 700;
  font-size: 16px;
  line-height: 1.3;
}

.course-price {
  margin-top: 6px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.course-thumb {
  margin: 12px auto 0;
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

.course-meta {
  margin-top: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-top: 10px;
}

.pill-wide {
  width: 100%;
  justify-content: center;
  text-align: center;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.modal {
  width: min(480px, 90vw);
  background: rgba(26, 20, 40, 0.95);
  border: 1px solid rgba(205, 186, 255, 0.18);
  border-radius: 18px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45), 0 0 30px var(--color-glow);
  padding: 18px;
  color: var(--color-text-primary);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
}

.modal-body {
  display: grid;
  gap: 10px;
  margin-bottom: 14px;
}

.purchase-title {
  font-weight: 700;
  font-size: 17px;
}

.purchase-desc {
  color: var(--color-text-secondary);
}

.purchase-price {
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.btn.small {
  padding: 8px 12px;
}

@media (max-width: 640px) {
  .cards {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .course-thumb {
    width: 100px;
    height: 100px;
  }
}
</style>
