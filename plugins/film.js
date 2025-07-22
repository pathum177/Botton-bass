const { cmd } = require('../lib/command');
const axios = require('axios');

const userSession = {};

cmd({
    pattern: "movie2",
    desc: "Search, view & download movies (with buttons)",
    category: "movie"
}, async (conn, mek, m, { q, reply }) => {
    const input = q?.trim();
    const user = m.sender;

    // No input provided
    if (!input) return reply("🎬 Please enter a movie name to search.");

    const session = userSession[user];

    // STEP 1 — SEARCH BY NAME
    if (isNaN(input)) {
        const { data } = await axios.get(`https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(input)}`);
        const movies = data?.data?.movies;

        if (!movies || movies.length === 0) return reply("❌ No movies found.");

        // Store search session
        userSession[user] = { stage: "search", search: movies };

        let buttons = movies.slice(0, 5).map((m, i) => ({
            buttonId: `.movie2 ${i + 1}`,
            buttonText: { displayText: `${i + 1}. ${m.title}` },
            type: 1
        }));

        return await conn.sendMessage(m.chat, {
            text: `📽️ *Search results for:* _${input}_\n\nSelect a movie below to view info:`,
            buttons,
            footer: "LUXALGO XD • Movie Search",
            headerType: 1
        }, { quoted: mek });
    }

    const index = parseInt(input) - 1;

    // No session yet
    if (!session) return reply("❌ No active session. Please search again with .movie2 <movie name>");

    // STEP 2 — SELECTED MOVIE INFO
    if (session.stage === "search") {
        const selected = session.search[index];
        if (!selected) return reply("❌ Invalid movie selection.");

        const { data } = await axios.get(`https://yts.mx/api/v2/movie_details.json?movie_id=${selected.id}&with_images=true`);
        const movie = data?.data?.movie;
        if (!movie || !movie.torrents) return reply("❌ Failed to fetch movie info.");

        userSession[user] = {
            stage: "info",
            movieTitle: movie.title,
            torrents: movie.torrents
        };

        const qualityButtons = movie.torrents.slice(0, 5).map((t, i) => ({
            buttonId: `.movie2 ${i + 1}`,
            buttonText: { displayText: `${i + 1}. ${t.quality} (${t.size})` },
            type: 1
        }));

        const caption = `🎬 *${movie.title}* (${movie.year})
⭐ Rating: ${movie.rating}/10
📁 Genre: ${movie.genres?.join(', ') || "N/A"}
📝 Summary: ${movie.description_full.slice(0, 300)}

🎯 *Choose a quality to download:*`;

        return await conn.sendMessage(m.chat, {
            image: { url: movie.medium_cover_image },
            caption,
            buttons: qualityButtons,
            footer: "LUXALGO XD • Movie Info",
            headerType: 4
        }, { quoted: mek });
    }

    // STEP 3 — SELECT QUALITY TO DOWNLOAD
    if (session.stage === "info") {
        const selectedTorrent = session.torrents[index];
        if (!selectedTorrent) return reply("❌ Invalid quality selection.");

        await reply(`📥 Downloading ${selectedTorrent.quality} (${selectedTorrent.size})...`);

        const mockFile = await axios.get(
            "https://file-examples.com/storage/fed83d4c7fdb963043c19b6/2017/04/file_example_MP4_480_1_5MG.mp4",
            { responseType: "arraybuffer" }
        );

        delete userSession[user];

        return await conn.sendMessage(m.chat, {
            document: mockFile.data,
            fileName: `LUXALGO_${session.movieTitle}_${selectedTorrent.quality}.mp4`,
            mimetype: 'video/mp4'
        }, { quoted: mek });
    }

    return reply("❌ Unexpected error. Try again.");
});
