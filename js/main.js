// ======================================================
// MAIN.JS — FULL DEMO ENGINE FOR ALL PAGES
// ======================================================
const API_BASE = 'http://localhost:4000';
console.log("MAIN.JS ĐÃ LOAD");
let resourceCache = [];

const mockAnnouncements = [
  { status: "Active", color: "green", text: "Midterm exam on 10/11 – 13/11" },
  { status: "Pending", color: "yellow", text: "New learning materials uploaded" },
  { status: "Urgent", color: "red", text: "System maintenance at 23:00" },
];

const mockProgress = 80; // %

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM READY");

  // ==== LOGIN (trang index.html) ====
  // ==== LOGIN (trang index.html) ====
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const pwd   = document.getElementById("password").value.trim();

    if (!email.endsWith("@hcmut.edu.vn")) {
      alert("Please use your HCMUT email (e.g. name@hcmut.edu.vn)");
      return;
    }
    if (!pwd) {
      alert("Please enter password");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pwd }),
      });

      if (!res.ok) {
        alert("Invalid email or password");
        return;
      }

      const user = await res.json();
      // Lưu user cho các trang khác dùng
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userId",  user.id);

      if (user.role === "tutor") {
        location.href = "pages/tutor-dashboard.html";
      } else {
        location.href = "pages/dashboard.html";
      }
    } catch (err) {
      console.error(err);
      alert("Cannot connect to server");
    }
  });
}


let currentUser = null;
const stored = localStorage.getItem("currentUser");
if (!loginForm && stored) {        // chỉ ở các trang trong /pages
  try {
    currentUser = JSON.parse(stored);
  } catch (e) {
    console.error("Cannot parse currentUser from localStorage", e);
  }
}


  // ==== ROUTING CHO CÁC PAGE KHÁC ====
  const page = location.pathname.split("/").pop(); // <-- FIX: khai báo page

  if (page === "dashboard.html") loadDashboard();
  if (page === "schedule.html") loadSchedule();
  if (page === "mentee-info.html") loadTutorsPage();
  if (page === "resources.html") loadResourcesPage();
  if (page === "profile.html") loadProfilePage();

  if (page === "tutor-dashboard.html") loadTutorDashboard();
  if (page === "tutor-schedule.html")  loadTutorSchedule();
  if (page === "tutor-mentees.html")   loadTutorMentees();
  if (page === "tutor-resources.html") loadTutorResources();
  if (page === "tutor-profile.html")   loadTutorProfile();
});

// ======================================================
// DASHBOARD
// ======================================================
async function loadDashboard() {
  // Lấy user từ localStorage
  const raw = localStorage.getItem("currentUser");
  if (!raw) {
    location.href = "../index.html";
    return;
  }
  const user = JSON.parse(raw);

  const welcome = document.getElementById("welcomeTitle");
  if (welcome) welcome.textContent = `Welcome back, ${user.name} 👋`;

  const avatar = document.getElementById("studentAvatar");
  if (avatar) avatar.src = user.avatar;

  const majorEl   = document.getElementById("summaryMajor");
  const gpaEl     = document.getElementById("summaryGPA");
  const creditsEl = document.getElementById("summaryCredits");
  if (majorEl)   majorEl.textContent   = user.major || "—";
  if (gpaEl)     gpaEl.textContent     = user.gpa ?? "—";
  if (creditsEl) creditsEl.textContent = user.credits ?? "—";

  // Gọi API lấy sessions theo role + userId
  const res = await fetch(
    `${API_BASE}/api/sessions?role=${user.role}&userId=${user.id}`
  );
  let sessions = await res.json();
  if ((user.role || "").toLowerCase().trim() === "student") {
    sessions = sessions.filter(s => String(s.status || "").trim().toLowerCase() !== "canceled");
  }

  // Đếm feedback cho student
  let fbCount = 0;
  if (user.role === "student") {
    try {
      const fbRes = await fetch(`${API_BASE}/api/feedback?studentId=${user.id}`);
      if (fbRes.ok) {
        const fbs = await fbRes.json();
        fbCount = Array.isArray(fbs) ? fbs.length : 0;
      }
    } catch (e) {
      console.warn("Cannot load feedback count", e);
    }
  }

  // KPI cơ bản
  animateCounter("kpiCourses",  0, 0,               800);
  animateCounter("kpiSections", 0, sessions.length, 800);
  animateCounter("kpiFeedback", 0, fbCount,         800);

  // Bảng Upcoming sections
  const tb = document.querySelector("#upcomingTable tbody");
  if (tb) {
    tb.innerHTML = "";
    sessions.forEach((s) => {
      tb.innerHTML += `
        <tr>
          <td>${s.date}</td>
          <td>${s.time}</td>
          <td>${s.tutorId}</td>
          <td>${s.subject}</td>
          <td>${s.mode}</td>
          <td>
            <button class="btn outline" onclick="cancelSession('${s.id}')">
              Cancel
            </button>
          </td>
        </tr>`;
    });
  }


  // Donut + announcements vẫn giữ như cũ nếu bạn thích
  const percentEl = document.getElementById("progressPercent");
  if (percentEl) percentEl.textContent = mockProgress + "%";
  drawDonut("progressDonut", mockProgress);

  const ann = document.getElementById("announcementList");
  if (ann) {
    ann.innerHTML = mockAnnouncements
      .map(
        (a) =>
          `<li><span class="badge ${a.color}">${a.status}</span> ${a.text}</li>`
      )
      .join("");
  }
}



