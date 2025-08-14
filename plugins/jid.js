const { cmd } = require('../lib/command');

cmd({
    pattern: 'jid',
    desc: 'Get the JID (WhatsApp ID) of a user or group',
    category: 'info',
    filename: __filename
}, async (conn, m, msg, { q, reply }) => {
    try {
        let target;

        // 1. If message is a reply
        if (m.quoted) {
            target = m.quoted.sender;
        }
        // 2. If mention
        else if (m.mentionedJid && m.mentionedJid.length > 0) {
            target = m.mentionedJid[0];
        }
        // 3. If text (manual number)
        else if (q) {
            let num = q.replace(/[^0-9]/g, '');
            target = num.includes('@') ? num : `${num}@s.whatsapp.net`;
        }
        // 4. If nothing → current chat (group or PM)
        else {
            target = m.chat;
        }

        reply(`📌 *JID:*\n\`\`\`${target}\`\`\``);
    } catch (err) {
        reply('❌ Error: ' + err.message);
    }
});
