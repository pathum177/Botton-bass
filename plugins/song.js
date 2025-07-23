const config = require('../settings');
const { cmd } = require('../lib/command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const fetch = require("node-fetch"); // ensure this is installed

const ytCache = {}; // 🧠 Cache for interaction

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

    // 🧩 If this is a button action (e.g., media audio 12345)
    if (/^(audio|video|doc)\s+\d+$/.test(q.trim())) {
      const [format, id] = q.trim().split(" ");
      const yts = ytCache[id];
      if (!yts) return reply("❌ Session expired. Please search again.");

      // 🧠 React to download button
      await conn.sendMessage(from, { react: { text: "⏬", key: mek.key } });

      let apiURL = format === "audio"
        ? `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(yts.url)}`
        : `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(yts.url)}`;

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

      delete ytCache[id]; // 🧹 Remove cached entry
      return;
    }

    // 🔍 Initial YouTube Search
    const yt = await ytsearch(q);
    if (!yt?.results?.length) return reply("❌ No results found.");

    const yts = yt.results[0];
    const id = Date.now().toString();
    ytCache[id] = yts;

    const buttons = [
      {
        title: "🎶 Audio",
        rowId: `${command} audio ${id}`
      },
      {
        title: "🎥 Video",
        rowId: `${command} video ${id}`
      },
      {
        title: "📄 Document",
        rowId: `${command} doc ${id}`
      }
    ];

    const listMessage = {
      image: { url: yts.thumbnail || "https://i.ibb.co/7CgqFYD/no-thumb.jpg" },
      caption: `*🎬 LUXALGO MEDIA DOWNLOADER 🎬*\n\n🎵 *Title:* ${yts.title}\n⏱️ *Duration:* ${yts.timestamp}\n👤 *Author:* ${yts.author.name}\n🔗 *Link:* ${yts.url}\n\n> Select format to download.`,
      footer: "© Powered by LuxAlgo XD",
      title: "🎧 Choose Format",
      buttonText: "📥 Download Options",
      sections: [
        {
          title: "Available Formats",
          rows: buttons
        }
      ]
    };

    await conn.sendMessage(from, listMessage, { quoted: mek });

  } catch (err) {
    console.log(err);
    reply("❌ Unexpected error occurred.");
  }
});
