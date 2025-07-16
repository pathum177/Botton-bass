const { cmd } = require('../lib/command');
const axios = require('axios');
const cheerio = require('cheerio');
const { getBuffer } = require('../lib/functions');

cmd({
    pattern: "sinhalasub",
    desc: "Download Sinhala Movies from SinhalaSub.lk",
    category: "movie",
    use: ".sinhalasub <movie name>",
    filename: __filename
}, async (conn, mek, m, { q, reply }) => {
    if (!q) return reply("🔎 Please provide a movie name. Example:\n.sinhalasub Fast X");

    try {
        const searchUrl = "https://www.sinhalasub.lk/?s=" + encodeURIComponent(q);
        const { data } = await axios.get(searchUrl);
        const $ = cheerio.load(data);
        const moviePage = $("h2.post-title.entry-title > a").first();

        if (!moviePage.length) return reply("❌ No movie found on SinhalaSub.lk");

        const movieUrl = moviePage.attr("href");
        const movieTitle = moviePage.text().trim();

        const movieRes = await axios.get(movieUrl);
        const $$ = cheerio.load(movieRes.data);

        const image = $$("div.post-thumbnail img").attr("src");
        const description = $$("div.entry-content > p").first().text().trim();
        const links = $$("a").filter((i, el) => {
            const href = $$(el).attr("href");
            return href && href.includes(".mp4");
        }).map((i, el) => $$(el).attr("href")).get();

        if (!links.length) return reply("❌ No direct video links found.");

        const lowestQualityLink = links[0];

        const caption = `🎬 *LUXALGO MOVIE DL* 🎬

🎞️ *Title:* ${movieTitle}
📝 *Description:* ${description}
🔗 *Source:* ${movieUrl}

📥 Sending lowest quality version...`;

        await conn.sendMessage(m.chat, {
            image: { url: image },
            caption,
            footer: "LUXALGO XD",
        }, { quoted: mek });

        // Fetch video as buffer and send as document
        const videoBuffer = await axios.get(lowestQualityLink, { responseType: 'arraybuffer' });

        await conn.sendMessage(m.chat, {
            document: videoBuffer.data,
            fileName: movieTitle.replace(/[^a-zA-Z0-9]/g, "_") + ".mp4",
            mimetype: 'video/mp4'
        }, { quoted: mek });

    } catch (e) {
        console.error("SinhalaSub Error:", e);
        reply("❌ Failed to fetch movie from SinhalaSub.lk");
    }
});
