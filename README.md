# ⚡ ClipSync v2.0

> **A secure, ephemeral, end-to-end encrypted cross-device transfer platform.**  
> No login. No permanent storage. No cables. Just scan and share.

![ClipSync Banner](https://img.shields.io/badge/ClipSync-v2.0-5E81AC?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHBvbHlnb24gcG9pbnRzPSIxOCw0IDgsMTggMTYsMTggMTQsMjggMjQsMTQgMTYsMTQiIGZpbGw9IndoaXRlIi8+PC9zdmc+)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ What is ClipSync?

ClipSync is a **temporary device bridge** — not cloud storage. It lets you instantly share text, code snippets, and files between any two devices by scanning a QR code. Everything is end-to-end encrypted, sessions expire automatically, and nothing is stored on any server.

**Think of it as:** AirDrop that works across any browser, on any OS, without an account.

---

## 🛡️ Security Architecture

| Feature | Implementation |
|---|---|
| **Encryption** | ECDH key exchange → AES-256-GCM symmetric encryption |
| **Key lifetime** | Ephemeral per-session; destroyed on disconnect or timeout |
| **Session timeout** | 30 minutes inactivity, 2-hour hard limit |
| **Server storage** | Zero — server only handles WebRTC signaling |
| **Transfer content** | Never touches the server; peer-to-peer via BroadcastChannel / WebRTC |
| **File safety** | Blocked extensions: `.exe .apk .bat .sh .msi .cmd .vbs .ps1 .jar .dmg` |
| **File size limit** | 100MB per file |
| **AI safety** | Manual opt-in only; user confirms before content is sent to AI |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **npm** 9+

### Install & Run

```bash
# 1. Clone the repository
git clone https://github.com/your-username/clipsync.git
cd clipsync

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

**To test cross-device sharing in development:**
1. Open `http://localhost:5173` in two browser tabs
2. Click **Start Session** in Tab 1 — note the 6-char code
3. In Tab 2, paste the code in **Join Session** → Enter
4. Both tabs connect via BroadcastChannel (real WebRTC for production)

---

## 📁 Project Structure

```
clipsync/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Sticky header, status pill, security badge
│   │   ├── HomeScreen.jsx      # Landing page with session cards
│   │   ├── SessionPanel.jsx    # Left panel: device info, tabs, inputs
│   │   ├── InputPanels.jsx     # Text, Code, File input components
│   │   ├── Feed.jsx            # Transfer feed, filters, history sidebar
│   │   ├── TransferCard.jsx    # Individual transfer item with AI actions
│   │   ├── Modals.jsx          # QR, Scan, Confirm, AI confirm modals
│   │   ├── Toast.jsx           # Toast notification system
│   │   └── Icon.jsx            # Unified SVG icon library
│   ├── hooks/
│   │   ├── useSession.js       # Core session management hook
│   │   └── useToast.js         # Toast state hook
│   ├── services/
│   │   ├── crypto.js           # WebCrypto ECDH + AES-256-GCM service
│   │   └── ai.js               # Anthropic API integration (Smart Actions)
│   ├── utils/
│   │   └── index.js            # Helpers: formatBytes, genCode, file validation
│   ├── App.jsx                 # Root component, wires everything together
│   ├── main.jsx                # React DOM entry point
│   └── index.css               # Global styles, design tokens, animations
├── index.html                  # HTML entry point
├── vite.config.js              # Vite configuration
├── netlify.toml                # Netlify deployment config
├── vercel.json                 # Vercel deployment config
└── package.json
```

---

## 🏗️ Building for Production

```bash
npm run build
```

Output will be in `dist/`. Preview locally:

```bash
npm run preview
```

---

## ☁️ Deployment

### Netlify (Recommended)

1. Push code to GitHub
2. Connect repo to [Netlify](https://netlify.com)
3. Build settings are pre-configured in `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/clipsync)

### Vercel

```bash
npm i -g vercel
vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com). Config is in `vercel.json`.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/clipsync)

### GitHub Pages

```bash
npm run build
# then push the dist/ folder to gh-pages branch
```

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🔌 AI Smart Actions (Optional)

