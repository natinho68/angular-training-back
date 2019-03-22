import express from 'express';
import jwt from 'jsonwebtoken';

import { config } from './config';

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
export function authCheck(req, res, next) {

  const authHeader = req.get('Authorization') || '';

  const authHeaderMatch = authHeader.match(/^Bearer (.*)/);

  const token = authHeaderMatch ? authHeaderMatch[1] : null;

  if (token) {

    try {
      jwt.verify(token, config.jwtSecret);
    } catch (error) {
      res.sendStatus(401).end();
      return;
    }

  }

  next();

}
