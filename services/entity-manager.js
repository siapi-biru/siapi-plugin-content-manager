'use strict';

const { assoc, has, prop, omit } = require('lodash/fp');
const siapiUtils = require('siapi-utils');

const { sanitizeEntity } = siapiUtils;
const { hasDraftAndPublish } = siapiUtils.contentTypes;
const { PUBLISHED_AT_ATTRIBUTE, CREATED_BY_ATTRIBUTE } = siapiUtils.contentTypes.constants;
const { ENTRY_PUBLISH, ENTRY_UNPUBLISH } = siapiUtils.webhook.webhookEvents;

const omitPublishedAtField = omit(PUBLISHED_AT_ATTRIBUTE);

const emitEvent = (event, fn) => async (entity, model) => {
  const result = await fn(entity, model);

  const modelDef = siapi.getModel(model);

  siapi.eventHub.emit(event, {
    model: modelDef.modelName,
    entry: sanitizeEntity(result, { model: modelDef }),
  });

  return result;
};

const findCreatorRoles = entity => {
  const createdByPath = `${CREATED_BY_ATTRIBUTE}.id`;

  if (has(createdByPath, entity)) {
    const creatorId = prop(createdByPath, entity);
    return siapi.query('role', 'admin').find({ 'users.id': creatorId }, []);
  }

  return [];
};

module.exports = {
  async assocCreatorRoles(entity) {
    if (!entity) {
      return entity;
    }

    const roles = await findCreatorRoles(entity);
    return assoc(`${CREATED_BY_ATTRIBUTE}.roles`, roles, entity);
  },

  find(params, model, populate) {
    return siapi.entityService.find({ params, populate }, { model });
  },

  findPage(params, model, populate) {
    return siapi.entityService.findPage({ params, populate }, { model });
  },

  findWithRelationCounts(params, model, populate) {
    return siapi.entityService.findWithRelationCounts({ params, populate }, { model });
  },

  search(params, model, populate) {
    return siapi.entityService.search({ params, populate }, { model });
  },

  searchPage(params, model, populate) {
    return siapi.entityService.searchPage({ params, populate }, { model });
  },

  searchWithRelationCounts(params, model, populate) {
    return siapi.entityService.searchWithRelationCounts({ params, populate }, { model });
  },

  count(params, model) {
    return siapi.entityService.count({ params }, { model });
  },

  async findOne(id, model, populate) {
    return siapi.entityService.findOne({ params: { id }, populate }, { model });
  },

  async findOneWithCreatorRoles(id, model, populate) {
    const entity = await this.findOne(id, model, populate);

    if (!entity) {
      return entity;
    }

    return this.assocCreatorRoles(entity);
  },

  async create(body, model) {
    const modelDef = siapi.getModel(model);
    const publishData = { ...body };

    if (hasDraftAndPublish(modelDef)) {
      publishData[PUBLISHED_AT_ATTRIBUTE] = null;
    }

    return siapi.entityService.create({ data: publishData }, { model });
  },

  update(entity, body, model) {
    const params = { id: entity.id };
    const publishData = omitPublishedAtField(body);

    return siapi.entityService.update({ params, data: publishData }, { model });
  },

  delete(entity, model) {
    const params = { id: entity.id };
    return siapi.entityService.delete({ params }, { model });
  },

  findAndDelete(params, model) {
    return siapi.entityService.delete({ params }, { model });
  },

  publish: emitEvent(ENTRY_PUBLISH, async (entity, model) => {
    if (entity[PUBLISHED_AT_ATTRIBUTE]) {
      throw siapi.errors.badRequest('already.published');
    }

    // validate the entity is valid for publication
    await siapi.entityValidator.validateEntityCreation(siapi.getModel(model), entity);

    const params = { id: entity.id };
    const data = { [PUBLISHED_AT_ATTRIBUTE]: new Date() };

    return siapi.entityService.update({ params, data }, { model });
  }),

  unpublish: emitEvent(ENTRY_UNPUBLISH, (entity, model) => {
    if (!entity[PUBLISHED_AT_ATTRIBUTE]) {
      throw siapi.errors.badRequest('already.draft');
    }

    const params = { id: entity.id };
    const data = { [PUBLISHED_AT_ATTRIBUTE]: null };

    return siapi.entityService.update({ params, data }, { model });
  }),
};
