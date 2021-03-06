'use strict';

const { createTestBuilder } = require('../../../../test/helpers/builder');
const { createSiapiInstance } = require('../../../../test/helpers/siapi');
const { createAuthRequest } = require('../../../../test/helpers/request');

const builder = createTestBuilder();
let siapi;
let rq;

const ct = {
  name: 'withemail',
  attributes: {
    field: {
      type: 'email',
    },
  },
};

describe('Test type email', () => {
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
    const res = await rq.post(
      '/content-manager/collection-types/application::withemail.withemail',
      {
        body: {
          field: 'validemail@test.fr',
        },
      }
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      field: 'validemail@test.fr',
    });
  });

  test('Should Throw on invalid email', async () => {
    const res = await rq.post(
      '/content-manager/collection-types/application::withemail.withemail',
      {
        body: {
          field: 'invalidemail',
        },
      }
    );

    expect(res.statusCode).toBe(400);
  });

  test('Create entry with value input Formdata', async () => {
    const res = await rq.post(
      '/content-manager/collection-types/application::withemail.withemail',
      {
        body: {
          field: 'test@email.fr',
        },
      }
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      field: 'test@email.fr',
    });
  });

  test('Reading entry returns correct value', async () => {
    const res = await rq.get('/content-manager/collection-types/application::withemail.withemail');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: expect.any(String),
        }),
      ])
    );
  });

  test('Updating entry sets the right value and format', async () => {
    const res = await rq.post(
      '/content-manager/collection-types/application::withemail.withemail',
      {
        body: {
          field: 'valid@email.fr',
        },
      }
    );

    const updateRes = await rq.put(
      `/content-manager/collection-types/application::withemail.withemail/${res.body.id}`,
      {
        body: {
          field: 'new-email@email.fr',
        },
      }
    );

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body).toMatchObject({
      id: res.body.id,
      field: 'new-email@email.fr',
    });
  });
});
