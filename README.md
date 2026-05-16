# catre
[![Discord](https://img.shields.io/badge/Discord-Bot-7289da)](https://discord.com)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

dự tính cho Bot gửi lời chào + gợi ý từ có thể nối tiếp dựa trên từ người dùng nhập.
**Logic:**
  - Trích xuất chữ cái cuối cùng của từ đã trả lời dùng để làm từ cần nối tiếp theo.
  - Tìm trong `tu_dien.json` xem coi người chơi trả lời có trong từ điển không? Sau đó đưa ra trường hợp True/False.
  - Gửi lời chào và đề xuất từ cần nối khi dùng /noi-tu: *"Halo! Từ bạn cần nối là: [xxx]"*.Sau khi nói, vui lòng chờ những bạn khác nối tiếp nhé!
  - Kiểm tra trong `tu_dien.json` nếu từ đã nối tức câu trả lời của ng chơi không còn từ để nối tiếp > Kết thúc game, chờ lệnh /noi-tu để chơi lại

**Lệnh:**
  - [ ] slash `/noi-tu` bắt đầu chơi
  - [ ] slash `/check` kiểm tra từ đó đã có trong từ điển không, dùng cho mem khi muốn đóng góp từ nối
> 📌 *Note:* `index.js` mik chỉ mới code đọc file từ điển. Nhờ ní thêm logic xử lý tương tác bên trên.