async function cancelSession(id) {
  try {
    const res = await fetch(`${API_BASE}/api/sessions/${id}/cancel`, {
      method: "PATCH",
    });

    if (!res.ok) {
      alert("Cancel failed");
      return;
    }

    const page = location.pathname.split("/").pop();
    if (page === "dashboard.html") return loadDashboard();
    if (page === "schedule.html") return loadSchedule();

    // tutor pages
    if (page === "tutor-dashboard.html") return loadTutorDashboard();
    if (page === "tutor-schedule.html") return loadTutorSchedule();

  } catch (err) {
    console.error(err);
    alert("Cannot connect to server");
  }
}



async function giveFeedback(sessionId, tutorId) {
  const rawUser = localStorage.getItem("currentUser");
  if (!rawUser) {
    alert("Please login again.");
    location.href = "../index.html";
    return;
  }
  const user = JSON.parse(rawUser);

  if (user.role !== "student") {
    alert("Only students can give feedback in this demo.");
    return;
  }

  const ratingStr = prompt("Rate this session (1-5):");
  if (!ratingStr) return;

  const rating = Number(ratingStr);
  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    alert("Rating must be a number from 1 to 5.");
    return;
  }

  const comment = prompt("Any comments for the tutor? (optional)") || "";

  try {
    const res = await fetch(`${API_BASE}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        tutorId,
        studentId: user.id,
        rating,
        comment,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data.message || "Failed to submit feedback.");
      return;
    }

    alert("Thank you! Your feedback has been submitted.");
  } catch (err) {
    console.error(err);
    alert("Cannot connect to server.");
  }
}


function animateCounter(id, from, to, dur) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const val = Math.floor(from + (to - from) * p);
    el.textContent = val;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function drawDonut(canvasId, percent) {
  const c = document.getElementById(canvasId);
  if (!c || !c.getContext) return;
  const ctx = c.getContext("2d");
  const cx = c.width / 2,
    cy = c.height / 2,
    r = 90,
    lw = 22;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.lineWidth = lw;
  // Base
  ctx.strokeStyle = "#e5e7eb";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  // Progress
  ctx.lineCap = "round";
  ctx.strokeStyle = "#1488D8";
  ctx.beginPath();
  const start = -Math.PI / 2;
  const end = start + Math.PI * 2 * (percent / 100);
  ctx.arc(cx, cy, r, start, end);
  ctx.stroke();
}

// ======================================================
// SCHEDULE PAGE
// ======================================================
async function loadSchedule() {
  const raw = localStorage.getItem("currentUser");
  if (!raw) {
    alert("Please login again.");
    location.href = "../index.html";
    return;
  }

  const user = JSON.parse(raw);

  // gọi API lấy session đúng role
  const res = await fetch(
    `${API_BASE}/api/sessions?role=${user.role}&userId=${user.id}`
  );
  let sessions = await res.json();
  if ((user.role || "").toLowerCase().trim() === "student") {
    sessions = sessions.filter(s => String(s.status || "").trim().toLowerCase() !== "canceled");
  }

  const tb = document.querySelector("#scheduleTable tbody");
  if (!tb) return;
  tb.innerHTML = "";

  sessions.forEach((s) => {
    tb.innerHTML += `
      <tr>
        <td>${s.date}</td>
        <td>${s.time}</td>
        <td>${s.tutorId}</td>
        <td>${s.subject}</td>
        <td>${s.mode}</td>
        <td>
          <button type="button" class="btn outline small"
                  onclick="cancelSession('${s.id}')">
            Cancel
          </button>
          <button type="button" class="btn small"
                  onclick="giveFeedback('${s.id}', '${s.tutorId}')">
            Feedback
          </button>
        </td>
      </tr>`;
  });
}




// ======================================================
// MENTEE INFO / TUTORS PAGE
// ======================================================
async function loadTutorsPage() {
  const wrap = document.getElementById("tutorList");
  if (!wrap) return;

  wrap.innerHTML = "<p class='muted'>Loading tutors...</p>";

  try {
    const res = await fetch(`${API_BASE}/api/tutors`);
    if (!res.ok) {
      wrap.innerHTML = "<p class='text-error'>Failed to load tutors.</p>";
      return;
    }

    const tutors = await res.json();
    if (!Array.isArray(tutors) || tutors.length === 0) {
      wrap.innerHTML = "<p class='muted'>No tutors found.</p>";
      return;
    }

    wrap.innerHTML = "";
    tutors.forEach((t) => {
      wrap.innerHTML += `
        <article class="card lift-on-hover">
          <img class="avatar" src="${t.avatar || "https://i.pravatar.cc/100"}" alt="${t.name}"/>
          <h3>${t.name}</h3>
          <p class="muted">${t.major || t.subject || "Tutor"}</p>
          <p class="muted small">${t.email}</p>
          <button class="btn" onclick="viewTutor('${t.id}')">View Availability</button>
        </article>
      `;
    });
  } catch (err) {
    console.error(err);
    wrap.innerHTML = "<p class='text-error'>Error loading tutors.</p>";
  }
}

// ======================================================
// TUTOR PORTAL
// ======================================================

async function loadTutorDashboard() {
  const raw = localStorage.getItem("currentUser");
  if (!raw) {
    location.href = "../index.html";
    return;
  }
  const user = JSON.parse(raw);
  if (user.role !== "tutor") {
    location.href = "./dashboard.html";
    return;
  }

  // fill header
  const welcome = document.getElementById("welcomeTitle");
  if (welcome) welcome.textContent = `Welcome back, ${user.name} 👋`;

  const avatar = document.getElementById("tutorAvatar");
  if (avatar) avatar.src = user.avatar;

  // (có cũng được, không có thì thôi)
  const majorEl   = document.getElementById("summaryMajor");
  const gpaEl     = document.getElementById("summaryGPA");
  const creditsEl = document.getElementById("summaryCredits");
  if (majorEl)   majorEl.textContent   = user.major || "—";
  if (gpaEl)     gpaEl.textContent     = user.gpa ?? "—";
  if (creditsEl) creditsEl.textContent = user.credits ?? "—";

  // lấy tất cả sessions của tutor
  const res = await fetch(
    `${API_BASE}/api/sessions?role=tutor&userId=${user.id}`
  );
  const sessions = await res.json();

  // mentees in progress = số studentId khác nhau
  const menteeIds = new Set(sessions.map((s) => s.studentId));
  const menteeCount = menteeIds.size;

  const incomingCount = sessions.length;

  // feedback của tutor
  let fbCount = 0;
  try {
    const fbRes = await fetch(`${API_BASE}/api/feedback?tutorId=${user.id}`);
    if (fbRes.ok) {
      const fbs = await fbRes.json();
      fbCount = Array.isArray(fbs) ? fbs.length : 0;
    }
  } catch (e) {
    console.warn("Cannot load tutor feedback count", e);
  }

  // KPI
  animateCounter("kpiMentees",       0, menteeCount,  800);
  animateCounter("kpiIncoming",      0, incomingCount, 800);
  animateCounter("kpiFeedbackTutor", 0, fbCount,      800);

  // ===== NEW: Donut Progress + % =====
  // tạm coi những session có status === 'Completed' là đã xong
  const completed = sessions.filter(s => s.status === "Completed").length;
  const totalForProgress = sessions.length || 1;
  const percent = Math.round((completed / totalForProgress) * 100);

  const percentEl = document.getElementById("progressPercentTutor");
  if (percentEl) percentEl.textContent = `${percent}%`;

  // vẽ donut ở canvas id="progressDonutTutor"
  drawDonut("progressDonutTutor", percent);

  // ===== Bảng Upcoming Sections =====
  const tb = document.querySelector("#tutorUpcomingTable tbody");
  if (tb) {
    tb.innerHTML = "";
    sessions.forEach((s) => {
      tb.innerHTML += `
        <tr>
          <td>${s.date}</td>
          <td>${s.time}</td>
          <td>${s.studentId}</td>
          <td>${s.subject}</td>
          <td>${s.mode}</td>
          <td>
            <button class="btn outline small"
                    onclick="cancelSession('${s.id}')">
              Cancel
            </button>
          </td>
        </tr>`;
    });
  }

  // ===== NEW: Recent Activity list =====
  const act = document.getElementById("tutorActivityList");
  if (act) {
    // lấy 3 session mới nhất (theo id/time, ở đây mình chỉ slice)
    const recent = sessions.slice(-3).reverse();
    act.innerHTML = recent.map(s => `
      <li>
        <strong>${s.date} ${s.time}</strong> – Session with
        <span class="tag">${s.studentId}</span> (${s.subject})
      </li>`).join("");
  }

  // Announcements (re-use mock)
  const ann = document.getElementById("tutorAnnouncementList");
  if (ann) {
    ann.innerHTML = mockAnnouncements
      .map(a =>
        `<li><span class="badge ${a.color}">${a.status}</span> ${a.text}</li>`
      )
      .join("");
  }
}

async function loadTutorSchedule() {
  const raw = localStorage.getItem("currentUser");
  if (!raw) {
    alert("Please login again.");
    location.href = "../index.html";
    return;
  }
  const user = JSON.parse(raw);
  if (user.role !== "tutor") {
    location.href = "./schedule.html";
    return;
  }

  // 1) Lấy sessions của tutor
  const res = await fetch(
    `${API_BASE}/api/sessions?role=tutor&userId=${user.id}`
  );
  const sessions = await res.json();

  const tb = document.querySelector("#tutorScheduleTable tbody");
  if (tb) {
    tb.innerHTML = "";
    sessions.forEach((s) => {
      tb.innerHTML += `
        <tr>
          <td>${s.date}</td>
          <td>${s.time}</td>
          <td>${s.studentId}</td>
          <td>${s.subject}</td>
          <td>${s.mode}</td>
          <td>${s.status || "Scheduled"}</td>
        </tr>`;
    });
  }

  // 2) Lấy slots (availability) của tutor
  try {
    const slotRes = await fetch(
      `${API_BASE}/api/tutors/${user.id}/slots`
    );
    if (slotRes.ok) {
      const slots = await slotRes.json();
      const slotBody = document.querySelector(
        "#tutorSlotTable tbody"
      );
      if (slotBody) {
        slotBody.innerHTML = "";
        slots.forEach((s) => {
          slotBody.innerHTML += `
            <tr>
              <td>${s.date}</td>
              <td>${s.time}</td>
              <td>${s.subject}</td>
              <td>${s.mode}</td>
              <td>${s.isBooked ? "Booked" : "Free"}</td>
              <td>${s.studentId || "-"}</td>
            </tr>`;
        });
      }
    }
  } catch (e) {
    console.error("Cannot load slots", e);
  }

  // mặc định mở tab Sessions
  switchTutorScheduleTab("sessions");
}


// dùng sessions của tutor để build bảng mentee tracking
async function loadTutorMentees() {
  const raw = localStorage.getItem("currentUser");
  if (!raw) {
    location.href = "../index.html";
    return;
  }
  const user = JSON.parse(raw);
  if (user.role !== "tutor") {
    location.href = "./dashboard.html";
    return;
  }

  const res = await fetch(
    `${API_BASE}/api/sessions?role=tutor&userId=${user.id}`
  );
  const sessions = await res.json();

  // gom theo studentId
  const byStudent = {};
  sessions.forEach((s) => {
    if (!byStudent[s.studentId]) {
      byStudent[s.studentId] = { sessions: 0, subject: s.subject };
    }
    byStudent[s.studentId].sessions += 1;
  });

  // nhớ trong tutor-mentees.html đặt table id="tutorMenteeTable"
  const tb = document.querySelector("#tutorMenteeTable tbody");
  if (!tb) return;
  tb.innerHTML = "";

  Object.entries(byStudent).forEach(([studentId, info]) => {
    tb.innerHTML += `
      <tr>
        <td>${studentId}</td>
        <td>${info.subject}</td>
        <td>${info.sessions}</td>
        <td>—</td>
        <td>
          <button class="btn small" onclick="alert('View detail for ${studentId} (demo)')">
            View
          </button>
        </td>
      </tr>`;
  });
}

// tạm thời reuse resources/profile của student cho tutor
let _tutorResourcesCache = [];

async function loadTutorResources() {
  const raw = localStorage.getItem("currentUser");
  if (!raw) {
    location.href = "../index.html";
    return;
  }
  const user = JSON.parse(raw);
  if (user.role !== "tutor") {
    location.href = "./resources.html";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/resources`);
    if (!res.ok) throw new Error("Cannot load resources");
    const data = await res.json();
    _tutorResourcesCache = Array.isArray(data) ? data : [];

    renderTutorResources(_tutorResourcesCache);
  } catch (e) {
    console.error(e);
  }
}

