import { createRouter, createWebHistory } from 'vue-router';
import ProjectsView from '../views/ProjectsView.vue';
import ProjectCoursesView from '../views/ProjectCoursesView.vue';
import CourseDetailsView from '../views/CourseDetailsView.vue';
import LessonView from '../views/LessonView.vue';
import MyCoursesView from '../views/MyCoursesView.vue';
import PrivacyPolicyView from '../views/PrivacyPolicyView.vue';
import ConsentView from '../views/ConsentView.vue';
import PublicOfferView from '../views/PublicOfferView.vue';
import ContactsView from '../views/ContactsView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'projects', component: ProjectsView },
    {
      path: '/projects/:projectId',
      name: 'project-courses',
      component: ProjectCoursesView,
      props: true,
    },
    {
      path: '/projects/:projectId/courses/:courseId',
      name: 'course',
      component: CourseDetailsView,
      props: true,
    },
    {
      path: '/projects/:projectId/courses/:courseId/lessons/:lessonId',
      name: 'lesson',
      component: LessonView,
      props: true,
    },
    { path: '/my', name: 'my', component: MyCoursesView },
    { path: '/privacy-policy', name: 'privacy-policy', component: PrivacyPolicyView },
    { path: '/consent', name: 'consent', component: ConsentView },
    { path: '/public-offer', name: 'public-offer', component: PublicOfferView },
    { path: '/contacts', name: 'contacts', component: ContactsView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

export default router;
