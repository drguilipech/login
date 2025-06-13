# Backend Server

This Express server implements authentication with Google OAuth2 and local email/password. The session secret is provided via the `SECRET_BASE64` environment variable, which is decoded from base64 at runtime. Credentials are stored in a SQLite database.

## Running

```bash
cd server
npm install # (requires internet access)
node index.js
```

The server listens on **port 3001**. Password recovery emails are logged to the console using Nodemailer.
