require("dotenv").config();
const { Vonage } = require("@vonage/server-sdk");
const { Auth } = require("@vonage/auth");
const fs = require("fs");

try {
  // Đọc file private key
  const privateKey = fs.readFileSync(
    process.env.VONAGE_PRIVATE_KEY_PATH,
    "utf8",
  );

  // Khởi tạo chứng chỉ Auth của Vonage
  const credentials = new Auth({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET,
    applicationId: process.env.VONAGE_APPLICATION_ID,
    privateKey: privateKey,
  });

  const vonage = new Vonage(credentials);

  const fromNumber = process.env.VONAGE_FROM_NUMBER;
  const toNumber = process.env.MY_PHONE_NUMBER;

  console.log(
    `[TEST] Đang kích hoạt cuộc gọi từ ${fromNumber} tới ${toNumber} qua Vonage...`,
  );

  // Lệnh kích hoạt cuộc gọi thoại (Voice Call)
  vonage.voice
    .createOutboundCall({
      to: [{ type: "phone", number: toNumber }],
      from: { type: "phone", number: fromNumber },
      ncco: [
        {
          action: "talk",
          text: "Alert! Alert! This is a test call from your automated system. Wake up immediately!",
          language: "en-US",
          style: 2, // Giọng nữ
        },
      ],
    })
    .then((resp) => {
      console.log("✅ Kích hoạt thành công! Chuông sẽ reo trong vài giây tới.");
      console.log("Call UUID:", resp.uuid);
    })
    .catch((err) => {
      console.error("❌ Lỗi API Vonage trả về:");
      // Trích xuất thông báo lỗi chi tiết của Vonage nếu có
      if (err.response && err.response.data) {
        console.error(JSON.stringify(err.response.data, null, 2));
      } else {
        console.error(err);
      }
    });
} catch (fsError) {
  console.error("❌ Lỗi hệ thống: Không thể đọc được file private.key!");
  console.error(
    "Hãy kiểm tra lại xem file private.key đã nằm cùng thư mục chưa và biến VONAGE_PRIVATE_KEY_PATH có đúng không.",
  );
  console.error(fsError.message);
}
