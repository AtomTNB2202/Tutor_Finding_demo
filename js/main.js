// ======================================================
// MAIN.JS — FULL DEMO ENGINE FOR ALL PAGES
// ======================================================
console.log("MAIN.JS ĐÃ LOAD");

const mockAnnouncements = [
  { status: "Active", color: "green", text: "Midterm exam on 10/11 – 13/11" },
  { status: "Pending", color: "yellow", text: "New learning materials uploaded" },
  { status: "Urgent", color: "red", text: "System maintenance at 23:00" },
];

const mockProgress = 80; // %

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM READY");

  // ==== LOGIN (trang index.html) ====
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value.trim();
        const pwd = document.getElementById("password").value.trim();

        if (!email.endsWith("@hcmut.edu.vn")) {
            alert("Please use your HCMUT email (e.g. name@hcmut.edu.vn)");
            return;
        }
        if (!pwd) {
            alert("Please enter password");
            return;
        }

        // Tách tên hiển thị từ email
        const rawName = email.split("@")[0].replace(/[._]/g, " ");
        const name = rawName
            .split(" ")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" ");

        // ✅ Kiểm tra xem email này là tutor hay student
        const tutor = window.fakeDB.tutors.find(t => t.email === email);

        if (tutor) {
            // ----- TUTOR -----
            fakeDB.currentUser = {
                id: tutor.id,
                role: "tutor",
                fullName: tutor.name,
                email: tutor.email,
                major: tutor.subject,
                gpa: "—",
                credits: "—",
                avatar: tutor.avatar || "https://i.pravatar.cc/120?img=40"
            };
            localStorage.setItem("userRole", "tutor");
        } else {
            // ----- STUDENT (mặc định) -----
            fakeDB.currentUser.fullName = name || fakeDB.currentUser.fullName;
            fakeDB.currentUser.email = email;
            fakeDB.currentUser.role = "student";
            localStorage.setItem("userRole", "student");
        }

        // Lưu thêm để xài cho UI nếu muốn
        localStorage.setItem("studentEmail", email);
        localStorage.setItem("studentName", name || "Student");

        // Chuyển sang dashboard
        location.href = "pages/dashboard.html";
    });
}

    // ==== KHÔI PHỤC USER TỪ LOCALSTORAGE (CHO CÁC TRANG KHÁC) ====
  if (window.fakeDB) {
      const savedRole  = localStorage.getItem("userRole");
      const savedEmail = localStorage.getItem("studentEmail");
      const savedName  = localStorage.getItem("studentName");

      if (savedRole === "tutor" && savedEmail) {
          const tutor = fakeDB.tutors.find(t => t.email === savedEmail);
          if (tutor) {
              fakeDB.currentUser = {
                  id: tutor.id,
                  role: "tutor",
                  fullName: tutor.name,
                  email: tutor.email,
                  major: tutor.subject,
                  gpa: "—",
                  credits: "—",
                  avatar: tutor.avatar || "https://i.pravatar.cc/120?img=40"
              };
          }
      } else if (savedEmail) {
          // Student
          fakeDB.currentUser.fullName = savedName || fakeDB.currentUser.fullName;
          fakeDB.currentUser.email = savedEmail;
          fakeDB.currentUser.role  = "student";
      }
  }


  // ==== ROUTING CHO CÁC PAGE KHÁC ====
  const page = location.pathname.split("/").pop(); // <-- FIX: khai báo page

  if (page === "dashboard.html") loadDashboard();
  if (page === "schedule.html") loadSchedule();
  if (page === "mentee-info.html") loadTutorsPage();
  if (page === "resources.html") loadResourcesPage();
  if (page === "profile.html") loadProfilePage();
});

