const baseLessons = (courseTitle) => [
  {
    id: 1,
    title: 'Введение и стратегия',
    description: `Что внутри курса «${courseTitle}» и как работать с материалами.`,
  },
  {
    id: 2,
    title: 'Основные модули',
    description: 'Разбираем ключевые приёмы и ошибки.',
  },
  {
    id: 3,
    title: 'Практика',
    description: 'Типовые задачи и решения.',
  },
  {
    id: 4,
    title: 'Сложные кейсы',
    description: 'Разбор нетривиальных заданий.',
  },
];

const lessonVideoUrl =
  'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=0&modestbranding=1&rel=0';

const now = () => new Date().toISOString();

export const mockProjects = () => [
  {
    id: 10,
    title: 'Подготовка к олимпиадам',
    image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b',
  },
  {
    id: 20,
    title: 'Школьные курсы',
    image: 'https://images.unsplash.com/photo-1588072432836-e10032774350',
  },
  {
    id: 30,
    title: 'Профориентация',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6',
  },
];

const coursesByProjectMap = {
  10: [
    {
      id: 101,
      project_id: 10,
      title: 'Олимпиада Ломоносов',
      description: 'Профильная олимпиада МГУ',
      price: 20000,
      is_purchased: true,
      image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b',
    },
    {
      id: 102,
      project_id: 10,
      title: 'РАНХиГС',
      description: 'Экономика и обществознание',
      price: 15000,
      is_purchased: false,
      image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b',
    },
  ],
  20: [
    {
      id: 201,
      project_id: 20,
      title: 'Математика 10–11',
      description: 'Подготовка к ЕГЭ профиль',
      price: 12000,
      is_purchased: false,
      image: 'https://images.unsplash.com/photo-1588072432836-e10032774350',
    },
  ],
  30: [
    {
      id: 301,
      project_id: 30,
      title: 'Карьерный трек',
      description: 'Навигация по профессиям',
      price: 9000,
      is_purchased: false,
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6',
    },
  ],
};

export const mockCoursesByProject = (projectId) => {
  const idNum = projectId ? Number(projectId) : undefined;
  if (idNum && coursesByProjectMap[idNum]) return coursesByProjectMap[idNum];

  return Object.values(coursesByProjectMap).flat();
};

export const mockCourseById = (projectId, courseId) => {
  const list = mockCoursesByProject(projectId);
  const course = list.find((c) => c.id === Number(courseId)) ?? list[0];
  const isPurchased = course.is_purchased;

  return {
    ...course,
    lessons: baseLessons(course.title).map((lesson) => ({
      ...lesson,
      has_video: isPurchased,
    })),
  };
};

export const mockMyCourses = () =>
  Object.values(coursesByProjectMap)
    .flat()
    .filter((c) => c.is_purchased)
    .map((course) => ({
      ...course,
      purchased_at: now(),
    }));

export const mockLessonVideo = () => ({
  video_url: lessonVideoUrl,
});

export const mockCreateCoursePayment = (courseId) => ({
  payment_url: `https://pay.example.com/course/${courseId ?? 'demo'}`,
});

export const mockMe = () => ({
  id: 1,
  telegram_id: 999999,
  username: 'dev_user',
  first_name: 'Dev',
  last_name: 'User',
  photo_url: null,
  courses: mockMyCourses().map((course) => ({
    id: course.id,
    title: course.title,
    purchased_at: course.purchased_at,
  })),
});
