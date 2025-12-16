# courses

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Работа с бекендом

В `src/api` добавлен общий слой для запросов к Laravel-бекенду.

- `src/api/httpClient.js` — низкоуровневый клиент (fetch, заголовки, токен, обработка ошибок).
- `src/api/backend.js` — готовые методы под эндпоинты: Telegram-авторизация, dev login, профайл, курсы, уроки, платежи.
- `src/api/index.js` — единый экспорт для импорта в компоненты/Pinia.

### Настройки
- Базовый URL берётся из `VITE_API_BASE_URL` (по умолчанию `http://localhost:8000/api`). Добавьте в `.env` при необходимости.
- Токен хранится в `localStorage` под ключом `auth_token`.

### Быстрый пример

```js
import { authWithTelegram, fetchMe, fetchCourses, createCoursePayment, logout } from './api';

await authWithTelegram(initDataFromTelegram); // токен сохранится автоматически
const me = await fetchMe();
const courses = await fetchCourses();
const payment = await createCoursePayment(courses[0].id);
logout(); // удалить токен при выходе
```

### Доступные методы
- `authWithTelegram(initData)` — POST `/auth/telegram`, сохраняет токен.
- `devLogin()` — POST `/dev/login`, сохраняет токен (для локалки).
- `logout()` — удаляет токен.
- `fetchMe()` — GET `/me`.
- `fetchCourses()` — GET `/courses`.
- `fetchCourseById(id)` — GET `/courses/{id}`.
- `fetchMyCourses()` — GET `/my/courses`.
- `fetchLessonVideo(lessonId)` — GET `/lessons/{id}/video`.
- `createCoursePayment(courseId)` — POST `/payments/course`.
- Низкоуровневый объект `http` (`get/post/put/patch/delete`) для редких кастомных запросов.

## Экран приложения (App.vue)
- Повторяет логику `miniapp.html`, но с реальными запросами из `src/api`.
- Блок авторизации (dev login / Telegram), список курсов, детали курса, уроки, ссылка на оплату, мои курсы, просмотр видео урока.
- Состояния и ошибки подсвечиваются в шапке.

### Моки
- Для всех запросов, кроме авторизации, есть мок-ответы (см. `src/api/mocks.js`).
- Включение: `VITE_USE_MOCKS=true` (автоподмена данных, но авторизация остаётся реальной).
