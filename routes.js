import { Router } from 'express';

import { Cinema } from './services/cinema';
import { Autocomplete } from './services/autocomplete';
import { Account } from './services/account';
import { Database } from './services/database';
import { Validation } from './services/validation';

export const publicRoutes = Router();
export const adminRoutes = Router();

const cinema = new Cinema();
const autocomplete = new Autocomplete();
const account = new Account();

/* Requêtes des slides */
publicRoutes.get('/cinema/slides', (req, res) => {

  res.json(cinema.getSlides());

});

/* Requêtes de tous les films */
publicRoutes.get('/cinema/movies', (req, res) => {

  res.json(cinema.getMovies());

});

/* Requêtes d'un film spécifique */
publicRoutes.get('/cinema/movie/:id', (req, res) => {

  const id = Number.parseInt(req.params.id, 10) || 1;

  res.json(cinema.getMovie(id));

});

/* Requêtes de toutes les catégories de films */
publicRoutes.get('/cinema/categories', (req, res) => {

  res.json(cinema.getCategories());

});

/* Requêtes de tous les cinémas */
publicRoutes.get('/cinema/theaters', (req, res) => {

  res.json(cinema.getTheaters());

});

/* Requêtes d'un cinéma spécifique */
publicRoutes.get('/cinema/theater/:id', (req, res) => {

  const id = Number.parseInt(req.params.id, 10) || 1;

  res.json(cinema.getTheater(id));

});

/* Requêtes de tous les cinémas */
publicRoutes.post('/book', (req, res) => {

  const { schedule: id } = req.body;

  res.json(((typeof id === 'number') && id) ?
    cinema.book(id) :
    { success: false, errors: [`Réservation impossible.`] }
  );

});

publicRoutes.get('/autocomplete/:city', (req, res) => {

  res.json(autocomplete.getSuggestions(req.params.city));

});

/* Requête d'inscription */
publicRoutes.post('/account/register', (req, res) => {

  res.json(account.register(req.body));

});

/* Requête de tentative de connexion */
publicRoutes.post('/account/login', (req, res) => {

  res.json(account.login(req.body));

});

/* Requête de tentative de connexion */
publicRoutes.get('/account/available/:email', (req, res) => {

  res.json(account.isAccountAvailable(req.params.email));

});

/* Administration */
adminRoutes.put('/movie', (req, res) => {

  res.json(cinema.addMovie(Validation.escape(req.body)));

});

adminRoutes.post('/movie', (req, res) => {

  res.json(cinema.updateMovie(Validation.escape(req.body)));

});

adminRoutes.delete('/movie/:id', (req, res) => {

  const id = Number.parseInt(req.params.id, 10);

  res.json(id ? cinema.deleteMovie(id) : { success: false, errors: [`Suppression impossible.`] });

});

adminRoutes.delete('/movies/:ids', (req, res) => {

  const ids = !('ids' in req.params) ? [] :
    /** @type {string} */ (req.params.ids).split(',').map((id) => Number.parseInt(id)).filter((id) => id);

  res.json((ids.length > 0) ?
    cinema.deleteMovies(ids) :
    { success: false, errors: [`Suppression impossible.`] }
  );

});

adminRoutes.post('/reset', (req, res) => {

  Database.reset();

  res.json({ success: true, errors: [] });

});

publicRoutes.get('*', (req, res) => {

  res.sendStatus(404);

});
