import fs from 'fs';
import path from 'path';

export class Database {

  /**
   * @param {string} name
   * @returns {Collection}
   */
  static collection(name) {

    if (!databases.has(name)) {
      databases.set(name, new Collection(name, JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', `${name}.json`), 'utf8'))))
    }

    return /** @type {Collection} */ (databases.get(name));
  }

  /**
   * @param {string} name
   * @param {any[]} collection
   */
  static write(name, collection) {

    fs.writeFile(path.join(__dirname, '..', 'data', `${name}.json`), JSON.stringify(collection), (error) => {
      if (error) {
        console.log(error);
      }
    });

  }

  /** @returns {void} */
  static reset() {

    const dataList = ['movies', 'categories', 'schedules', 'theaters', 'slides', 'users'];

    dataList.forEach((data) => {

      fs.writeFile(path.join(__dirname, '..', 'data', `${data}.json`), fs.readFileSync(path.join(__dirname, '..', 'data', 'backup', `${data}.json`), 'utf8'), (error) => {
        if (error) {
          console.log(error);
        }
      });

    });

  }

}

export class Collection {

  /**
   * @param {string} name
   * @param {Object[]} data
   */
  constructor(name, data = []) {
    this.name = name;
    /** @type {Object[]} */
    this.collection = data;
  }

  /**
   * @param {number | Object} query
   * @returns {any | null}
   */
  findOne(query = {}) {

    const data = this.find((typeof query === 'number') ? { id: query } : query);

    return (data.length > 0) ? data[0] : null;

  }

  /**
   * @param {Object} query
   * @returns {any[]}
   */
  find(query = {}) {

    let collection = this.collection;

    for (let condition in query) {

      if (query.hasOwnProperty(condition)) {

        collection = collection.filter((data) => (data.hasOwnProperty(condition)) && (data[condition] === query[condition]));

      }

    }

    return collection;
  }

  /**
   * @param {Object} data
   * @returns {Collection}
   */
  insertOne(data) {

    const dataWithId = Object.assign({}, data, { id: this.getNewId() });

    this.collection.push(dataWithId);

    this.save();

    return this;

  }

  /**
   * @returns {number}
   */
  getNewId() {

    return (this.collection.length > 0) ? (Math.max(...this.collection.map((data) => data.id)) + 1) : 1;

  }

  /**
   * @param {Object} newData
   * @returns {Collection}
   */
  updateOne(newData) {

    this.collection = this.collection.map((data) => {
      if (data.id === newData.id) {
        return Object.assign(data, newData);
      }
      return data;
    });

    this.save();

    return this;

  }

  /**
   * @param {number} id
   * @returns {Collection}
   */
  deleteOne(id) {

    this.deleteMany([id]);

    return this;

  }

  /**
   * @param {number[]} idList
   * @returns {Collection}
   */
  deleteMany(idList) {

    this.collection = this.collection.filter((data) => (idList.filter((id) => id === data.id).length === 0));

    this.save();

    return this;

  }

  save() {

    Database.write(this.name, this.collection);

  }

}

/** @type {Map<string, Collection>} */
const databases = new Map();
