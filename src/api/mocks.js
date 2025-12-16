const baseLessons = [
  {
    id: 1,
    title: 'Введение и стратегия',
    description: 'Как устроена олимпиада и как распределять время.',
  },
  {
    id: 2,
    title: 'Методы решения',
    description: 'Разбираем частые приёмы и ошибки.',
  },
  {
    id: 3,
    title: 'Практика: задачи уровня 1',
    description: 'Типовые задачи и решения.',
  },
  {
    id: 4,
    title: 'Практика: задачи уровня 3',
    description: 'Сложные задания с пояснениями.',
  },
];

const lessonVideoUrl =
  'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=0&modestbranding=1&rel=0';

const now = () => new Date().toISOString();

export const mockCourses = () => [
  {
    id: 101,
    title: 'Ломоносов',
    description: 'МГУ — профильная олимпиада',
    price: 20000,
    is_purchased: true,
  },
  {
    id: 202,
    title: 'РАНХиГС',
    description: 'Экономика и обществознание',
    price: 15000,
    is_purchased: false,
  },
  {
    id: 303,
    title: 'СПбГУ',
    description: 'Математика и логика',
    price: 17000,
    is_purchased: false,
  },
];

export const mockCourseById = (courseId) => {
  const courses = mockCourses();
  const course = courses.find((c) => c.id === Number(courseId)) ?? courses[0];
  const isPurchased = course.is_purchased;

  return {
    ...course,
    lessons: baseLessons.map((lesson) => ({
      ...lesson,
      has_video: isPurchased,
    })),
  };
};

export const mockMyCourses = () =>
  mockCourses()
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
