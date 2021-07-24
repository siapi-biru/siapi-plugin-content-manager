'use strict';

const { omit } = require('lodash/fp');
const { getNonWritableAttributes } = require('siapi-utils').contentTypes;

module.exports = model => omit(getNonWritableAttributes(siapi.getModel(model)));
