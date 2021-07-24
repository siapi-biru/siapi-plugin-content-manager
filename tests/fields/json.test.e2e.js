'use strict';

const { createTestBuilder } = require('../../../../test/helpers/builder');
const { createSiapiInstance } = require('../../../../test/helpers/siapi');
const { createAuthRequest } = require('../../../../test/helpers/request');

const builder = createTestBuilder();
let siapi;
let rq;

const ct = {
  name: 'withjson',
  attributes: {
    field: {
      type: 'json',
    },
  },
};

describe('Test type json', () => {
  beforeAll(async () => {
    await builder.addContentType(ct).build();

    siapi = await createSiapiInstance();
    rq = await createAuthRequest({ siapi });
  });

  afterAll(async () => {
    await siapi.destroy();
    await builder.cleanup();
  });

  test('Create entry with value input JSON', async () => {
    const inputValue = {
      key: 'value',
    };
    const res = await rq.post('/content-manager/collection-types/application::withjson.withjson', {
      body: {
        field: inputValue,
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      field: inputValue,
    });
  });

  test('Create entry with array value input JSON', async () => {
    const inputValue = [
      {
        key: 'value',
      },
      {
        key: 'value',
      },
    ];
    const res = await rq.post('/content-manager/collection-types/application::withjson.withjson', {
      body: {
        field: inputValue,
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      field: inputValue,
    });
  });

  test('Reading entry, returns correct value', async () => {
    const res = await rq.get('/content-manager/collection-types/application::withjson.withjson');

    expect(res.statusCode).toBe(200);
    expect(res.body.pagination).toBeDefined();
    expect(Array.isArray(res.body.results)).toBe(true);
    res.body.results.forEach(entry => {
      expect(entry.field).toBeDefined();
      expect(entry.field).not.toBeNull();
      expect(typeof entry.field).toBe('object');
    });
  });

  test.todo('Throw when input is not a nested object');

  test('Updating entry sets the right value and format', async () => {
    const res = await rq.post('/content-manager/collection-types/application::withjson.withjson', {
      body: {
        field: {
          key: 'value',
        },
      },
    });

    const updateRes = await rq.put(
      `/content-manager/collection-types/application::withjson.withjson/${res.body.id}`,
      {
        body: {
          field: {
            newKey: 'newVal',
          },
        },
      }
    );

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body).toMatchObject({
      id: res.body.id,
      field: { newKey: 'newVal' },
    });
  });
});
