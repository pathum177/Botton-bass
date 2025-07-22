const { cmd } = require('../lib/command');
const axios = require('axios');

const movieStore = {}; // temp user session store

cmd({
    pattern: "movie",
    desc: "Search, preview & download movies",
    category: "movie"
}, async (conn, mek, m, { q, reply }) => {
    const input = q.trim();

    // Case 1: user sent a number → download quality
    if (/^\d+$/.test(input)) {
        const idx = parseInt(input) - 1;
        const session = movieStore[m.sender];

        if (!session || !session.torrents || !session.torrents[idx]) {
            return reply("❌ Invalid or expired session. Please search again.");
        }

        const selected = session.torrents[idx];
        reply(`📥 Downloading ${selected.quality}...`);

        // Mock download — Replace with actual fetch logic
        const mockMp4 = await axios.get(
            "https://file-examples.com/storage/fed83d4c7fdb963043c19b6/2017/04/file_example_MP4_480_1_5MG.mp4",
            { responseType: "arraybuffer" }
        );

        await conn.sendMessage(m.chat, {
            document: mockMp4.data,
            fileName: `Movie_${selected.quality}.mp4`,
            mimetype: 'video/mp4'
        }, { quoted: mek });

        return;
    }

    // Case 2: movie ID → show info + quality list
    if (/^\d{2,10}$/.test(input)) {
        const id = input;

        const { data } = await axios.get(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}&with_images=true`);
        const movie = data?.data?.movie;

        if (!movie || !movie.torrents) return reply("❌ Movie not found.");

        // Store for later download
        movieStore[m.sender] = movie;

        const list = movie.torrents.map((t, i) => `*${i + 1}.* ${t.quality} (${t.size})`).join('\n');

        const caption = `🎬 *${movie.title}* (${movie.year})
⭐ *Rating:* ${movie.rating}/10
📁 *Genre:* ${movie.genres.join(', ')}
📝 *Summary:* ${movie.description_full.slice(0, 400)}

🎯 *Download Qualities:*
${list}

📌 Send: .movie <number> to download as .mp4`;

        await conn.sendMessage(m.chat, {
            image: { url: movie.medium_cover_image },
            caption,
            footer: "LUXALGO XD • Movie Info"
        }, { quoted: mek });

        return;
    }

    // Case 3: movie name → search
    if (!input) return reply("🎬 Please enter a movie name.");

    const { data } = await axios.get(`https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(input)}`);
    const movies = data?.data?.movies;

    if (!movies || movies.length === 0) return reply("❌ No movies found.");

    const sections = [{
        title: "🎬 Search Results",
        rows: movies.map(m => ({
            title: `${m.title} (${m.year})`,
            rowId: `.movie ${m.id}`,
            description: m.genres?.join(", ") || ""
        }))
    }];

    await conn.sendMessage(m.chat, {
        text: `🔎 Results for: *${input}*`,
        footer: "LUXALGO XD MOVIE SEARCH",
        title: "🎞 Select a Movie",
        buttonText: "Choose Movie 🎥",
        sections
    }, { quoted: mek });
});
