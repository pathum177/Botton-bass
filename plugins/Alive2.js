import pkg, { prepareWAMessageMedia } from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
const os = require('os');
const { cmd } = require('../lib/command');
const config = require('../settings');
const { runtime } = require('../lib/functions');

cmd({
  pattern: "alive2",
  react: "🧬",
  desc: "Check bot Commands.",
  category: "main",
  filename: __filename
}, async (conn, mek, m, { prefix }) => {
  try {
    const senderName = m.pushName || "User";
    const usedRam = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalRam = Math.round(os.totalmem() / 1024 / 1024);
    const botUptime = runtime(process.uptime());

    const teksnya = `*👋 Hello ${senderName}, welcome to LUXALGO-XD❄️*\n
╭──────────────●●►
| *🛠️ Version:* ${require("../package.json").version}
| *📟 RAM Usage:* ${usedRam}MB / ${totalRam}MB
| *⏱️ Uptime:* ${botUptime}
| *👨‍💻 Owner:* Pathum Malsara
╰──────────────●●►

> *Some bugs may still exist and will be fixed in future updates.*
> *If you face any issues, please contact the developer.*
> Created by Pathum Malsara`;

    const imageUrl = "https://files.catbox.moe/joo2gt.jpg";

    // Prepare the image media (must upload to WhatsApp servers)
    const media = await prepareWAMessageMedia(
      { image: { url: imageUrl } },
      { upload: conn.waUploadToServer }
    );

    // Create the hydrated button message
    const msg = generateWAMessageFromContent(m.chat, {
      templateMessage: {
        hydratedTemplate: {
          imageMessage: media.imageMessage,
          hydratedContentText: teksnya,
          hydratedButtons: [
            {
              quickReplyButton: {
                displayText: "OWNER👨‍💻",
                id: ".owner"
              }
            },
            {
              quickReplyButton: {
                displayText: "PING🧬",
                id: ".ping"
              }
            },
            {
              singleSelectReply: {
                title: "📃 MENU",
                options: [
                  {
                    optionName: "Main Menu",
                    optionValue: `${prefix}mainmenu`,
                    description: "Get the Main Bot Menu"
                  },
                  {
                    optionName: "Download Menu",
                    optionValue: `${prefix}dlmenu`,
                    description: "Download Commands"
                  },
                  {
                    optionName: "AI Menu",
                    optionValue: `${prefix}aimenu`,
                    description: "AI Commands"
                  },
                  {
                    optionName: "Fun Menu",
                    optionValue: `${prefix}funmenu`,
                    description: "Jokes, Memes, Games"
                  },
                  {
                    optionName: "Group Menu",
                    optionValue: `${prefix}groupmenu`,
                    description: "Group Only Commands"
                  },
                  {
                    optionName: "Owner Menu",
                    optionValue: `${prefix}ownermenu`,
                    description: "Owner Only Tools"
                  }
                ]
              }
            }
          ]
        }
      }
    }, { quoted: mek });

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { text: `Error: ${e.message}` }, { quoted: mek });
  }
});