async function loadTutorProfile() {
  const raw = localStorage.getItem("currentUser");
  if (!raw) {
    location.href = "../index.html";
    return;
  }
  const user = JSON.parse(raw);
  if (user.role !== "tutor") {
    // nếu student cố mở trang tutor profile thì đá về profile thường
    location.href = "./profile.html";
    return;
  }

  // === Fill basic info ===
  const nameEl   = document.getElementById("profNameTutor");
  const emailEl  = document.getElementById("profEmailTutor");
  const majorEl  = document.getElementById("profMajorTutor");
  const avatarEl = document.getElementById("profAvatarTutor");
  const idEl     = document.getElementById("profIdTutor");

  if (nameEl)   nameEl.textContent   = user.name;
  if (emailEl)  emailEl.textContent  = user.email;
  if (majorEl)  majorEl.textContent  = `Major: ${user.major || "—"}`;
  if (avatarEl) avatarEl.src         = user.avatar;
  if (idEl)     idEl.textContent     = `Tutor ID: ${user.id}`;

  // === Load sessions & feedback ===
  let sessions = [];
  let feedbacks = [];

  try {
    const sRes = await fetch(
      `${API_BASE}/api/sessions?role=tutor&userId=${user.id}`
    );
    if (sRes.ok) {
      sessions = await sRes.json();
    }
  } catch (e) {
    console.error("Cannot load tutor sessions", e);
  }

  try {
    const fRes = await fetch(
      `${API_BASE}/api/feedback?tutorId=${user.id}`
    );
    if (fRes.ok) {
      feedbacks = await fRes.json();
    }
  } catch (e) {
    console.error("Cannot load tutor feedback", e);
  }

  // mentees = số studentId khác nhau
  const menteeIds = new Set(sessions.map((s) => s.studentId));
  const menteeCount = menteeIds.size;

  // sessions done: status === Completed (nếu không có thì dùng tổng số)
  const completedSessions = sessions.filter(
    (s) => s.status === "Completed"
  ).length || sessions.length;

  // average rating
  let avgRating = 0;
  if (feedbacks.length) {
    const sum = feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0);
    avgRating = sum / feedbacks.length;
  }

  // KPI
  animateCounter("tutorProfMentees", 0, menteeCount, 800);
  animateCounter("tutorProfSessions", 0, completedSessions, 800);

  const ratingEl = document.getElementById("tutorProfRating");
  if (ratingEl) {
    ratingEl.textContent = feedbacks.length
      ? avgRating.toFixed(1)
      : "—";
  }

  // === Session history table ===
  const ratingBySession = {};
  feedbacks.forEach((fb) => {
    if (fb.sessionId) {
      ratingBySession[fb.sessionId] = fb.rating;
    }
  });

  const tbody = document.querySelector(
    "#tutorProfileHistoryTable tbody"
  );
  if (tbody) {
    if (!sessions.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center muted">
        No sessions yet.
      </td></tr>`;
    } else {
      tbody.innerHTML = "";
      sessions.forEach((s) => {
        const rating = ratingBySession[s.id] ?? "-";
        tbody.innerHTML += `
          <tr>
            <td>${s.date}</td>
            <td>${s.time}</td>
            <td>${s.studentId}</td>
            <td>${s.subject}</td>
            <td>${s.mode}</td>
            <td>${s.status || "Scheduled"}</td>
            <td>${rating}</td>
          </tr>`;
      });
    }
  }
}


function renderTutorResources(list) {
  const tbody = document.querySelector("#tutorResourceTable tbody");
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center muted">
      No resources found.
    </td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  list.forEach((r) => {
    tbody.innerHTML += `
      <tr>
        <td>${r.title}</td>
        <td>${r.subject || "-"}</td>
        <td>${r.type || "-"}</td>
        <td>${r.level || "All"}</td>
        <td>${r.updatedAt || "-"}</td>
        <td>
          <button class="btn tiny outline"
                  onclick="window.open('${r.url || "#"}','_blank')">
            Open
          </button>
        </td>
      </tr>`;
  });
}

function filterTutorResources() {
  const q   = document.getElementById("tutorResSearch")?.value
                .toLowerCase().trim() || "";
  const typ = document.getElementById("tutorResType")?.value || "";

  const filtered = _tutorResourcesCache.filter((r) => {
    const matchText =
      !q ||
      (r.title && r.title.toLowerCase().includes(q)) ||
      (r.subject && r.subject.toLowerCase().includes(q));

    const matchType =
      !typ || (r.type && r.type.toLowerCase() === typ.toLowerCase());

    return matchText && matchType;
  });

  renderTutorResources(filtered);
}



async function viewTutor(tutorId) {
  const rawUser = localStorage.getItem("currentUser");
  if (!rawUser) {
    alert("Please login again.");
    location.href = "../index.html";
    return;
  }
  const user = JSON.parse(rawUser);

  if (user.role !== "student") {
    alert("Only students can book slots in this demo.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/tutors/${tutorId}/slots`);
    if (!res.ok) {
      alert("Failed to load slots.");
      return;
    }

    const slots = await res.json();
    if (!Array.isArray(slots) || slots.length === 0) {
      alert("This tutor has no available slots.");
      return;
    }

    // Tạo message danh sách slot
    let msg = `Available slots for ${tutorId}:\n\n`;
    slots.forEach((s, idx) => {
      msg += `${idx + 1}. ${s.date} ${s.time} (${s.mode}) - ${
        s.isBooked ? "BOOKED" : "FREE"
      }\n`;
    });

    const choice = prompt(
      msg + "\nEnter the number of the slot you want to book (or leave blank to cancel):"
    );
    if (!choice) return;

    const index = parseInt(choice, 10) - 1;
    if (Number.isNaN(index) || index < 0 || index >= slots.length) {
      alert("Invalid choice.");
      return;
    }

    const slot = slots[index];
    if (slot.isBooked) {
      alert("Sorry, that slot is already booked.");
      return;
    }

    await bookSlot(tutorId, slot.id, user.id);
  } catch (err) {
    console.error(err);
    alert("Error while loading slots.");
  }
}

