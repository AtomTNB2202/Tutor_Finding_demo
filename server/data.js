// server/data.js

export const users = [
  {
    id: 's001',
    role: 'student',
    name: 'Nguyen Minh Khoi',
    email: 'khoi@hcmut.edu.vn',
    password: '123456', // demo thôi
    major: 'Computer Engineering',
    gpa: 3.57,
    credits: 85,
    avatar: 'https://i.pravatar.cc/120?img=55',
  },
  {
    id: 't01',
    role: 'tutor',
    name: 'Tran Ngoc Thoai',
    email: 'tutor.thoai@hcmut.edu.vn',
    password: '123456',
    major: 'OOP',
    avatar: 'https://i.pravatar.cc/120?img=33',
  },
  {
    id: 't02',
    role: 'tutor',
    name: 'Le Gia Huy',
    email: 'tutor.huy@hcmut.edu.vn',
    password: '123456',
    major: 'DSA',
    avatar: 'https://i.pravatar.cc/120?img=52',
  },
];

export let sessions = [
  {
    id: 'sess01',
    date: '2025-01-19',
    time: '13:00 - 14:00',
    tutorId: 't01',
    studentId: 's001',
    subject: 'OOP',
    mode: 'Online',
    status: 'Scheduled',
  },
  {
    id: 'sess02',
    date: '2025-01-21',
    time: '08:00 - 10:00',
    tutorId: 't02',
    studentId: 's001',
    subject: 'DSA',
    mode: 'In Person',
    status: 'Scheduled',
  },
];

export const resources = [
  {
    id: 'res01',
    title: 'DSA Full Slides',
    type: 'PDF',
    thumbnail: 'https://picsum.photos/400?1',
    link: '#',
  },
  {
    id: 'res02',
    title: 'Graph Theory Article',
    type: 'Article',
    thumbnail: 'https://picsum.photos/400?2',
    link: '#',
  },
];

export let slots = [
  {
    id: 'slot_01',
    tutorId: 't01',
    date: '2025-01-22',
    time: '14:00 - 16:00',
    mode: 'Online',
    subject: 'OOP',
    isBooked: false,
    studentId: null,
  },
  {
    id: 'slot_02',
    tutorId: 't01',
    date: '2025-01-24',
    time: '08:00 - 10:00',
    mode: 'In Person',
    subject: 'OOP',
    isBooked: false,
    studentId: null,
  },
  {
    id: 'slot_03',
    tutorId: 't02',
    date: '2025-01-23',
    time: '09:00 - 11:00',
    mode: 'Online',
    subject: 'DSA',
    isBooked: false,
    studentId: null,
  },
];

export let feedbacks = [
  // sample để dashboard có cái hiển thị
  {
    id: 'fb_01',
    sessionId: 'sess01',
    tutorId: 't01',
    studentId: 's001',
    rating: 5,
    comment: 'Very clear explanation!',
    createdAt: new Date().toISOString(),
  },
];