'use strict';

const {
  contentTypes: { hasDraftAndPublish },
} = require('siapi-utils');

module.exports = (ctx, next) => {
  const {
    params: { model: modelUid },
  } = ctx;

  const model = siapi.contentTypes[modelUid];

  if (!hasDraftAndPublish(model)) {
    throw siapi.errors.forbidden();
  }

  return next();
};
