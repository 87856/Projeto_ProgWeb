'use strict';

/**
 * drone controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::drone.drone');
