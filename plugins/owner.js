const { cmd } = require('../lib/command');
const os = require('os')
var { get_set , input_set } = require('../lib/set_db') 
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, jsonformat} = require('../lib/functions')


cmd({
  pattern: "owner",
  desc: "Show bot owner info",
  category: "main",
  react: "👨‍💻",
  filename: __filename
}, async (conn, m, msg, { prefix }) => {
  try {
    const ownerJid = '94773416478@s.whatsapp.net'; // 👈 ඔබගේ real number එක
    const caption = `*👨‍💻 BOT OWNER INFORMATION:*\n\n👑 *Name:* Pathum Malsara\n📱 *Number:* wa.me/94773416478\n💬 *Contact me if you need help!*\n\n🔰 *Powered by LUXALGO-XD*`;

    const buttons = [
      {
        buttonId: `.menu`,
        buttonText: { displayText: "📋 Main Menu" },
        type: 1
      },
      {
        urlButton: {
          displayText: "👨‍💻 WhatsApp Me",
          url: "https://wa.me/94773416478"
        }
      }
    ];

    const image = { url: 'https://files.catbox.moe/joo2gt.jpg' }; // optional image

    await conn.sendMessage(m.chat, {
      image,
      caption,
      buttons,
      headerType: 1,
      viewOnce: true,
      contextInfo: {
        mentionedJid: [ownerJid]
      }
    }, { quoted: m });
  } catch (e) {
    console.error(e);
    msg.reply("❌ Error showing owner info.");
  }
});
