import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';

import { publicRoutes, adminRoutes } from './routes';
import { authCheck } from './services/auth';

/* Initialisation d'Express, le principal framework web pour Node */
const app = express();

/* Traitement JSON des données reçues en POST */
app.use(express.json());

/* Compression gzip */
app.use(compression());

/* Vérifie le token JWT */
app.use(authCheck);

/* CSRF protection */
app.use(cookieParser());
const csrfProtection = csrf({ cookie: true });
// app.use('/api/account', csrfProtection);

/* Content Security Policy */
app.use((req, res, next) => {

  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

  //res.set('Content-Security-Policy', `default-src 'self'; form-action 'self'; base-uri 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; frame-src 'self' https://www.youtube.com; object-src 'none'; require-sri-for script style;`);

  next();

});

/* Static files */
app.use(express.static('htdocs', { index: false }));
app.use('/api/images', express.static('static'));

/* Admin */
app.use('/api/admin', adminRoutes);
/* API routing */
app.use('/api', publicRoutes);

/* robots.txt */
app.get('/robots.txt', (req, res) => {

  res.sendFile(`${__dirname}/robots.txt`);

});

/* For all others routes, serve index.html, where Angular will take care of app routing */
app.get('*', csrfProtection, (req, res) => {

  /* CSRF cookie on first load */
  res.cookie('XSRF-TOKEN', req.csrfToken());

  res.sendFile(`${__dirname}/htdocs/index.html`);

});

/* Lancement du serveur web */
app.listen(3000, () => {

  console.log(`Backend API running on http://localhost:3000`);

}).on('error', (e) => {

  const error = /** @type {any} */ (e);

  if (error.code === 'EADDRINUSE') {

    const newError = new Error(`Backend API already running in another terminal, or something else is already using http://localhost:3000`);
    newError.stack = '';

    throw newError;

  }

  throw error;

});
