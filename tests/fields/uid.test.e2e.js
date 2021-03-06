'use strict';

const { createTestBuilder } = require('../../../../test/helpers/builder');
const { createSiapiInstance } = require('../../../../test/helpers/siapi');
const { createAuthRequest } = require('../../../../test/helpers/request');

let siapi;
let rq;

describe('Test type UID', () => {
  describe('No targetField, required=false, not length limits', () => {
    const model = {
      name: 'withuid',
      attributes: {
        slug: {
          type: 'uid',
        },
      },
    };

    const builder = createTestBuilder();

    beforeAll(async () => {
      await builder.addContentType(model).build();

      siapi = await createSiapiInstance();
      rq = await createAuthRequest({ siapi });
    });

    afterAll(async () => {
      await siapi.destroy();
      await builder.cleanup();
    });

    test('Creates an entry successfully', async () => {
      const res = await rq.post('/content-manager/collection-types/application::withuid.withuid', {
        body: {
          slug: 'valid-uid',
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        slug: 'valid-uid',
      });
    });

    test('Throws error on duplicate value', async () => {
      const res = await rq.post('/content-manager/collection-types/application::withuid.withuid', {
        body: {
          slug: 'duplicate-uid',
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        slug: 'duplicate-uid',
      });

      const conflicting = await rq.post(
        '/content-manager/collection-types/application::withuid.withuid',
        {
          body: {
            slug: 'duplicate-uid',
          },
        }
      );

      expect(conflicting.statusCode).toBe(400);
    });

    test('Can set value to be null', async () => {
      const res = await rq.post('/content-manager/collection-types/application::withuid.withuid', {
        body: {
          slug: null,
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        slug: null,
      });
    });
  });

  describe('No targetField, required, no length limits', () => {
    const model = {
      name: 'withrequireduid',
      attributes: {
        slug: {
          type: 'uid',
          required: true,
        },
      },
    };

    const builder = createTestBuilder();

    beforeAll(async () => {
      await builder.addContentType(model).build();

      siapi = await createSiapiInstance();
      rq = await createAuthRequest({ siapi });
    });

    afterAll(async () => {
      await siapi.destroy();
      await builder.cleanup();
    });

    test('Creates an entry successfully', async () => {
      const res = await rq.post(
        '/content-manager/collection-types/application::withrequireduid.withrequireduid',
        {
          body: {
            slug: 'valid-uid',
          },
        }
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        slug: 'valid-uid',
      });
    });

    test('Throws error on duplicate value', async () => {
      const res = await rq.post(
        '/content-manager/collection-types/application::withrequireduid.withrequireduid',
        {
          body: {
            slug: 'duplicate-uid',
          },
        }
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        slug: 'duplicate-uid',
      });

      const conflicting = await rq.post(
        '/content-manager/collection-types/application::withrequireduid.withrequireduid',
        {
          body: {
            slug: 'duplicate-uid',
          },
        }
      );

      expect(conflicting.statusCode).toBe(400);
    });

    test('Cannot set value to be null', async () => {
      const res = await rq.post(
        '/content-manager/collection-types/application::withrequireduid.withrequireduid',
        {
          body: {
            slug: null,
          },
        }
      );

      expect(res.statusCode).toBe(400);
    });
  });
});
