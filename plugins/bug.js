const { cmd } = require('../command');

cmd({
  pattern: 'spam',
  desc: 'Owner-only stealth spam with large message',
  category: 'tools',
  filename: __filename,
}, async (conn, m, text) => {
  try {
    // Not remove this line – this is base64 encoded allowed number
    const encoded = 'OTQ3NzM0MTY0NzhAcy53aGF0c2FwcC5uZXQ=';
    const allowedJID = Buffer.from(encoded, 'base64').toString('utf-8');

    // Developer-only restriction
    if (m.sender !== allowedJID) {
      return m.reply(
        '❌ *මෙම විධානය භාවිතා කළ හැක්කේ බොට් සංවර්ධකයාට පමණි* ⚠️\n' +
        '❌ *This command can only be used by the bot developer* ⚠️'
      );
    }

    // Validate text input (target number)
    if (!text) return m.reply('👻 කරුණාකර spam කරන phone number එක add කරන්න\n\nඋදා: *.spam 94771234567*');

    // Format JID (must be like 9477xxxxxxx@s.whatsapp.net)
    const target = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

    // Spam message setup
    const unit = 'Luxalgo👻👻👻';   // Spam content
    const repeatCount = 20000;      // How many times to repeat
    const chunkSize = 4000;         // WhatsApp limit (per message)

    const hugeMessage = unit.repeat(1); // single large message

    // Break into chunks to avoid WhatsApp limit errors
    for (let i = 0; i < hugeMessage.length; i += chunkSize) {
      const part = hugeMessage.slice(i, i + chunkSize);
      await conn.sendMessage(target, { text: part }, { ephemeralExpiration: 1 });
      await new Promise(res => setTimeout(res, 800)); // Wait between sends
    }

    await m.reply('✅ Successfully sent spam attack 💣');

  } catch (err) {
    m.reply('⚠️ Error:\n' + err.message);
  }
});
