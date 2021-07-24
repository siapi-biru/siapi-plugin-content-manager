'use strict';

const { createTestBuilder } = require('../../../../test/helpers/builder');
const { createSiapiInstance } = require('../../../../test/helpers/siapi');
const { createAuthRequest } = require('../../../../test/helpers/request');

const builder = createTestBuilder();
let siapi;
let rq;

const ct = {
  name: 'withtext',
  attributes: {
    field: {
      type: 'text',
    },
  },
};

describe('Test type text', () => {
  beforeAll(async () => {
    await builder.addContentType(ct).build();

    siapi = await createSiapiInstance();
    rq = await createAuthRequest({ siapi });
  });

  afterAll(async () => {
    await siapi.destroy();
    await builder.cleanup();
  });

  test('Creates an entry with JSON', async () => {
    const res = await rq.post('/content-manager/collection-types/application::withtext.withtext', {
      body: {
        field: 'Some\ntext',
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      field: 'Some\ntext',
    });
  });

  test('Reading entry, returns correct value', async () => {
    const res = await rq.get('/content-manager/collection-types/application::withtext.withtext');

    expect(res.statusCode).toBe(200);
    expect(res.body.pagination).toBeDefined();
    expect(Array.isArray(res.body.results)).toBe(true);
    res.body.results.forEach(entry => {
      expect(entry.field).toEqual(expect.any(String));
    });
  });

  test('Updating entry with JSON sets the right value and format', async () => {
    const res = await rq.post('/content-manager/collection-types/application::withtext.withtext', {
      body: { field: 'Some \ntext' },
    });

    const updateRes = await rq.put(
      `/content-manager/collection-types/application::withtext.withtext/${res.body.id}`,
      {
        body: { field: 'Updated \nstring' },
      }
    );
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body).toMatchObject({
      id: res.body.id,
      field: 'Updated \nstring',
    });
  });
});