// ======================================================
// DASHBOARD
// ======================================================
function loadDashboard() {
  if (!window.db) return;

  const user = db.getUser();
  let sessions = db.getSessions();

  if (user.role === "tutor") {
      sessions = sessions.filter(s => s.tutorId === user.id);
  }

  const welcome = document.getElementById("welcomeTitle");
  if (welcome) welcome.textContent = `Welcome back, ${user.fullName} 👋`;

  const avatar = document.getElementById("studentAvatar");
  if (avatar) avatar.src = user.avatar;

  const majorEl = document.getElementById("summaryMajor");
  const gpaEl = document.getElementById("summaryGPA");
  const creditsEl = document.getElementById("summaryCredits");
  if (majorEl) majorEl.textContent = user.major;
  if (gpaEl) gpaEl.textContent = user.gpa;
  if (creditsEl) creditsEl.textContent = user.credits;

  // KPI
  animateCounter("kpiCourses", 0, 0, 800);
  animateCounter("kpiSections", 0, sessions.length, 800);
  animateCounter("kpiFeedback", 0, fakeDB.feedback.length, 800);

  // Upcoming sections
  const tb = document.querySelector("#upcomingTable tbody");
  if (tb) {
    tb.innerHTML = "";
    sessions.forEach((s) => {
      const tutor = fakeDB.tutors.find((t) => t.id === s.tutorId);
      tb.innerHTML += `
        <tr>
          <td>${s.date}</td>
          <td>${s.time}</td>
          <td>${tutor ? tutor.name : "-"}</td>
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

  // Progress donut
  const percentEl = document.getElementById("progressPercent");
  if (percentEl) percentEl.textContent = mockProgress + "%";
  drawDonut("progressDonut", mockProgress);

  // Announcements
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

function cancelSession(id) {
  if (!window.db) return;
  db.cancelSession(id);
  alert("Session canceled (demo only).");
  location.reload();
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
function loadSchedule() {
  if (!window.db) return;

  const user = db.getUser();
  let sessions = db.getSessions();

  // Tutor chỉ thấy lịch của mình
  if (user.role === "tutor") {
    sessions = sessions.filter(s => s.tutorId === user.id);
  }

  const tb = document.querySelector("#scheduleTable tbody");
  if (!tb) return;
  tb.innerHTML = "";

  sessions.forEach((s) => {
    const tutor = fakeDB.tutors.find((t) => t.id === s.tutorId);
    tb.innerHTML += `
      <tr>
        <td>${s.date}</td>
        <td>${s.time}</td>
        <td>${tutor ? tutor.name : "-"}</td>
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


// ======================================================
// MENTEE INFO / TUTORS PAGE
// ======================================================
function loadTutorsPage() {
  if (!window.db) return;
  const tutors = db.getTutors();
  const wrap = document.getElementById("tutorList");
  if (!wrap) return;
  wrap.innerHTML = "";
  tutors.forEach((t) => {
    wrap.innerHTML += `
      <article class="card lift-on-hover">
        <img class="avatar" src="${t.avatar || "https://i.pravatar.cc/100"}" alt="${t.name}"/>
        <h3>${t.name}</h3>
        <p class="muted">${t.subject}</p>
        <button class="btn" onclick="viewTutor('${t.id}')">View Availability</button>
      </article>
    `;
  });
}

function viewTutor(id) {
  const tutor = fakeDB.tutors.find((t) => t.id === id);
  if (!tutor) return;
  let msg = `Availability for ${tutor.name}:\n\n`;
  tutor.availability.forEach((a) => {
    msg += `${a.date} — ${a.time} (${a.mode})\n`;
  });
  alert(msg);
}

// ======================================================
// RESOURCES PAGE
// ======================================================
function loadResourcesPage() {
  renderResources();
}

function renderResources() {
  if (!window.db) return;
  const list = db.getResources();
  const qEl = document.getElementById("resSearch");
  const q = qEl ? qEl.value.toLowerCase() : "";
  const wrap = document.getElementById("resList");
  if (!wrap) return;

  let data = list.filter((r) =>
    r.title.toLowerCase().includes(q)
  );

  wrap.innerHTML = "";
  data.forEach((res) => {
    wrap.innerHTML += `
      <article class="card lift-on-hover">
        <img src="${res.thumbnail}" class="thumb" alt="${res.title}"/>
        <h3>${res.title}</h3>
        <p class="muted">${res.type}</p>
        <button class="btn" onclick="openResource('${res.id}')">Preview</button>
      </article>
    `;
  });
}

function openResource(id) {
  const res = fakeDB.resources.find((r) => r.id === id);
  if (!res) return;
  const overlay = document.getElementById("modalOverlay");
  if (!overlay) {
    window.open(res.link || "#", "_blank");
    return;
  }
  document.getElementById("modalImg").src = res.thumbnail;
  document.getElementById("modalTitle").textContent = res.title;
  document.getElementById("modalType").textContent = res.type;
  document.getElementById("modalOpen").href = res.link || "#";
  overlay.style.display = "flex";
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
