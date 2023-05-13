const crypto = require('crypto');
const path = require('path');
const express = require('express');
const session = require('express-session');
const memorystore = require('memorystore');

const routes = require('./routes');
const { router: authRoutes, authenticator } = require('./auth');

const app = express();
const MemoryStore = memorystore(session);

const { version } = require('../../package.json');

if (process.argv.includes('--version')) {
  // eslint-disable-next-line no-console
  console.log(version);
  process.exit();
}

// For handling authentication POST
app.use(express.urlencoded({ extended: false }));

// Use session middleware
app.use(session({
  cookie: { maxAge: 24 * 60 * 60 * 1000 },
  resave: false,
  saveUninitialized: false,
  secret: process.env.SECRET || crypto.randomBytes(32).toString('hex'),
  store: new MemoryStore({ checkPeriod: 24 * 60 * 60 * 1000 }),
}));

// Use authenticator middleware
app.use(authenticator);

// Serve webapp routes
app.get(/^\/(player|work|circle|tag|va)s?\/(\d+)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
});

// Serve static files from 'dist' folder
app.use(express.static('dist'));

// If 404'd, serve from 'static' folder
app.use('/static', express.static('static'));

// Expose API routes
app.use('/api', routes);

// Expose authentication route
app.use('/auth', authRoutes);

// Start server
app.listen(process.env.PORT || 8888, () => {
  // eslint-disable-next-line no-console
  console.log(`Express listening on http://localhost:${process.env.PORT || 8888}`);
});
