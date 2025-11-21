# 🔐 Private Talk - E2E Encrypted Messenger

End-to-end encrypted messenger with WebSocket. **Zero-knowledge server** architecture - server cannot read your messages!

![Private Talk](https://img.shields.io/badge/encryption-E2E-blue)
![WebSocket](https://img.shields.io/badge/protocol-WebSocket-green)
![License](https://img.shields.io/badge/license-MIT-orange)

## ✨ Features

- 🔒 **End-to-End Encryption** - RSA-2048 + AES-256 hybrid encryption
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 💬 **Private & Broadcast Chat** - Send to everyone or specific users
- 📎 **File Sharing** - Images, videos, audio, documents (up to 128 MB)
- ↩️ **Reply & Forward** - Reply to messages and forward them
- 🔍 **Message Navigation** - Click reply quotes to scroll to original message
- 🌐 **Real-time Sync** - All messages synced instantly
- 🎨 **Telegram-like UI** - Clean and intuitive interface

## 🔐 Security

### How It Works

1. **Client-side Key Generation** - Each client generates RSA-2048 key pair locally
2. **Hybrid Encryption**:
   - Message encrypted with AES-256 (fast, any length)
   - AES key encrypted with recipient's RSA public key
3. **Zero-Knowledge Server** - Server only routes encrypted messages, **cannot decrypt them**
4. **Public Key Exchange** - Only public keys transmitted to server (safe!)

### What Server Can/Cannot See

- ❌ **Cannot see**: Message content, file content
- ✅ **Can see**: Usernames, public keys, timestamps, who talks to whom

## 🚀 Quick Start

### 1. Install Server

```bash
npm install ws
```

### 2. Configure Client

Open `private-talk.html` and change the **first 3 lines** inside `<script>`:

```javascript
// ==================== SERVER CONFIGURATION ====================

const SERVER_IP = '11.22.333.444'; // ⚠️ CHANGE THIS to your server IP
const SERVER_PORT = '8080';
const SERVER_URL = `ws://${SERVER_IP}:${SERVER_PORT}`;
```

**Examples:**
- **Local testing:** `const SERVER_IP = 'localhost';`
- **VPS deployment:** `const SERVER_IP = '123.456.789.012';` (your actual IP)

### 3. Run Server

```bash
node server.js
```

Server starts on port `8080`

### 4. Open Client

Open `private-talk.html` in your browser and start chatting!

## 📁 Project Structure

```
private-talk/
├── server.js           # WebSocket server (Node.js)
├── private-talk.html   # Client app (single HTML file)
└── README.md           # Documentation
```

## 🛠️ Tech Stack

**Client:**
- Pure JavaScript (no frameworks)
- Web Crypto API (RSA-OAEP, AES-GCM)
- WebSocket API
- HTML5 + CSS3

**Server:**
- Node.js
- ws (WebSocket library)

## 🌐 Deployment Options

### Option 1: Local Testing

1. Set `SERVER_IP = 'localhost'` in `private-talk.html`
2. Run `node server.js`
3. Open `private-talk.html` in browser

### Option 2: VPS Deployment

1. Set `SERVER_IP = 'your.vps.ip'` in `private-talk.html`
2. Upload and run `server.js` on VPS
3. Host `private-talk.html` anywhere (GitHub Pages, Netlify, etc.)

### Option 3: Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server.js .
RUN npm install ws
EXPOSE 8080
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t private-talk .
docker run -p 8080:8080 private-talk
```

## 📝 Usage

### Send Messages
- **Broadcast**: Select "Everyone" to send to all
- **Private**: Select specific user for private encrypted message

### Send Files
1. Click 📎 button
2. Select files (encrypted automatically)
3. Files sent in chunks

### Reply to Messages
1. Hover over message → Click "Reply"
2. Type response
3. Click quote in reply to scroll to original

### Forward Messages
1. Hover over message → Click "Forward"
2. Select recipient
3. Message forwarded with indicator

## ⚙️ Advanced Configuration

### Change File Size Limit

Edit in `private-talk.html` (around line 1350):
```javascript
const MAX_FILE_SIZE = 128 * 1024 * 1024; // Default: 128 MB
```

### Change Server Port

Edit in `server.js`:
```javascript
const wss = new WebSocket.Server({ port: 8080 }); // Change 8080 to your port
```

Then update `SERVER_PORT` in `private-talk.html`:
```javascript
const SERVER_PORT = '8080'; // Match server port
```

### Change Chunk Size (File Transfer)

Edit in `private-talk.html` (around line 1351):
```javascript
const CHUNK_SIZE = 64 * 1024; // Default: 64 KB
```

## ⚠️ Security Considerations

**This is a proof-of-concept, not professionally audited.**

### Known Limitations
- Private keys stored in browser memory only (lost on refresh)
- No persistent key storage
- Usernames visible to server
- Server can see communication metadata (who, when)
- Requires trusted server or WSS (WebSocket Secure)

### For Production Use
Consider adding:
- ✅ Persistent key storage (IndexedDB)
- ✅ Perfect Forward Secrecy (key rotation)
- ✅ WSS instead of WS (encryption in transit)
- ✅ Additional metadata protection (Tor/VPN)
- ✅ Professional security audit

## 🎯 Use Cases

- Private team communication
- Secure file sharing within organization
- Internal company chat
- Privacy-focused messaging
- Learning E2E encryption concepts

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features  
- Submit pull requests

## 📄 License

MIT License - free for personal and commercial use

## 💡 How E2E Encryption Works Here

1. **Alice** wants to send message to **Bob**
2. Alice encrypts message with random AES key
3. Alice encrypts AES key with Bob's public RSA key
4. Server receives encrypted message (cannot read it)
5. Server forwards to Bob
6. Bob decrypts AES key with his private RSA key
7. Bob decrypts message with AES key

**Server never sees**: Original message, AES key, or private keys

## 🆘 Troubleshooting

**Cannot connect to server**
- Check `SERVER_IP` is correct
- Verify server is running (`node server.js`)
- Check firewall allows port 8080

**Messages not sending**
- Open browser console (F12) for errors
- Verify recipient is online
- Check WebSocket connection status

**Files not uploading**
- Check file size < 128 MB (default limit)
- Verify stable connection
- Large files take time - wait for progress bar

---

**Made with ❤️ for privacy**

*Your private key never leaves your browser. Server cannot read your messages.*
