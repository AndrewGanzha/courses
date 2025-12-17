import { createRouter, createWebHistory } from 'vue-router';
import CoursesView from '../views/CoursesView.vue';
import CourseDetailsView from '../views/CourseDetailsView.vue';
import LessonView from '../views/LessonView.vue';
import MyCoursesView from '../views/MyCoursesView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'courses', component: CoursesView },
    { path: '/courses/:id', name: 'course', component: CourseDetailsView, props: true },
    {
      path: '/courses/:id/lessons/:lessonId',
      name: 'lesson',
      component: LessonView,
      props: true,
    },
    { path: '/my', name: 'my', component: MyCoursesView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

export default router;
