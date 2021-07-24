'use strict';

const _ = require('lodash');

module.exports = async (ctx, next) => {
  const { model } = ctx.params;

  const ct = siapi.contentTypes[model];

  if (!ct) {
    return ctx.send({ error: 'contentType.notFound' }, 404);
  }

  const target = ct.plugin === 'admin' ? siapi.admin : siapi.plugins[ct.plugin];

  const actionPath = ['config', 'layout', ct.modelName, 'actions', ctx.request.route.action];

  if (_.has(target, actionPath)) {
    const [controller, action] = _.get(target, actionPath, []).split('.');

    if (controller && action) {
      return await target.controllers[controller.toLowerCase()][action](ctx);
    }
  }

  await next();
};
