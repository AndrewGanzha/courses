# Courses frontend

Клиентская часть мини-приложения на Vue 3 + Vite, работающая с бекендом из папки `edu`.

## Установка и запуск
- Установка зависимостей: `npm install`
- Дев-сервер: `npm run dev`
- Сборка: `npm run build`
- Превью сборки: `npm run preview`

Переменные окружения:
- `VITE_API_BASE_URL` — базовый URL API (по умолчанию `http://localhost:8000/api`).
- `VITE_USE_MOCKS` — `true`, чтобы подменить ответы моками (авторизация остаётся реальной).

Токен авторизации хранится в `localStorage` под ключом `auth_token` и автоматически подставляется в запросы.

## API-обёртки (`src/api/backend.js`)
- Auth: `authWithTelegram(initData)` → POST `/auth/telegram`; `devLogin()` → POST `/dev/login`; `logout()` очищает токен.
- Пользователь: `fetchMe()` → GET `/me`.
- Проекты и курсы: `fetchProjects()` → GET `/projects` (публичный); `fetchCourses()` → GET `/courses` (под auth); `fetchProjectCourses(projectId)` → GET `/projects/{project}/courses`; `fetchCourseById(projectId, courseId)` → GET `/projects/{project}/courses/{course}`; `fetchLessonVideo(lessonId)` → GET `/lessons/{lesson}/video`; `fetchMyCourses()` → GET `/my/courses`.
- Платежи: `createCoursePayment(courseId)` → POST `/payments/course`.
- Tochka вебхуки (для отладки/админки): `setupTochkaWebhook()` → GET `/setup-webhook`; `postTochkaWebhook(payload)` → POST `/payments/webhook/tochka`.
- Низкоуровневый клиент: `http.get/post/put/patch/delete` для кастомных запросов.

Пример использования:
```js
import { authWithTelegram, fetchProjects, fetchProjectCourses, createCoursePayment } from './api';

await authWithTelegram(initDataFromTelegram);
const projects = await fetchProjects();
const courses = await fetchProjectCourses(projects[0].id);
const payment = await createCoursePayment(courses[0].id);
```

## Интерфейс
- Главная: список проектов → курсы проекта → детали курса с уроками и оплатой.
- Отдельные экраны: просмотр урока, «Мои курсы», политика конфиденциальности, согласие, оферта, контакты.
- Авторизация через Telegram mini app происходит автоматически, вне Telegram показывается подсказка открыть приложение из клиента.

## Моки
- Ответы для проектов/курсов/уроков/платежей/профиля находятся в `src/api/mocks.js`.
- Включение моков: `VITE_USE_MOCKS=true` (используются для всех методов, где есть заглушки; авторизация не мокается).