ClipSync includes an optional AI assistant (powered by Claude) that can analyze your shared content.

### How it works
1. User taps **✦ Smart Actions** on any transfer card
2. A confirmation modal appears: *"This content will be processed by AI. Continue?"*
3. If confirmed, content is sent to the Anthropic API
4. AI responds with: summary, key points, code analysis, or file description
5. Output is shown inline — never stored

### Configuration
The AI feature calls the Anthropic API from the client. To enable it:

1. Add your API key (for production, use a backend proxy to avoid exposing keys):
```js
// src/services/ai.js
const headers = {
  'Content-Type': 'application/json',
  'x-api-key': 'YOUR_KEY_HERE',       // ⚠️ Use a proxy in production
  'anthropic-version': '2023-06-01',
  'anthropic-dangerous-direct-browser-access': 'true',
}
```

> **⚠️ Security Note:** For production, route AI calls through your own backend to keep the API key secret.

---

## 🎨 Design System

ClipSync uses a **Nord Light** color palette with security-forward visual language.

| Token | Value | Usage |
|---|---|---|
| `--accent` | `#5E81AC` | Primary actions, links |
| `--teal` | `#8FBCBB` | Secondary actions, incoming transfers |
| `--green` | `#A3BE8C` | Connected state, encryption indicators |
| `--red` | `#BF616A` | Errors, disconnect, blocked |
| `--text` | `#1E2433` | Primary text |
| `--bg` | `#F0F4FA` | Page background |

**Fonts:**
- Display: [Outfit](https://fonts.google.com/specimen/Outfit) — weights 300–800
- Monospace: [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) — for code and session codes

---

## 🔮 Features

### ✅ Implemented (v2.0)
- [x] QR code session pairing
- [x] Manual 6-character code join
- [x] BroadcastChannel real-time sync (cross-tab demo)
- [x] ECDH key exchange + AES-256-GCM encryption
- [x] Session fingerprint for out-of-band verification
- [x] Text sharing with expand/collapse
- [x] Syntax-highlighted code sharing (20 languages)
- [x] File upload with drag-and-drop (100MB limit)
- [x] Image preview with lightbox
- [x] Blocked file type enforcement
- [x] Secure Send (auto-delete after first view)
- [x] Clipboard Mirror mode
- [x] Smart Actions AI analysis (opt-in, confirmed)
- [x] Session expiry countdown banner
- [x] Transfer feed with type filters
- [x] Searchable session history sidebar
- [x] Toast notification system
- [x] Recent sessions in localStorage
- [x] Disconnect confirmation with key destruction
- [x] Responsive layout

### 🔜 Roadmap (v3.0)
- [ ] Real WebRTC DataChannel transport
- [ ] TURN server fallback for NAT traversal
- [ ] Lightweight signaling server (WebSocket)
- [ ] Mobile-responsive layout improvements
- [ ] PWA / installable app
- [ ] Rate limiting & abuse prevention middleware
- [ ] Optional server-side session management
- [ ] Multi-file batch upload
- [ ] Transfer progress for large files

---

## 🤝 Contributing

Contributions are welcome!

```bash
# Fork the repo, then:
git clone https://github.com/your-username/clipsync.git
cd clipsync
npm install
npm run dev

# Create a feature branch
git checkout -b feature/my-feature

# Make your changes, then commit
git commit -m "feat: add my feature"
git push origin feature/my-feature
# Open a pull request
```

### Code Style
- React functional components with hooks
- CSS-in-JS via inline styles (design tokens via CSS variables)
- No external UI library dependencies
- Descriptive component and function names

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **Anthropic Claude** — AI Smart Actions
- **Nord Theme** — Color palette inspiration
- **WebCrypto API** — Client-side encryption
- **BroadcastChannel API** — Cross-tab demo transport

---

<div align="center">

**ClipSync** · *Secure by default. Ephemeral by design.*

[Report a Bug](https://github.com/your-username/clipsync/issues) · [Request a Feature](https://github.com/your-username/clipsync/issues)

</div>
