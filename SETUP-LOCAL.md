# Chạy Chánh Điện Tịnh Tâm trên Windows (Laragon + Git Bash)

Bản fork của Kêvin dev: https://github.com/tamvinhibrand/phatonline
Mã nguồn gốc: https://github.com/kentjuno/chanh-dien-online (Kent Juno, MIT)

Các lệnh dưới đây chạy trong **Git Bash**. Ví dụ dùng thư mục `D:\laragon\www\phatonline`; đổi theo máy bạn.

## 0. Tải mã nguồn

    cd /d/laragon/www
    git clone https://github.com/tamvinhibrand/phatonline.git
    cd phatonline

## 1. Bản web tĩnh

Bật Laragon (Apache), mở:

    http://localhost/phatonline/

Không cần build hay database. Bấm vào trang một lần để trình duyệt cho phát nhạc.

## 2. Bộ LIVE (server Node)

    cd /d/laragon/www/phatonline/live
    node -v          # cần v20 trở lên
    npm install      # chỉ chạy lần đầu, hoặc sau khi git pull có đổi package.json
    npm start

Thấy dòng "Server chạy tại http://localhost:3000" là xong. Giữ cửa sổ Git Bash mở trong lúc live, Ctrl+C để tắt.

Cổng 3000 bị chiếm thì đổi cổng:

    PORT=3100 npm start

## 3. Thử khi chưa lên live

1. Mở http://localhost:3000/live/control.html
2. Bấm "Mở màn hình overlay 9:16", trong cửa sổ đó bấm "Bật âm thanh" một lần.
3. Ở bảng điều khiển bấm "Bot mô phỏng" hoặc "Đổ người mẫu 15/36/64/100".

## 4. Đưa lên TikTok LIVE

- TikTok LIVE Studio: Add source -> Window capture -> chọn cửa sổ overlay.
- OBS: Browser source, URL http://localhost:3000/live/overlay.html, kích thước 1080x1920.

Bật LIVE trên TikTok trước, rồi nhập @username vào bảng điều khiển và bấm "Kết nối".

## 5. Cập nhật

Lấy bản mới của bản fork này:

    git pull
    cd live && npm install

Lấy thêm cập nhật từ tác giả gốc (có thể xung đột ở `live/server.mjs` vì bản fork đã sửa file này):

    git remote add upstream https://github.com/kentjuno/chanh-dien-online.git   # chỉ lần đầu
    git pull upstream main

## Lưu ý

- Giọng đọc gọi dịch vụ Microsoft Edge qua mạng, máy phát phải có Internet.
- tiktok-live-connector là thư viện cộng đồng, không chính thức, có thể ngừng chạy khi TikTok đổi hệ thống.
- Server chỉ nghe 127.0.0.1. Đừng đặt biến HOST để mở ra mạng ngoài khi chưa có đăng nhập.

## 6. Lên bái

Người xem bình luận **chứa** từ khóa (mặc định: `lạy, bái, lễ Phật, được`) hoặc tặng quà đủ ngưỡng thì nhân vật đứng dậy, đi lên trước chánh điện, quỳ lạy 3 lần, bình luận hiện trên đầu, lạy xong quay về chỗ ngồi.

- **Cận cảnh (mặc định bật):** khi người lạy bắt đầu quỳ, khung hình phóng to vào trước chánh điện, nhân vật (dùng chính ảnh nam / nữ / bà / sư / ni / tiểu trong `assets/`) quỳ trên bồ đoàn, giơ hai tay chắp lên đầu rồi cúi rạp lạy về phía tượng Phật. Lời cầu hiện trên thẻ vàng lớn, cánh hoa rơi, hai thẻ hai bên tạm ẩn. Lạy xong thì thu về cảnh rộng. Mỗi lượt 1 người, người sau chờ.
- Tắt cận cảnh thì trước chánh điện có 3 chỗ lạy (chỉnh được 1–5), bình luận hiện trên đầu.
- Đông người thì xếp hàng (tối đa 10), người lạy xong đi xuống là người kế tiếp lên ngay.
- Một người không xếp hàng hai lần cùng lúc, nên bình luận từ khóa liên tục cũng chỉ được tính một lượt.
- Lên bái nhờ quà thì hiện bình luận gần nhất của người đó (trong 90 giây), chưa có thì hiện "dâng [tên quà]".
- Từ khóa có dấu thì so có dấu ("lạy" không khớp "lấy"), gõ không dấu ("lay") thì khớp cả hai.
- Chỉnh trong bảng điều khiển, mục **4 · Lên bái**: kiểu kích hoạt, từ khóa, quà tối thiểu, số chỗ lạy, số lần lạy, thời gian chờ, giọng đọc. Nút **Thử lên bái** để thử khi chưa live.
- Test: `cd live && npm test`.
