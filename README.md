# Tutor Finding Demo

Đây là một demo web mô phỏng hệ thống **Tutor Support / Tutor Finding** dùng cho assignment môn SE:

- 🧑‍🎓 **Student Portal**: sinh viên đăng nhập, xem dashboard, xem lịch học, tìm tutor, đặt slot, gửi feedback sau mỗi buổi.
- 🧑‍🏫 **Tutor Portal**: tutor đăng nhập vào giao diện riêng, xem lịch dạy, tự đăng ký availability (slot), theo dõi mentee, quản lý tài liệu và xem thống kê profile.
- 🧪 **Fake backend nhưng chạy server thật**: sử dụng Node.js + Express với dữ liệu lưu tạm trong `server/data.js` (không dùng database), đủ để demo full flow end-to-end.

Hệ thống được thiết kế để **dễ cài, dễ chạy, dễ demo** trên máy cá nhân và phục vụ thuyết trình cho đồ án.

🚀 Cách chạy dự án (Local Setup)
1. Yêu cầu môi trường

Node.js ≥ 16

npm

Trình duyệt hiện đại (Chrome / Edge / Firefox)

(Khuyến nghị) VS Code + extension Live Server (Ritwick Dey)

2. Clone project
git clone https://github.com/AtomTNB2202/Tutor_Finding_demo.git
cd Tutor_Finding_demo

3. Chạy backend (fake API server)

Backend dùng Node + Express, dữ liệu lưu tạm thời trong server/data.js (không có database thật).

cd server
npm install        # cài dependencies cho backend
node server.js     # chạy backend


Nếu thành công, terminal sẽ hiển thị tương tự:

API server running at http://localhost:4000


🔄 Mỗi lần bạn sửa server.js hoặc data.js, hãy Ctrl + C để dừng server rồi chạy lại node server.js.

4. Chạy frontend (web tĩnh)

Frontend là HTML/CSS/JS thuần, có thể chạy bằng bất kỳ static server nào.

Cách 1 – Dùng VS Code + Live Server (khuyến nghị)

Quay về thư mục gốc project:

cd ..   # đang ở /server, quay lại Tutor_Finding_demo
code .  # mở project bằng VS Code


Trong VS Code:

Cài extension Live Server (tác giả: Ritwick Dey).

Click chuột phải vào file index.html → chọn “Open with Live Server”.

Trình duyệt sẽ tự mở URL dạng:

http://127.0.0.1:5500/index.html


Đây là trang Login của hệ thống.

Cách 2 – Dùng http-server (nếu không dùng VS Code)
cd Tutor_Finding_demo   # đảm bảo đang ở thư mục gốc
npm install -g http-server
http-server .


Sau đó mở trình duyệt theo link in trong terminal, ví dụ:

http://127.0.0.1:8080/index.html

5. Tài khoản demo

Các tài khoản demo được khai báo trong server/data.js. Ví dụ:

🧑‍🎓 Student

Email: khoi@hcmut.edu.vn

Mật khẩu: 123456

🧑‍🏫 Tutor

Email: tutor.thoai@hcmut.edu.vn

Mật khẩu: 123456

Nếu đăng nhập không được, hãy mở server/data.js kiểm tra lại thông tin user, chỉnh sửa nếu cần và restart backend.

6. Flow demo nhanh

Chạy backend: node server.js (port 4000).

Chạy frontend: mở index.html bằng Live Server (hoặc http-server).

Đăng nhập bằng student → xem Dashboard, Schedule, book slot, gửi feedback.

Đăng nhập bằng tutor → xem Tutor Dashboard, Schedule + Availability, Mentees, Resources, Profile.
