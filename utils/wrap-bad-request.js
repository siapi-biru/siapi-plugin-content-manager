'use strict';

module.exports = fn => async (...args) => {
  try {
    await fn(...args);
  } catch (error) {
    if (siapi.errors.isBoom(error)) {
      throw error;
    }

    // these are errors like unique constraints
    siapi.log.error(error);
    throw siapi.errors.badRequest('Invalid input data. Please verify unique constraints');
  }
};
