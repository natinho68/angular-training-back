import validator from 'validator';
import jwt from 'jsonwebtoken';

import { Database } from './database';
import { config } from './config';

export class Account {

  /** @returns {User[]} */
  get users() {

    return Database.collection('users').find();

  }

  /**
   * @param {User} user
   * @returns {void}
   */
  saveUser(user) {

    Database.collection('users').insertOne(user);

  }

  /**
   * @param {string} email
   * @returns {User | false}
   */
  isUserExisting(email) {

    return Database.collection('users').findOne({ email }) || false;

  }

  /**
   * @param {UserInput} inputs
   * @returns {UserInput}
   */
  filterInputs(inputs) {

    const email = validator.escape((typeof inputs.email === 'string') ? inputs.email : '');

    let password = inputs.password;

    if (typeof inputs.password === 'object') {

      let { password1, password2 } = inputs.password;
      password1 = (typeof password1 === 'string') ? password1 : '';
      password2 = (typeof password2 === 'string') ? password2 : '';

      password = { password1, password2 };

    } else if (typeof password !== 'string') {
      password = '';
    }

    return { email, password };

  }

  /**
   * @param {UserInput} inputs
   * @returns {string[]}
   */
  validateInputs(inputs) {

    /* Vérification des données (champs obligatoires, formats...) */
    let errors = [];

    if (validator.isEmpty(inputs.email)) {
      errors.push(`L'adresse e-mail est obligatoire.`);
    } else if (!validator.isEmail(inputs.email)) {
      errors.push(`L'adresse e-mail est invalide.`);
    }

    if ((typeof inputs.password === 'string') && validator.isEmpty(inputs.password)) {
      errors.push(`Le mot de passe est obligatoire.`);
    } else if (typeof inputs.password === 'object') {

      let { password1, password2 } = inputs.password;
      password1 = (typeof password1 === 'string') ? password1 : '';
      password2 = (typeof password2 === 'string') ? password2 : '';

      if (!password1 && !password2) {
        errors.push(`Le mot de passe est obligatoire.`);
      } else if (password1 !== password2) {
        errors.push(`Les deux mots de passe ne sont pas identiques.`);
      }

    }

    return errors;

  }

  /**
   * @param {UserInput} inputs
   * @returns {User}
   */
  normalizeInputs(inputs) {

    return {
      email: validator.normalizeEmail(inputs.email) || '',
      hash: (typeof inputs.password === 'string') ? inputs.password : inputs.password.password1
    };

  }

  /**
   * @param {UserInput} body
   * @returns {ApiResponse}
   */
  register(body) {

    let { email, password } = body;

    /* Filtrage des données utilisateur avec le module validator */
    let inputs = this.filterInputs({ email, password });

    let errors = this.validateInputs(inputs);

    /* S'il y a des erreurs, on les envoie au client en JSON */
    if (errors.length !== 0) {

      return {
        success: false,
        error: errors.join('')
      };

    } else {

      /** @todo Hash password */

      /* Données formattées finales */
      let userData = this.normalizeInputs(inputs);

      /* Requête de sélection pour vérifier si cet email existe déjà en base */
      if (this.isUserExisting(userData.email)) {

        return {
          success: false,
          error: `Ce compte existe déjà.`
        };

      } else {

        /* Sinon insertion du nouveau compte en base */
        this.saveUser(userData);

        return { success: true };

      }

    }

  }

  /**
   * @param {{ email: string; password: string; }} body
   * @returns {ApiResponse<Token>}
   */
  login(body) {

    let { email, password } = body;

    /* Filtrage des données utilisateur avec le module validator */
    let inputs = this.filterInputs(body);

    let errors = this.validateInputs(inputs);

    /* S'il y a des erreurs, on les envoie au client en JSON */
    if (errors.length !== 0) {

      return {
        success: false,
        error: errors.join('')
      };

    } else {

      let userData = this.normalizeInputs(inputs);

      let user = this.isUserExisting(userData.email);

      if (!user) {

        return {
          success: false,
          error: `Ce compte n'existe pas.`
        };

      } else {

        if (userData.hash !== user.hash) {

          return {
            success: false,
            error: `Mot de passe incorrect.`
          };

        } else {

          /* Stockage des données utilisateur en session en cas de succès */
          let token = jwt.sign({
            email: inputs.email
          }, config.jwtSecret);

          return {
            success: true,
            data: { token }
          };

        }

      }

    }

  }

  /**
   * @param {string} inputEmail
   * @returns {ApiResponse}
   */
  isAccountAvailable(inputEmail) {

    const email = (typeof inputEmail === 'string') ? validator.escape(inputEmail) : '';

    if (email && this.isUserExisting(email)) {

      return {
        success: false,
        error: `Ce compte existe déjà.`
      };

    }

    return { success: true };

  }

}
