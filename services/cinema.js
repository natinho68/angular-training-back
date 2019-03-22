import { Database } from './database';

export class Cinema {

  /** @returns {Movie[]} */
  getMovies() {

    return Database.collection('movies').find();

  }

  /**
   * @param {number} id
   * @returns {MovieWithSchedules}
   */
  getMovie(id) {

    let movie = Object.assign({}, /** @type {MovieWithSchedules} */ (Database.collection('movies').findOne(id)));

    /* S'il y a des séances prévues, remplace les ids des schedules pour les données réelles */
    if (('schedulesIds' in movie) && (movie.schedulesIds != null)) {

      movie.schedules = movie.schedulesIds
        .map((id) => /** @type {Schedule} */ (Database.collection('schedules').findOne(id)))
        .map((schedule) => this.fillScheduleTheater(schedule));

    }

    return movie;

  }

  /** @returns {Category[]} */
  getCategories() {

    return Database.collection('categories').find();

  }

  /** @returns {Theater[]} */
  getTheaters() {

    return Database.collection('theaters').find();

  }

  /**
   * @param {number} id
   * @returns {TheaterWithSchedules}
   */
  getTheater(id) {

    let theater = Object.assign({}, /** @type {TheaterWithSchedules} */ (Database.collection('theaters').findOne(id)));

    /* S'il y a des séances prévues, remplace les ids des schedules pour les données réelles */
    if (('schedulesIds' in theater) && (theater.schedulesIds != null)) {

      theater.schedules = theater.schedulesIds
        .map((id) => /** @type {Schedule} */ (Database.collection('schedules').findOne(id)))
        .map((schedule) => this.fillScheduleMovie(schedule));

    }

    return theater;

  }

  /**
   * @param {number} id
   * @returns {ApiResponse<Reservation>}
   */
  book(id) {

    const scheduleQuery = /** @type {Schedule | null} */ (Database.collection('schedules').findOne(id));

    if (!scheduleQuery) {
      return { success: false, error: `Réservation impossible.` };
    }

    const schedule = this.fillScheduleTheater(this.fillScheduleMovie(scheduleQuery));

    if (!schedule.movie || !schedule.theater) {
      return { success: false, error: `Réservation impossible.` };
    }

    return {
      success: true,
      data: {
        movieTitle: schedule.movie.title,
        theaterTitle: schedule.theater.title,
        scheduleId: id,
        scheduleHour: schedule.hour
      }
    };

  }

  /**
   * @param {Schedule} schedule
   * @returns {Schedule}
   */
  fillScheduleMovie(schedule) {

    const newSchedule = Object.assign({}, schedule);

    newSchedule.movie = /** @type {Movie | null} */ (Database.collection('movies').findOne(schedule.movieId));

    return newSchedule;

  }

  /**
   * @param {Schedule} schedule
   * @returns {Schedule}
   */
  fillScheduleTheater(schedule) {

    const newSchedule = Object.assign({}, schedule);

    newSchedule.theater = /** @type {Theater | null} */ (Database.collection('theaters').findOne(schedule.theaterId));

    return newSchedule;

  }

  /** @returns {Slide[]} */
  getSlides() {

    return Database.collection('slides').find();

  }

  /**
   * @param {Movie} movie
   * @returns {ApiResponse}
   */
  addMovie(movie) {

    Database.collection('movies').insertOne(movie);

    return { success: true };

  }

  /**
   * @param {Partial<Movie>} movie
   * @returns {ApiResponse}
   */
  updateMovie(movie) {

    Database.collection('movies').updateOne(movie);

    return { success: true };

  }

  /**
   * @param {number} id
   * @returns {ApiResponse}
   */
  deleteMovie(id) {

    return this.deleteMovies([id]);

  }

  /**
   * @param {number[]} idList
   * @returns {ApiResponse}
   */
  deleteMovies(idList) {

    Database.collection('movies').deleteMany(idList);

    return { success: true };

  }

}
