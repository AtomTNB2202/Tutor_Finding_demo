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

      location.href = "pages/dashboard.html";
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
  const sessions = await res.json();

  // KPI cơ bản
  animateCounter("kpiCourses",  0, 0,                800);
  animateCounter("kpiSections", 0, sessions.length,  800);
  animateCounter("kpiFeedback", 0, 0,                800); // tạm thời 0

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
    alert("Session canceled!");
    location.reload();
  } catch (err) {
    console.error(err);
    alert("Cannot connect to server");
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
    location.href = "../index.html";
    return;
  }
  const user = JSON.parse(raw);

  const res = await fetch(
    `${API_BASE}/api/sessions?role=${user.role}&userId=${user.id}`
  );
  const sessions = await res.json();

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
