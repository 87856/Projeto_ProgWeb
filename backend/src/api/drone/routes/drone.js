'use strict';

/**
 * drone router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::drone.drone');
