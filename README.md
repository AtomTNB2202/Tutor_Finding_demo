# Tutor Finding Demo 🧑‍🎓🧑‍🏫

Demo giao diện web cho hệ thống **Tutor Support / Tutor Finding**, mô phỏng hai kiểu tài khoản:
- **Student**: xem tổng quan học tập, lịch hẹn, tài liệu học.
- **Tutor**: xem lịch dạy, các buổi support của riêng mình.

Toàn bộ hệ thống chỉ dùng **HTML + CSS + JavaScript (fake database)**, không cần backend hay database thật.

---

## 🗂 Cấu trúc project

```bash
Tutor_Finding_demo/
├── index.html          # Trang login
├── css/
│   └── style.css       # Giao diện chung (Material-style)
├── js/
│   ├── fake-db.js      # Fake database: users, tutors, sessions, resources
│   └── main.js         # Logic login, route trang, render Dashboard/Schedule/...
├── pages/
│   ├── dashboard.html  # Dashboard chính sau khi login
│   ├── schedule.html   # Lịch học / lịch dạy
│   ├── mentee-info.html# Danh sách tutor / mentee (tùy role)
│   ├── resources.html  # Học liệu (slides, article, video, ...)
│   └── profile.html    # Trang profile người dùng
└── partials/
    └── sidebar.html    # Sidebar dùng chung các trang trong /pages
⚙️ Yêu cầu môi trường
Vì project có dùng fetch() để load partials/sidebar.html, bạn không nên mở file bằng cách double–click.

Khuyến nghị:

VS Code

Extension: Live Server (tác giả: Ritwick Dey)

Hoặc bất kỳ static web server nào (nginx, http-server, serve, …) nếu bạn quen dùng.

🚀 Cách chạy project bằng VS Code + Live Server
Clone repo (hoặc tải ZIP rồi giải nén):

bash
Sao chép mã
git clone https://github.com/AtomTNB2202/Tutor_Finding_demo.git
cd Tutor_Finding_demo
Mở folder bằng VS Code

File → Open Folder… → chọn Tutor_Finding_demo

Cài extension Live Server (nếu chưa có)

Mở tab Extensions (Ctrl + Shift + X)

Tìm: Live Server – tác giả Ritwick Dey → Install

Chạy Live Server

Chuột phải vào file index.html → Open with Live Server

Trình duyệt sẽ mở, dạng URL:
http://127.0.0.1:5500/index.html
(hoặc http://localhost:5500/index.html)

🎉 Giao diện login xuất hiện → sẵn sàng để test account.

👤 Tài khoản demo
Hệ thống không kiểm tra mật khẩu thật, chỉ cần:

Email phải là @hcmut.edu.vn

Password không được để trống

🔵 Student demo
Bạn có thể dùng bất kỳ email HCMUT nào không trùng email tutor, ví dụ:

khoi@hcmut.edu.vn

student1@hcmut.edu.vn

Mật khẩu: nhập gì cũng được (ví dụ 123456).

Khi login bằng email kiểu này:

Role: student

Dashboard: thấy toàn bộ các buổi hỗ trợ (sessions) trong fake database.

Schedule: lịch học sinh viên.

Mentee Info: danh sách tutor.

Resources: danh sách tài liệu học.

Profile: xem/chỉnh thông tin cơ bản (demo).

🟣 Tutor demo
Trong js/fake-db.js đã cấu hình sẵn một số tutor, ví dụ:

tutor.thoai@hcmut.edu.vn

tutor.huy@hcmut.edu.vn

Mật khẩu: nhập gì cũng được (miễn không để trống).

Khi login bằng email trùng với một tutor:

Role: tutor

Dashboard & Schedule: chỉ hiện các session mà tutor đó phụ trách (lọc theo tutorId).

Có thể dùng để demo góc nhìn của tutor so với student.

🧭 Flow sử dụng nhanh
1. Login
Truy cập http://127.0.0.1:5500/index.html

Nhập:

Email student hoặc tutor @hcmut.edu.vn

Password tùy ý (không rỗng)

Nhấn Sign in → chuyển sang pages/dashboard.html

2. Dashboard
Thấy “Welcome back, {Tên} 👋”

Thông tin current user: avatar, major, GPA, credits (hoặc — nếu là tutor)

KPI: số sessions, feedback,… (fake theo dữ liệu demo)

Bảng Upcoming Sections: danh sách buổi học / buổi support sắp diễn ra

Nút Cancel minh hoạ hủy lịch (chỉ cập nhật trên fake DB, không gọi API thật).

3. Schedule
Liệt kê tất cả các buổi:

Student → thấy tất cả buổi của mình

Tutor → chỉ thấy buổi mình dạy

Có nút Cancel tương tự Dashboard.

4. Mentee Information
Danh sách tutor (avatar + tên + môn).

Nút View Availability → popup alert xem các slot rảnh (demo từ fake-db.js).

5. Learning Resources
Card danh sách tài liệu (PDF / Article / Video).

Search/filter đơn giản bằng JavaScript.

Nút Preview / View: mở modal hoặc link demo (fake link).

6. Profile
Hiển thị thông tin người đang login (student/tutor).

Có form để chỉnh: name, email, major, GPA, credits, avatar URL,… (demo).

Nút Save chỉ hiển thị alert, không gọi API thật.

🧪 Ghi chú cho việc demo / báo cáo
Đây là front-end demo: không có server-side auth hay database thật.

“Database” được mô phỏng trong js/fake-db.js (danh sách user, tutor, sessions, resources, feedback…).

Logic phân role:

Login: nếu email trùng với một tutor trong fake-db.js → role = tutor

Ngược lại → role = student

Thông tin login + role được lưu trong localStorage, sau đó được phục hồi khi load các trang trong /pages.

🧩 TODO / Hướng phát triển
Kết nối với backend thật (Node.js / FastAPI / …).

Thêm chức năng booking tutor (student chọn slot → gửi request).

Thêm chức năng feedback sau buổi học.

Thêm phân quyền UI rõ ràng giữa student / tutor / admin.
