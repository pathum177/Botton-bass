const { cmd } = require("../lib/command");

cmd({
  pattern: "getpp",
  desc: "Download the profile picture of the replied user or chat user",
  category: "tools",
  react: "🖼️",
  filename: __filename
}, async (conn, msg, m, { reply, from }) => {
  try {
    let target;

    // Check if it's a reply message
    if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
      target = msg.message.extendedTextMessage.contextInfo.participant;
    } else {
      target = msg.key.remoteJid;
    }

    // Skip if it's a group
    if (target.endsWith("@g.us")) {
      return reply("❌ This command only works with individual contacts.");
    }

    let profilePicUrl;
    try {
      profilePicUrl = await conn.profilePictureUrl(target, "image");
    } catch (e) {
      profilePicUrl = "https://i.ibb.co/tmD1Hqr/no-profile-picture.png"; // fallback
    }

    const caption = `🖼️ *Profile Picture*\n\n👤 *User:* @${target.split("@")[0]}\n\n> 🧬 *Powered by LUXALGO XD*`;

    await conn.sendMessage(from, {
      image: { url: profilePicUrl },
      caption,
      mentions: [target]
    }, { quoted: msg });

    await conn.sendMessage(from, {
      react: { text: "✅", key: msg.key }
    });

  } catch (e) {
    console.log(e);
    reply("❌ Couldn't fetch the profile picture.");
  }
});
