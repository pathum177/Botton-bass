const config = require('../settings');
const { cmd } = require('../lib/command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');

const ytCache = {}; // 🧠 Cache for button interactions

cmd({
  pattern: "media",
  react: "🎬",
  desc: "Search and download YouTube video/audio",
  category: "main",
  use: ".media < YouTube name or URL >",
  filename: __filename
}, async (conn, mek, m, { from, q, reply, command }) => {
  try {
    if (!q) return reply("❌ Please provide a YouTube name or link.");

    // Button click handler
    if (q.startsWith("audio ") || q.startsWith("video ") || q.startsWith("doc ")) {
      const [format, id] = q.split(" ");
      const yts = ytCache[id];
      if (!yts) return reply("❌ Session expired. Search again.");

      let apiURL = "";
      if (format === "audio") apiURL = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(yts.url)}`;
      else apiURL = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(yts.url)}`;

      const res = await fetch(apiURL);
      const data = await res.json();
      if (!data.success) return reply("❌ Failed to download. Try again later.");

      const caption = `*📥 Download Complete!*\n\n🎵 *Title:* ${yts.title}\n⏱️ *Duration:* ${yts.timestamp}\n📦 *Type:* ${format.toUpperCase()}\n\n© LuxAlgo XD`;

      if (format === "audio") {
        await conn.sendMessage(from, { audio: { url: data.result.downloadUrl }, mimetype: "audio/mpeg" }, { quoted: mek });
      } else if (format === "video") {
        await conn.sendMessage(from, { video: { url: data.result.download_url }, mimetype: "video/mp4" }, { quoted: mek });
      } else if (format === "doc") {
        await conn.sendMessage(from, {
          document: { url: data.result.download_url },
          mimetype: "video/mp4",
          fileName: `${yts.title}.mp4`,
          caption
        }, { quoted: mek });
      }

      delete ytCache[id]; // 🧹 Clear session
      return;
    }

    // Initial Search
    const yt = await ytsearch(q);
    if (!yt?.results?.length) return reply("❌ No results found.");

    const yts = yt.results[0];
    const id = Date.now().toString();
    ytCache[id] = yts;

    const listMessage = {
      text: `*🎬 LUXALGO MEDIA DOWNLOADER 🎬*\n\n🎵 *Title:* ${yts.title}\n⏱️ *Duration:* ${yts.timestamp}\n👤 *Author:* ${yts.author.name}\n🔗 *Link:* ${yts.url}\n\n> Select format to download.`,
      footer: "© Powered by LuxAlgo XD",
      title: "🎧 Choose Download Type",
      buttonText: "📥 Format Options",
      sections: [{
        title: "Available Formats",
        rows: [
          { title: "🎶 Audio", rowId: `${command} audio ${id}` },
          { title: "🎥 Video", rowId: `${command} video ${id}` },
          { title: "📄 Document", rowId: `${command} doc ${id}` }
        ]
      }]
    };

    await conn.sendMessage(from, listMessage, { quoted: mek });

  } catch (err) {
    console.log(err);
    reply("❌ Unexpected error occurred.");
  }
});