async function bookSlot(tutorId, slotId, studentId) {
  try {
    const res = await fetch(
      `${API_BASE}/api/tutors/${tutorId}/slots/${slotId}/book`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data.message || "Booking failed.");
      return;
    }

    alert("Booking successful! This session has been added to your schedule.");
    // optional: chuyển sang Schedule để xem kết quả
    // location.href = "./schedule.html";
  } catch (err) {
    console.error(err);
    alert("Cannot connect to server.");
  }
}


// ======================================================
// RESOURCES PAGE
// ======================================================
async function loadResourcesPage() {
  const wrap = document.getElementById("resList");
  if (wrap) {
    wrap.innerHTML = "<p class='muted'>Loading resources...</p>";
  }

  try {
    const res = await fetch(`${API_BASE}/api/resources`);
    if (!res.ok) {
      if (wrap) wrap.innerHTML = "<p class='text-error'>Failed to load resources.</p>";
      return;
    }

    resourceCache = await res.json();
    renderResources();  // render lần đầu sau khi load
  } catch (err) {
    console.error(err);
    if (wrap) wrap.innerHTML = "<p class='text-error'>Error loading resources.</p>";
  }

  const searchInput = document.getElementById("resSearch");
  if (searchInput) {
    searchInput.addEventListener("input", () => renderResources());
  }

  const filterSelect = document.getElementById("resFilter");
  if (filterSelect) {
    filterSelect.addEventListener("change", () => renderResources());
  }
}

