'use strict';

/**
 * drone service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::drone.drone');
