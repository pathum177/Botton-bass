const config = require('../settings');
const { cmd } = require('../lib/command');
const getFBInfo = require("@xaviabot/fb-downloader");

cmd({
  pattern: "fb2",
  alias: ["fbdl"],
  desc: "Download Facebook videos",
  category: "download",
  filename: __filename
}, async (conn, msg, m, { q, reply }) => {
  try {
    if (!q || !q.startsWith("http")) return reply("❌ Send a valid Facebook video link!");

    await conn.sendMessage(msg.chat, { react: { text: "🎬", key: msg.key } });

    const data = await getFBInfo(q);
    const title = data?.title || "Facebook Video";

    const listMessage = {
      title: "📥 Facebook Video Downloader",
      text: `*🎞️ Title:* ${title}`,
      footer: "Select a download format below 👇",
      buttonText: "🔽 Choose Format",
      sections: [
        {
          title: "🎥 Video",
          rows: [
            { title: "HD Quality", description: "High Definition", rowId: `.fbdl hd ${q}` },
            { title: "SD Quality", description: "Standard Definition", rowId: `.fbdl sd ${q}` }
          ]
        },
        {
          title: "🎧 Audio",
          rows: [
            { title: "Audio File", description: "Send as Audio", rowId: `.fbdl audio ${q}` },
            { title: "Document", description: "Send as File", rowId: `.fbdl doc ${q}` },
            { title: "Voice Note", description: "Send as Voice Note", rowId: `.fbdl voice ${q}` }
          ]
        }
      ]
    };

    await conn.sendMessage(msg.chat, listMessage, { quoted: msg });

  } catch (e) {
    console.error(e);
    reply("❌ Error fetching video.");
  }
});
