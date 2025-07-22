const { cmd } = require('../lib/command');
const getFBInfo = require("@xaviabot/fb-downloader");

cmd({
  pattern: "fb3",
  alias: ["fbdl"],
  desc: "Download Facebook video",
  category: "download",
  filename: __filename,
},
async (conn, m, msg) => {
  const { from, q } = msg;

  if (!q || !q.startsWith("https://")) return m.reply("🧷 *Please provide a valid Facebook video URL.*");

  await m.react("🔍");

  try {
    const res = await getFBInfo(q);
    const listSections = [
      {
        title: "Video Formats 🎥",
        rows: [
          { title: "🪫 SD Quality", rowId: `.fbdl sd ${q}` },
          { title: "🔋 HD Quality", rowId: `.fbdl hd ${q}` },
        ]
      },
      {
        title: "Audio Formats 🎧",
        rows: [
          { title: "🎶 Audio File", rowId: `.fbdl audio ${q}` },
          { title: "📁 Document File", rowId: `.fbdl doc ${q}` },
          { title: "🎤 Voice Note", rowId: `.fbdl voice ${q}` }
        ]
      }
    ];

    await conn.sendMessage(from, {
      text: `*🎬 Facebook Video Downloader*\n\n📄 *Title:* ${res.title}\n🔗 *URL:* ${q}\n\n_Select a format below to download:_`,
      footer: "Powered by Luxalgo XD",
      title: "📥 Choose Download Format",
      buttonText: "📥 Download Options",
      sections: listSections,
      image: { url: res.thumbnail }
    }, { quoted: m });
  } catch (e) {
    console.log(e);
    return m.reply("❌ Failed to fetch video. Check the URL again.");
  }
});
