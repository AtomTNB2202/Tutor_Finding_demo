// server/server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { users, sessions, resources, slots, feedbacks } from './data.js';

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
app.get("/api/sessions", (req, res) => {
  const role = String(req.query.role || "").trim().toLowerCase();
  const userId = String(req.query.userId || "").trim();

  let result = sessions;

  if (role === "student") {
    result = sessions.filter((s) => {
      const st = String(s.status || "").trim().toLowerCase();
      return s.studentId === userId && st !== "canceled";
    });
  } else if (role === "tutor") {
    result = sessions.filter((s) => s.tutorId === userId);
  }

  res.json(result);
});


// ===== CANCEL SESSION =====
app.patch("/api/sessions/:id/cancel", (req, res) => {
  const session = sessions.find(s => s.id === req.params.id);

  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

// 1) mark session canceled
session.status = "Canceled";

// 2) release slot ưu tiên theo slotId
let targetSlot = null;

if (session.slotId) {
  targetSlot = slots.find(sl => sl.id === session.slotId);
}

// fallback (nếu session cũ không có slotId)
if (!targetSlot) {
  const norm = (v) => String(v || "").trim().toLowerCase();
  targetSlot = slots.find((sl) =>
    sl.tutorId === session.tutorId &&
    norm(sl.date) === norm(session.date) &&
    norm(sl.time) === norm(session.time) &&
    norm(sl.subject) === norm(session.subject) &&
    norm(sl.mode) === norm(session.mode) &&
    norm(sl.studentId) === norm(session.studentId)
  );
}

if (targetSlot) {
  targetSlot.isBooked = false;
  targetSlot.studentId = null;
}

res.json({ session, slot: targetSlot || null });
});

// ===== TUTORS =====
app.get('/api/tutors', (req, res) => {
  const tutors = users.filter((u) => u.role === 'tutor');
  res.json(tutors);
});

// GET tất cả tutor (cũ)

// ➕ GET các slot của 1 tutor
app.get('/api/tutors/:id/slots', (req, res) => {
  const { id } = req.params;
  const tutorSlots = slots.filter((s) => s.tutorId === id);
  res.json(tutorSlots);
});

// ➕ TUTOR TẠO SLOT MỚI
app.post('/api/tutors/:id/slots', (req, res) => {
  const { id } = req.params;              // tutorId
  const { date, time, subject, mode } = req.body;

  if (!date || !time || !subject) {
    return res
      .status(400)
      .json({ message: 'date, time, subject are required' });
  }

  const slot = {
    id: `slot_${Date.now()}`,
    tutorId: id,
    date,
    time,
    subject,
    mode: mode || 'Online',
    isBooked: false,
    studentId: null,
  };

  slots.push(slot);
  res.status(201).json(slot);
});



// ➕ BOOK 1 SLOT
app.post('/api/tutors/:id/slots/:slotId/book', (req, res) => {
  const { id, slotId } = req.params;
  const { studentId } = req.body;

  const slot = slots.find(
    (s) => s.id === slotId && s.tutorId === id
  );

  if (!slot) {
    return res.status(404).json({ message: 'Slot not found' });
  }

  if (slot.isBooked) {
    return res.status(400).json({ message: 'Slot already booked' });
  }

  if (!studentId) {
    return res.status(400).json({ message: 'studentId is required' });
  }

  // Cập nhật slot
  slot.isBooked = true;
  slot.studentId = studentId;

  // Đồng thời tạo 1 session mới để dashboard/schedule thấy được
  const newSession = {
    id: `sess_${Date.now()}`,
    slotId: slot.id,
    date: slot.date,
    time: slot.time,
    tutorId: slot.tutorId,
    studentId,
    subject: slot.subject,
    mode: slot.mode,
    status: 'Scheduled',
  };
  sessions.push(newSession);

  res.json({
    message: 'Booked successfully',
    slot,
    session: newSession,
  });
});

// ===== FEEDBACK =====

// Lấy feedback theo tutor hoặc student (tùy query)
app.get('/api/feedback', (req, res) => {
  const { tutorId, studentId } = req.query;

  let result = feedbacks;
  if (tutorId) {
    result = result.filter((f) => f.tutorId === tutorId);
  }
  if (studentId) {
    result = result.filter((f) => f.studentId === studentId);
  }
  res.json(result);
});

// Tạo mới feedback
app.post('/api/feedback', (req, res) => {
  const { sessionId, tutorId, studentId, rating, comment } = req.body;

  if (!sessionId || !tutorId || !studentId) {
    return res.status(400).json({ message: 'sessionId, tutorId, studentId are required' });
  }

  const r = Number(rating);
  if (Number.isNaN(r) || r < 1 || r > 5) {
    return res.status(400).json({ message: 'rating must be between 1 and 5' });
  }

  // (optional) check session tồn tại
  const sess = sessions.find((s) => s.id === sessionId);
  if (!sess) {
    return res.status(400).json({ message: 'Session not found' });
  }

  const fb = {
    id: `fb_${Date.now()}`,
    sessionId,
    tutorId,
    studentId,
    rating: r,
    comment: comment || '',
    createdAt: new Date().toISOString(),
  };
  feedbacks.push(fb);

  res.status(201).json(fb);
});


// ===== RESOURCES =====
app.get('/api/resources', (req, res) => {
  res.json(resources);
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
