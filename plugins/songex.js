const config = require('../settings')
const { cmd } = require('../lib/command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const fetch = require('node-fetch');

const ytCache = {};

cmd({
  pattern: 'media5',
  react: "🎬",
  desc: 'Download Audio/Video/Doc from YouTube',
  category: 'main',
  filename: __filename
}, async (conn, m, msg, { q, reply, from }) => {
  try {
    if (!q) return await reply('Please provide a YouTube title or link.');

    const yt = await ytsearch(q);
    if (yt.results.length < 1) return reply("No results found.");

    const video = yt.results[0];
    ytCache[video.id] = video;

    const caption = `*🎬 LuxAlgo XD YouTube Downloader 🎬*\n\n📄 *Title:* ${video.title}\n⏱️ *Duration:* ${video.timestamp}\n📌 *Views:* ${video.views}\n👤 *Author:* ${video.author.name}\n🔗 *URL:* ${video.url}\n\n> Select a format below.`;

    const buttons = [
      { title: "🎵 Audio", rowId: `.media_dl audio ${video.id}` },
      { title: "🎥 Video", rowId: `.media_dl video ${video.id}` },
      { title: "📄 Document", rowId: `.media_dl doc ${video.id}` }
    ];

    await conn.sendMessage(from, {
      text: caption,
      footer: '© LuxAlgo XD',
      title: 'Select Format',
      buttonText: '🧾 Choose Format',
      sections: [{ title: "Available Formats", rows: buttons }]
    }, { quoted: m });

  } catch (e) {
    console.log(e);
    reply('❌ Error occurred while searching.');
  }
});

// 📥 Download Handler
cmd({ pattern: 'media_dl (audio|video|doc) (.+)', onlycmd: true }, async (conn, m, msg, { match, reply, from }) => {
  try {
    const [, format, id] = match;
    const video = ytCache[id];
    if (!video) return reply("❌ Cached video not found. Please search again.");

    if (format === "audio") {
      const api = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(video.url)}`;
      const res = await fetch(api).then(r => r.json());

      if (!res.success) return reply("❌ Failed to download audio.");
      await conn.sendMessage(from, {
        audio: { url: res.result.downloadUrl },
        mimetype: "audio/mpeg"
      }, { quoted: m });

    } else {
      const api = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(video.url)}`;
      const res = await fetch(api).then(r => r.json());

      if (!res.success) return reply("❌ Failed to download video.");

      const sendAsDoc = format === "doc";

      await conn.sendMessage(from, sendAsDoc ? {
        document: { url: res.result.download_url },
        mimetype: "video/mp4",
        fileName: `${video.title}.mp4`
      } : {
        video: { url: res.result.download_url },
        mimetype: "video/mp4"
      }, { quoted: m });
    }
  } catch (e) {
    console.log(e);
    reply("❌ Error occurred while downloading.");
  }
});
