'use strict';

// Helpers.
const { createTestBuilder } = require('../../../test/helpers/builder');
const { createSiapiInstance } = require('../../../test/helpers/siapi');
const { createAuthRequest } = require('../../../test/helpers/request');

const builder = createTestBuilder();
let siapi;
let rq;
let uid = 'application::single-type-model.single-type-model';

const ct = {
  kind: 'singleType',
  name: 'single-type-model',
  attributes: {
    title: {
      type: 'string',
    },
  },
};

describe('Content Manager single types', () => {
  beforeAll(async () => {
    await builder.addContentType(ct).build();

    siapi = await createSiapiInstance();
    rq = await createAuthRequest({ siapi });
  });

  afterAll(async () => {
    await siapi.destroy();
    await builder.cleanup();
  });

  test('Label is not pluralized', async () => {
    const res = await rq({
      url: `/content-manager/content-types?kind=singleType`,
      method: 'GET',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          info: expect.objectContaining({
            label: 'Single-type-model',
          }),
        }),
      ])
    );
  });

  test('find single type content returns 404 when not created', async () => {
    const res = await rq({
      url: `/content-manager/single-types/${uid}`,
      method: 'GET',
    });

    expect(res.statusCode).toBe(404);
  });

  test('Create content', async () => {
    const res = await rq({
      url: `/content-manager/single-types/${uid}`,
      method: 'PUT',
      body: {
        title: 'Title',
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      id: expect.anything(),
      title: 'Title',
    });
  });

  test('find single type content returns an object ', async () => {
    const res = await rq({
      url: `/content-manager/single-types/${uid}`,
      method: 'GET',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      id: expect.anything(),
      title: 'Title',
    });
  });
});
