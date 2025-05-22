const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const P = require('pino');
const { state, saveState } = useSingleFileAuthState('./session.json');

async function startBot() {
  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    const msg = messages[0];

    if (!msg.message || msg.key.fromMe) return;

    const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const sender = msg.key.remoteJid;

    // Command: hi
    if (messageText.toLowerCase() === 'hi') {
      await sock.sendMessage(sender, { text: 'Hello! Main ek WhatsApp bot hoon.' });
    }

    // Command: help
    else if (messageText.toLowerCase() === 'help') {
      await sock.sendMessage(sender, {
        text: 'Yeh commands use karo:\n- hi\n- help'
      });
    }

    // Default reply
    else {
      await sock.sendMessage(sender, { text: 'Command samajh nahi aayi. "help" likho.' });
    }
  });

  sock.ev.on('creds.update', saveState);
}

startBot();
