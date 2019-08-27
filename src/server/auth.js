const path = require('path');
const express = require('express');

const config = require('../../config.json');

const router = express.Router();

router.get('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, '..', '..', 'static', 'auth.html'));
});

router.post('/', (req, res, next) => {
  if (req.body.password === config.password) {
    req.session.auth = true;
  }

  res.redirect('/');
});

const authenticator = (req, res, next) => {
  if (req.path === '/auth/'
    || req.path === '/main.css'
    || req.session.auth
    || !config.password
  ) {
    next();
  } else {
    res.redirect('/auth/');
  }
};

module.exports = { router, authenticator };
