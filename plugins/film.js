const { cmd } = require('../lib/command');
const axios = require('axios');

const userSession = {};

cmd({
    pattern: "movie2",
    desc: "Search, view & download movies (reply with number)",
    category: "movie"
}, async (conn, mek, m, { q, reply }) => {
    let input = q?.trim() || "";
    const user = m.sender;

    // Check if input is a number (reply with number to continue flow)
    const session = userSession[user];

    if (!input) {
        return reply("🎬 Please enter a movie name or reply with a number to select.");
    }

    // If input is NOT a number => treat as search query
    if (isNaN(input)) {
        // Search movies by name
        const { data } = await axios.get(`https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(input)}`);
        const movies = data?.data?.movies;

        if (!movies || movies.length === 0) return reply("❌ No movies found.");

        // Store search results in session for user
        userSession[user] = { stage: "search", search: movies };

        const list = movies.map((m, i) => `*${i + 1}.* ${m.title} (${m.year})`).join('\n');
        return reply(`📽️ *Search results for:* _${input}_\n\n${list}\n\n📩 Reply with the movie number to view info.`);
    }

    // Input is a number: proceed based on session stage
    const index = parseInt(input) - 1;

    if (!session) {
        return reply("❌ No active session. Please search first using .movie2 <movie name>");
    }

    if (session.stage === "search") {
        // User selected a movie from search results to view info
        if (!session.search || !session.search[index]) {
            return reply("❌ Invalid movie number. Please try again.");
        }

        const selected = session.search[index];
        const { data } = await axios.get(`https://yts.mx/api/v2/movie_details.json?movie_id=${selected.id}&with_images=true`);
        const movie = data?.data?.movie;

        if (!movie || !movie.torrents) return reply("❌ Failed to get movie info.");

        // Save movie info + torrents in session
        userSession[user] = {
            stage: "info",
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

📩 Reply with the quality number to download.`;

        return await conn.sendMessage(m.chat, {
            image: { url: movie.medium_cover_image },
            caption,
            footer: "LUXALGO XD • Movie Info"
        }, { quoted: mek });
    }

    if (session.stage === "info") {
        // User selected torrent quality to download
        if (!session.torrents || !session.torrents[index]) {
            return reply("❌ Invalid quality number. Please try again.");
        }

        const selectedTorrent = session.torrents[index];
        reply(`📥 Downloading ${selectedTorrent.quality} (${selectedTorrent.size})...`);

        // Replace with actual movie file link or torrent download logic here
        // For demo, sending a mock mp4 file
        const mockFile = await axios.get(
            "https://file-examples.com/storage/fed83d4c7fdb963043c19b6/2017/04/file_example_MP4_480_1_5MG.mp4",
            { responseType: "arraybuffer" }
        );

        // Clear session after download
        delete userSession[user];

        return await conn.sendMessage(m.chat, {
            document: mockFile.data,
            fileName: `LUXALGO_${session.movieTitle}_${selectedTorrent.quality}.mp4`,
            mimetype: 'video/mp4'
        }, { quoted: mek });
    }

    return reply("❌ Unexpected error. Please try again.");
});
