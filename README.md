# Track Tag Role Discord

Hệ thống giám sát Discord tự động, gửi cảnh báo qua Telegram và gọi điện khẩn cấp qua Vonage khi không có phản hồi.

## ⚠️ Disclaimer

**Dự án này chỉ phục vụ mục đích giáo dục và học tập.**

- Tác giả không chịu trách nhiệm cho bất kỳ hành vi lạm dụng, vi phạm Điều khoản dịch vụ của Discord, Telegram, Vonage hoặc pháp luật hiện hành nào phát sinh từ việc sử dụng code này.
- Việc sử dụng selfbot (tài khoản người dùng tự động hóa) **vi phạm Discord Terms of Service** và có thể dẫn đến việc tài khoản bị khóa vĩnh viễn.
- Người dùng tự chịu hoàn toàn trách nhiệm khi chạy dự án này. Hãy đảm bảo bạn có quyền sử dụng hợp pháp với tất cả các dịch vụ bên thứ ba liên quan.
- Không sử dụng dự án này cho mục đích spam, quấy rối, hoặc gây hại cho người khác.

---

## Tổng quan

Bot lắng nghe một kênh Discord cụ thể. Khi có ai đó tag một role được chỉ định, hệ thống sẽ:

1. **Spam cảnh báo** lên Telegram mỗi 3 giây kèm nút dừng
2. **Leo thang** gọi điện thoại khẩn cấp qua Vonage nếu không ai bấm dừng sau 10 phút

## Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Discord Listener                        │
│  Lắng nghe messageCreate trong kênh DISCORD_CHANNEL_ID      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
            Có tag DISCORD_ROLE_ID?
                       │
                 ┌─────┴─────┐
                 │           │
                YES         NO
                 │           │
                 ▼           ▼
        ┌────────────┐   (Bỏ qua)
        │ startSpam()│
        └─────┬──────┘
              │
    ┌─────────┴──────────────────────────┐
    │                                    │
    ▼                                    ▼
┌────────────────────┐        ┌─────────────────────────┐
│ setInterval 3 giây │        │ setTimeout 10 phút      │
│ Gửi tin nhắn TG    │        │ escalationTimeout       │
│ kèm inline button  │        │                         │
└────────┬───────────┘        └──────────┬──────────────┘
         │                               │
         ▼                               ▼
┌────────────────────┐        ┌─────────────────────────┐
│ User bấm "DỪNG" ?  │        │ Hết 10 phút chưa dừng?  │
└────────┬───────────┘        └──────────┬──────────────┘
         │                               │
    ┌────┴────┐                    ┌─────┴─────┐
    │         │                    │           │
   YES       NO                   YES         NO
    │         │                    │           │
    ▼         │                    ▼           │
┌───────┐     │          ┌──────────────┐      │
│stop   │     │          │makeEmergency │      │
│Spam() │     │          │Call()        │      │
└───┬───┘     │          └──────┬───────┘      │
    │         │                 │              │
    ▼         │                 ▼              │
✅ Xóa       │          📞 Gọi Vonage         │
interval     │          📨 Gửi TG confirm     │
clearTimeout │                                 │
             │                                 │
             │◄────────────────────────────────┘
             │
             ▼
        ┌─────────┐
        │ Ctrl+C  │
        │ Graceful│
        │ Shutdown│
        └─────────┘
```

## Cài đặt

### 1. Clone repo

```bash
git clone https://github.com/DarqPL/Track-tag-role-discord.git
cd Track-tag-role-discord
```

### 2. Cài dependencies

```bash
npm install
```

### 3. Cấu hình `.env`

Copy file mẫu và điền thông tin:

```bash
cp .env.example .env
```

Mở `.env` và điền các giá trị theo hướng dẫn bên dưới.

### 4. Chạy

```bash
npx ts-node index.ts
```

---

## Hướng dẫn lấy thông tin `.env`

### Discord

| Biến                 | Cách lấy                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| `DISCORD_USER_TOKEN` | Mở Discord &gt; DevTools (F12) &gt; tab Network &gt; filter `api` &gt; tìm request có header `authorization` |
| `DISCORD_CHANNEL_ID` | Bật Developer Mode trong Discord &gt; click phải kênh &gt; Copy Channel ID                                   |
| `DISCORD_ROLE_ID`    | Bật Developer Mode &gt; click phải role &gt; Copy Role ID                                                    |

### Telegram

| Biến                 | Cách lấy                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------ |
| `TELEGRAM_BOT_TOKEN` | Nhắn `/newbot` cho [@BotFather](https://t.me/BotFather) trên Telegram                      |
| `TELEGRAM_CHAT_ID`   | Nhắn tin cho bot &gt; truy cập [@userinfobot](https://t.me/userinfobot) &gt; lấy `chat.id` |

### Vonage

| Biến                      | Cách lấy                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------- |
| `VONAGE_API_KEY`          | Dashboard Vonage &gt; Settings &gt; API credentials                                   |
| `VONAGE_API_SECRET`       | Dashboard Vonage &gt; Settings &gt; API credentials                                   |
| `VONAGE_APPLICATION_ID`   | Dashboard &gt; Applications &gt; Create application &gt; Voice                        |
| `VONAGE_PRIVATE_KEY_PATH` | Tải private key khi tạo Application, lưu vào thư mục project (VD: `./private.key`)    |
| `VONAGE_FROM_NUMBER`      | Mua số điện thoại trong Vonage Dashboard &gt; Numbers &gt; Buy Numbers                |
| `MY_PHONE_NUMBER`         | Số điện thoại cá nhân nhận cuộc gọi, có mã quốc gia không dấu `+` (VD: `84901675731`) |

---

## Cấu trúc file

```
Track-tag-role-discord/
├── index.ts              # Source code chính
├── .env                  # Biến môi trường (không commit)
├── .env.example          # File mẫu hướng dẫn
├── .gitignore            # Bỏ qua .env, private.key, node_modules
├── package.json
├── tsconfig.json
└── private.key           # Vonage private key (không commit)
```

## Graceful Shutdown

Nhấn `Ctrl+C` để dừng bot an toàn. Hệ thống sẽ:

- Dừng vòng lặp spam Telegram
- Hủy hẹn giờ leo thang Vonage
- Đóng kết nối Discord
- Dừng Telegram polling
