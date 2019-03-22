import validator from 'validator';

export class Validation {

  /**
   * @param {any} data
   * @returns {any}
   */
  static escape(data) {

    /** @type {any} */
    let escapedData = null;

    if (data !== null) {

      if (typeof data === 'string') {

        escapedData = validator.escape(data);

      } else if (Array.isArray(data)) {

        escapedData = Validation.escapeArray(data);

      } else if (typeof data === 'object') {

        escapedData = Validation.escapeObject(data);

      } else {

        escapedData = data;

      }

    }

    return escapedData;

  }

  /**
   * @param {Object} data
   * @returns {Object}
   */
  static escapeObject(data) {

    let escapedData = {};

    for (let prop in data) {

      if (data.hasOwnProperty(prop)) {

        escapedData[prop] = Validation.escape(data[prop]);

      }

    }

    return escapedData;

  }

  /**
   * @param {any[]} data
   * @returns {any[]}
   */
  static escapeArray(data) {

    return data.map((value) => Validation.escape(value));

  }

}
