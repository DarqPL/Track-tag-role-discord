import 'dotenv/config';
import Client = require('discord.js-selfbot-v13');
import TelegramBot = require('node-telegram-bot-api');

const DISCORD_USER_TOKEN = process.env.DISCORD_USER_TOKEN!;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID!;
const DISCORD_ROLE_ID = process.env.DISCORD_ROLE_ID!;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

let spamInterval: NodeJS.Timeout | null = null;

const discordClient = new Client.Client();
const telegramBot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

const inlineKeyboard: TelegramBot.InlineKeyboardMarkup = {
  inline_keyboard: [[{ text: '🚨 ĐÃ NHẬN - DỪNG BÁO ĐỘNG', callback_data: 'stop_alarm' }]],
};

function startSpam() {
  if (spamInterval) {
    console.log('[SPAM] Đang chạy, bỏ qua yêu cầu mới.');
    return;
  }

  console.log('[SPAM] Bắt đầu gửi cảnh báo mỗi 3 giây...');

  spamInterval = setInterval(async () => {
    try {
      await telegramBot.sendMessage(TELEGRAM_CHAT_ID, '⚠️ CẢNH BÁO: Phát hiện tag role trên Discord!', {
        reply_markup: inlineKeyboard,
      });
      console.log('[SPAM] Đã gửi tin nhắn cảnh báo.');
    } catch (err) {
      console.error('[SPAM] Lỗi gửi tin nhắn Telegram:', err);
    }
  }, 3000);
}

function stopSpam() {
  if (!spamInterval) {
    console.log('[SPAM] Không có vòng lặp nào đang chạy.');
    return;
  }

  clearInterval(spamInterval);
  spamInterval = null;
  console.log('[SPAM] Đã dừng báo động.');
}

telegramBot.on('callback_query', async (callbackQuery) => {
  if (callbackQuery.data === 'stop_alarm') {
    stopSpam();

    try {
      await telegramBot.answerCallbackQuery(callbackQuery.id, { text: 'Đã tắt báo động!' });
      await telegramBot.editMessageText('✅ Đã tắt báo động thành công!', {
        chat_id: TELEGRAM_CHAT_ID,
        message_id: callbackQuery.message?.message_id,
        reply_markup: undefined,
      });
    } catch (err) {
      console.error('[TELEGRAM] Lỗi xử lý callback:', err);
    }
  }
});

discordClient.on('ready', () => {
  console.log(`[DISCORD] Đã đăng nhập: ${discordClient.user?.tag}`);
});

discordClient.on('messageCreate', async (message) => {
  if (message.channelId !== DISCORD_CHANNEL_ID) return;
  if (!message.mentions.roles.has(DISCORD_ROLE_ID)) return;

  console.log(`[DISCORD] Phát hiện tag role trong kênh ${message.channelId} bởi ${message.author.tag}`);
  startSpam();
});

discordClient.login(DISCORD_USER_TOKEN).catch((err) => {
  console.error('[DISCORD] Lỗi đăng nhập:', err);
});

process.on('SIGINT', () => {
  console.log('\n[SHUTDOWN] Đang dọn dẹp...');
  stopSpam();
  discordClient.destroy();
  telegramBot.stopPolling();
  process.exit(0);
});
