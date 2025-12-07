// server/server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { users, sessions, resources } from './data.js';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// ===== AUTH LOGIN =====
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // demo: không dùng JWT, trả thẳng user
  res.json({
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    major: user.major,
    gpa: user.gpa ?? null,
    credits: user.credits ?? null,
    avatar: user.avatar,
  });
});

// ===== GET SESSIONS (student/tutor) =====
// /api/sessions?role=student&userId=s001
app.get('/api/sessions', (req, res) => {
  const { role, userId } = req.query;

  let result = sessions;
  if (role === 'student') {
    result = result.filter((s) => s.studentId === userId);
  }
  if (role === 'tutor') {
    result = result.filter((s) => s.tutorId === userId);
  }

  res.json(result);
});

// ===== CANCEL SESSION =====
app.patch('/api/sessions/:id/cancel', (req, res) => {
  const { id } = req.params;
  const s = sessions.find((x) => x.id === id);
  if (!s) return res.status(404).json({ message: 'Not found' });
  s.status = 'Canceled';
  res.json(s);
});

// ===== TUTORS =====
app.get('/api/tutors', (req, res) => {
  const tutors = users.filter((u) => u.role === 'tutor');
  res.json(tutors);
});

// ===== RESOURCES =====
app.get('/api/resources', (req, res) => {
  res.json(resources);
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
