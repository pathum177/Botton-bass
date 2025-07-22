const { cmd } = require('../lib/command');
const axios = require('axios');

const userSession = {};

cmd({
    pattern: "movie2",
    desc: "Search, view & download movies (reply with number)",
    category: "movie"
}, async (conn, mek, m, { q, reply }) => {
    const input = q.trim();
    const user = m.sender;

    // 1. Search by name
    if (!input || isNaN(input)) {
        if (!input) return reply("🎬 Please enter a movie name.");

        const { data } = await axios.get(`https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(input)}`);
        const movies = data?.data?.movies;

        if (!movies || movies.length === 0) return reply("❌ No movies found.");

        // Store search results
        userSession[user] = { search: movies };

        const list = movies.map((m, i) => `*${i + 1}.* ${m.title} (${m.year})`).join('\n');
        return reply(`📽️ *Search results for:* _${input}_\n\n${list}\n\n📩 Reply: .movie <number> to view info`);
    }

    const index = parseInt(input) - 1;
    const session = userSession[user];

    // 2. Movie Info
    if (session?.search && session.search[index]) {
        const selected = session.search[index];
        const { data } = await axios.get(`https://yts.mx/api/v2/movie_details.json?movie_id=${selected.id}&with_images=true`);
        const movie = data?.data?.movie;

        if (!movie || !movie.torrents) return reply("❌ Failed to get movie info.");

        // Store torrent list for next action
        userSession[user] = {
            movieTitle: movie.title,
            torrents: movie.torrents
        };

        const qualityList = movie.torrents.map((t, i) => `*${i + 1}.* ${t.quality} (${t.size})`).join('\n');
        const caption = `🎬 *${movie.title}* (${movie.year})
⭐ Rating: ${movie.rating}/10
📁 Genre: ${movie.genres?.join(', ')}
📝 Summary: ${movie.description_full.slice(0, 300)}

🎯 *Download Options:*
${qualityList}

📩 Reply: .movie <number> to download`;

        return await conn.sendMessage(m.chat, {
            image: { url: movie.medium_cover_image },
            caption,
            footer: "LUXALGO XD • Movie Info"
        }, { quoted: mek });
    }

    // 3. Movie Download
    if (session?.torrents && session.torrents[index]) {
        const selectedTorrent = session.torrents[index];

        reply(`📥 Downloading ${selectedTorrent.quality} (${selectedTorrent.size})...`);

        // Replace with actual direct .mp4 if possible
        const mockFile = await axios.get(
            "https://file-examples.com/storage/fed83d4c7fdb963043c19b6/2017/04/file_example_MP4_480_1_5MG.mp4",
            { responseType: "arraybuffer" }
        );

        return await conn.sendMessage(m.chat, {
            document: mockFile.data,
            fileName: `LUXALGO_${session.movieTitle}_${selectedTorrent.quality}.mp4`,
            mimetype: 'video/mp4'
        }, { quoted: mek });
    }

    return reply("❌ Invalid number or session expired. Start again with .movie <name>");
});
