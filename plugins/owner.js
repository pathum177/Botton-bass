const { cmd } = require('../lib/command');

cmd({
  pattern: "owner",
  desc: "Show bot owner info",
  category: "main",
  react: "👨‍💻",
  filename: __filename
}, async (conn, msg, m, { prefix, reply }) => {
  try {
    const caption = `*👨‍💻 BOT OWNER INFORMATION:*\n\n👑 *Name:* Pathum Malsara\n📱 *Number:* wa.me/94773416478\n💬 *Contact me if you need help!*\n\n🔰 *Powered by LUXALGO-XD*`;

    const image = { url: 'https://files.catbox.moe/joo2gt.jpg' };

    const buttons = [
      {
        buttonId: `${prefix}menu`,
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

    await conn.sendMessage(msg.chat, {
      image,
      caption,
      buttons,
      headerType: 1
    }, { quoted: msg });

  } catch (e) {
    console.log(e);
    reply("❌ Error showing owner info.");
  }
});
