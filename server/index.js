// Basic Express server with Passport authentication
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

// decode base64 secret
const sessionSecret = Buffer.from(process.env.SECRET_BASE64 || '', 'base64').toString('utf8');
app.use(session({ secret: sessionSecret, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    googleId TEXT
  )`);
});

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  db.get('SELECT id, email FROM users WHERE id = ?', id, (err, row) => done(err, row));
});

passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  db.get('SELECT id, email, password FROM users WHERE email = ?', email, async (err, row) => {
    if (err) return done(err);
    if (!row) return done(null, false, { message: 'Incorrect email.' });
    const match = await bcrypt.compare(password, row.password);
    if (!match) return done(null, false, { message: 'Incorrect password.' });
    return done(null, row);
  });
}));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'GOOGLE_ID',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_SECRET',
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  db.get('SELECT id FROM users WHERE googleId = ?', profile.id, (err, row) => {
    if (row) return done(null, row);
    db.run('INSERT INTO users (email, googleId) VALUES (?, ?)', profile.emails[0].value, profile.id, function(err){
      if (err) return done(err);
      done(null, { id: this.lastID, email: profile.emails[0].value });
    });
  });
}));

// Registration
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.run('INSERT INTO users (email, password) VALUES (?, ?)', email, hash, function(err){
    if(err) return res.status(400).json({ error: 'User exists' });
    res.json({ id: this.lastID, email });
  });
});

// Local login
app.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Logged in', user: { id: req.user.id, email: req.user.email } });
});

// Google OAuth
app.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/welcome');
});

// Password recovery: send magic link
const transporter = nodemailer.createTransport({
  sendMail: (mail, callback) => {
    console.log('Magic link email:', mail);
    callback(null, true);
  }
});

app.post('/forgot', (req, res) => {
  const { email } = req.body;
  db.get('SELECT id FROM users WHERE email = ?', email, (err, row) => {
    if(!row) return res.status(400).json({ error: 'No user' });
    const token = jwt.sign({ id: row.id }, sessionSecret, { expiresIn: '15m' });
    const link = `${req.protocol}://${req.get('host')}/reset/${token}`;
    transporter.sendMail({
      from: process.env.DEFAULT_EMAIL || 'guili@drguilipech.com',
      to: email,
      subject: 'Password recovery',
      text: `Click the link to login: ${link}`
    }, () => {});
    res.json({ message: 'Magic link sent' });
  });
});

app.get('/reset/:token', (req, res) => {
  try {
    const payload = jwt.verify(req.params.token, sessionSecret);
    req.login({ id: payload.id }, err => {
      if(err) return res.status(400).send('Invalid link');
      res.redirect('/welcome');
    });
  } catch(err) {
    res.status(400).send('Invalid link');
  }
});

app.get('/welcome', (req, res) => {
  if(!req.isAuthenticated()) return res.status(401).send('Not logged in');
  res.send(`Welcome ${req.user.email}`);
});

app.listen(3001, () => console.log('Server running on port 3001'));
