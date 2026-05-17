# catre
[![Discord](https://img.shields.io/badge/Discord-Bot-7289da)](https://discord.com)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

Cập nhật thêm!

**Logic:**
  - Mỗi câu trả lời đúng được 1 tảo, lưu vào trong database với @username Discord của chính người đó
  - Đối với /cheat, bot sẽ kiểm tra trong database xem @username Discord đã có điểm chưa? Nếu chưa thì thông báo "Còn cái nịt" | Còn thì trực tiếp trừ 5 tảo trong database và đưa ra tin nhắn gợi ý từ cần nối tiếp theo trong tu_dien.js

**Lệnh:**
  - [ ] slash `/noi-tu` bắt đầu chơi
  - [ ] slash `/check` kiểm tra từ đó đã có trong từ điển không, dùng cho mem khi muốn đóng góp từ nối
  - [ ] slash `/cheat` dùng số điểm đã tích lũy trong tài khoản CÁ CON để được bot gợi ý từ nối với 5 tảo mỗi lượt.
  - [ ] slash `/cacon` kiểm tra số tảo trong tk cá con được tạo trong database với @username Discord
> 📌 *Note:* `index.js` mik chỉ mới code đọc file từ điển. Nhờ ní thêm logic xử lý tương tác bên trên.
