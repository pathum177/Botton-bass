const { cmd } = require('../lib/command');
const config = require('../settings');
const os = require('os');
const { runtime } = require('../lib/functions');

cmd({
    pattern: "alive2",
    react: "🧬",
    desc: "Check bot status and access menus",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { reply, prefix }) => {
    try {
        const senderName = m.pushName || "User";

        let teksnya = `
*👋 Hello ${senderName}, Welcome to LUXALGO-XD ❄️* 
╭──────────────●●►
| *🛠️ Version:* ${require("../package.json").version}
| *📟 RAM Usage:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB
| *⏱️ Runtime:* ${runtime(process.uptime())}
| *👨‍💻 Owner:* Pathum Malsara
╰──────────────●●►

> *Some bugs may still exist and will be fixed in future updates.*
> *If you face any issues, contact the developer.*

🔰 *Created by Pathum Malsara*
        `;

        let imageUrl = "https://files.catbox.moe/joo2gt.jpg";

        const buttons = [
            {
                index: 0,
                urlButton: {
                    displayText: "OWNER 👨‍💻",
                    url: "https://wa.me/94773416478"
                }
            },
            {
                index: 1,
                quickReplyButton: {
                    displayText: "PING 🧬",
                    id: `${prefix}ping`
                }
            }
        ];

        await conn.sendMessage(m.chat, {
            image: { url: imageUrl },
            caption: teksnya,
            footer: "LUXALGO-XD BOT ⚡",
            buttons,
            headerType: 4,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363409414874042@newsletter',
                    newsletterName: `LUXALGO`,
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply(`❌ Error: ${e.message}`);
    }
});
