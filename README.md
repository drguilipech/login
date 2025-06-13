# Login Application

This project contains a minimal authentication example with a backend in Express and a frontend in React.

## Structure

- `server/` – Node.js Express backend implementing Google OAuth2, email/password registration, and magic link recovery.
- `client/` – Simple React UI using framer-motion served via CDN.

## Quick Start

1. Install Node.js dependencies in `server/` (requires internet access):
   ```bash
   cd server
   npm install
   node index.js
   ```
2. Open `client/index.html` in a web browser. The UI calls the backend at `http://localhost:3001`.

Default email used in examples: **guili@drguilipech.com**
