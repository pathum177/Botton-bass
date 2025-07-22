const config = require('../settings')
const {cmd , commands} = require('../lib/command')
const getFBInfo = require("@xaviabot/fb-downloader");

cmd({
  pattern: "fb",
  alias: ["fbdl"],
  desc: "Download Facebook videos",
  category: "download",
  filename: __filename
}, 
async(conn, m, text, { from, reply }) => {
  try {
    if (!text || !text.startsWith("http")) {
      return reply('❌ Please provide a valid Facebook URL.');
    }

    await conn.sendMessage(from, { react: { text: "⏬", key: m.key } });
    const result = await getFBInfo(text);

    const sections = [
      {
        title: "📥 Select Download Format",
        rows: [
          { title: "1.1 | SD Video", rowId: `.fb_sd ${text}` },
          { title: "1.2 | HD Video", rowId: `.fb_hd ${text}` },
          { title: "2.1 | Audio File", rowId: `.fb_audio ${text}` },
          { title: "2.2 | Audio as Document", rowId: `.fb_doc ${text}` },
          { title: "2.3 | Voice Note (ptt)", rowId: `.fb_voice ${text}` },
        ]
      }
    ];

    const listMessage = {
      text: `🎥 *LUXALGO FB DOWNLOADER* 🎥\n\n📌 Title: ${result.title}`,
      footer: '💡 Select format from below',
      title: "🖱️ Click to choose download type",
      buttonText: "📁 Download Options",
      sections
    };

    await conn.sendMessage(from, listMessage, { quoted: m });

  } catch (e) {
    console.error(e);
    reply("⚠️ Error:\n" + e.message);
  }
});

// ⬇️ Individual format handlers below ⬇️

cmd({ pattern: "fb_sd" }, async(conn, m, text) => {
  const res = await getFBInfo(text.trim());
  await conn.sendMessage(m.chat, { video: { url: res.sd }, caption: "✅ *SD Quality Video*" }, { quoted: m });
});

cmd({ pattern: "fb_hd" }, async(conn, m, text) => {
  const res = await getFBInfo(text.trim());
  await conn.sendMessage(m.chat, { video: { url: res.hd }, caption: "✅ *HD Quality Video*" }, { quoted: m });
});

cmd({ pattern: "fb_audio" }, async(conn, m, text) => {
  const res = await getFBInfo(text.trim());
  await conn.sendMessage(m.chat, { audio: { url: res.sd }, mimetype: 'audio/mpeg' }, { quoted: m });
});

cmd({ pattern: "fb_doc" }, async(conn, m, text) => {
  const res = await getFBInfo(text.trim());
  await conn.sendMessage(m.chat, {
    document: { url: res.sd },
    mimetype: 'audio/mpeg',
    fileName: `Luxalgo_FB.mp3`
  }, { quoted: m });
});

cmd({ pattern: "fb_voice" }, async(conn, m, text) => {
  const res = await getFBInfo(text.trim());
  await conn.sendMessage(m.chat, {
    audio: { url: res.sd },
    mimetype: 'audio/mp4',
    ptt: true
  }, { quoted: m });
});