async function registerNewSlot() {
  const raw = localStorage.getItem("currentUser");
  if (!raw) {
    alert("Please login again.");
    location.href = "../index.html";
    return;
  }
  const user = JSON.parse(raw);
  if (user.role !== "tutor") {
    alert("Only tutors can create slots.");
    return;
  }

  const dateEl    = document.getElementById("slotDate");
  const timeEl    = document.getElementById("slotTime");
  const subjEl    = document.getElementById("slotSubject");
  const modeEl    = document.getElementById("slotMode");

  const date    = dateEl?.value;
  const time    = timeEl?.value;
  const subject = subjEl?.value;
  const mode    = modeEl?.value || "Online";

  if (!date || !time || !subject) {
    alert("Please fill date, time and subject.");
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE}/api/tutors/${user.id}/slots`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, subject, mode }),
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.message || "Failed to create slot.");
      return;
    }

    alert("New slot created!");
    // clear form
    if (timeEl) timeEl.value = "";
    if (subjEl) subjEl.value = "";

    // reload bảng slot
    loadTutorSchedule();
  } catch (err) {
    console.error(err);
    alert("Cannot connect to server.");
  }
}



function renderResources() {
  const wrap = document.getElementById("resList");
  if (!wrap) return;

  let data = Array.isArray(resourceCache) ? [...resourceCache] : [];

  const qEl = document.getElementById("resSearch");
  const filterEl = document.getElementById("resFilter");

  const q = qEl ? qEl.value.toLowerCase() : "";
  const typeFilter = filterEl ? filterEl.value : "all";

  // Lọc theo search
  if (q) {
    data = data.filter((r) =>
      r.title.toLowerCase().includes(q)
    );
  }

  // Lọc theo type (PDF / Article / Video / all)
  if (typeFilter && typeFilter !== "all") {
    data = data.filter((r) => r.type === typeFilter);
  }

  if (data.length === 0) {
    wrap.innerHTML = "<p class='muted'>No resources found.</p>";
    return;
  }

  wrap.innerHTML = "";
  data.forEach((res) => {
    wrap.innerHTML += `
      <article class="card lift-on-hover">
        <img src="${res.thumbnail}" class="thumb" alt="${res.title}"/>
        <h3>${res.title}</h3>
        <p class="muted">${res.type}</p>
        <div class="row space-between">
          <button class="btn" onclick="openResource('${res.id}')">Preview</button>
          <button class="btn outline small" onclick="favoriteResource('${res.id}')">
            ☆ Favorite
          </button>
        </div>
      </article>
    `;
  });
}


function openResource(id) {
  const res = resourceCache.find((r) => r.id === id);
  if (!res) return;

  const overlay = document.getElementById("modalOverlay");
  if (!overlay) {
    // nếu không có modal, mở tab mới
    window.open(res.link || "#", "_blank");
    return;
  }

  const img   = document.getElementById("modalImg");
  const title = document.getElementById("modalTitle");
  const type  = document.getElementById("modalType");
  const open  = document.getElementById("modalOpen");

  if (img)   img.src = res.thumbnail;
  if (title) title.textContent = res.title;
  if (type)  type.textContent  = res.type;
  if (open)  open.href = res.link || "#";

  overlay.style.display = "flex";
}

function switchTutorScheduleTab(tab) {
  const secSessions = document.getElementById("tutorSessionsSection");
  const secAvail    = document.getElementById("tutorAvailabilitySection");
  const btnSessions = document.getElementById("tabSessionsBtn");
  const btnAvail    = document.getElementById("tabAvailabilityBtn");

  if (!secSessions || !secAvail) return;

  if (tab === "availability") {
    secSessions.style.display = "none";
    secAvail.style.display = "block";
    if (btnSessions) btnSessions.classList.add("outline");
    if (btnAvail) {
      btnAvail.classList.remove("outline");
    }
  } else {
    secSessions.style.display = "block";
    secAvail.style.display = "none";
    if (btnSessions) btnSessions.classList.remove("outline");
    if (btnAvail) btnAvail.classList.add("outline");
  }
}



function closeModal() {
  const overlay = document.getElementById("modalOverlay");
  if (overlay) overlay.style.display = "none";
}

// ======================================================
// PROFILE PAGE
// ======================================================
function loadProfilePage() {
  if (!window.db) return;
  const u = db.getUser();

  const profName = document.getElementById("profName");
  const profEmail = document.getElementById("profEmail");
  const profAvatar = document.getElementById("profAvatar");

  if (profName) profName.textContent = u.fullName;
  if (profEmail) profEmail.textContent = u.email;
  if (profAvatar) profAvatar.src = u.avatar;

  // form fields
  const setName = document.getElementById("setName");
  const setEmail = document.getElementById("setEmail");
  const setMajor = document.getElementById("setMajor");
  const setDOB = document.getElementById("setDOB");
  const setHome = document.getElementById("setHome");
  const setAvatarUrl = document.getElementById("setAvatarUrl");
  const setYear = document.getElementById("setYear");
  const setCredits = document.getElementById("setCredits");
  const setGPA = document.getElementById("setGPA");

  if (setName) setName.value = u.fullName;
  if (setEmail) setEmail.value = u.email;
  if (setMajor) setMajor.value = u.major;
  if (setDOB) setDOB.value = "2003-01-01";
  if (setHome) setHome.value = "Ho Chi Minh City";
  if (setAvatarUrl) setAvatarUrl.value = u.avatar;
  if (setYear) setYear.value = 2021;
  if (setCredits) setCredits.value = u.credits;
  if (setGPA) setGPA.value = u.gpa;

  if (setAvatarUrl && profAvatar) {
    setAvatarUrl.addEventListener("input", (e) => {
      profAvatar.src =
        e.target.value || "https://i.pravatar.cc/100?img=55";
    });
  }
}

function saveProfile() {
  alert("Profile updated (demo only)!");
}

window.cancelSession = cancelSession;
window.giveFeedback = giveFeedback;
window.viewTutor = viewTutor;
window.bookSlot = bookSlot;
window.switchTutorScheduleTab = switchTutorScheduleTab;
window.registerNewSlot = registerNewSlot;
window.filterTutorResources = filterTutorResources;
