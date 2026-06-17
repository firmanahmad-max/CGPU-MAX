import { env } from '../../shared/config/env.js';

// Hand-maintained OpenAPI 3.1 document for the public Enterprise API. Served at
// /api/public/v1/openapi.json. Keep in sync with publicApiRouter.
export function buildOpenApiSpec() {
  return {
    openapi: '3.1.0',
    info: {
      title: 'CGPU-MAX Public API',
      version: '1.0.0',
      description:
        'Enterprise REST API for CPU/GPU data, comparison, and bottleneck analysis. ' +
        'Authenticate with an API key via the `Authorization: Bearer <key>` header.',
    },
    servers: [{ url: `${env.API_URL}/api/public/v1` }],
    security: [{ apiKey: [] }],
    components: {
      securitySchemes: {
        apiKey: { type: 'http', scheme: 'bearer', bearerFormat: 'cgpu_live_*' },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                correlationId: { type: 'string' },
              },
            },
          },
        },
        Processor: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            slug: { type: 'string' },
            type: { type: 'string', enum: ['CPU', 'GPU'] },
            manufacturer: { type: 'string', enum: ['INTEL', 'AMD', 'NVIDIA'] },
            modelName: { type: 'string' },
            generation: { type: ['integer', 'null'] },
            tdpWatts: { type: ['integer', 'null'] },
            msrpUsd: { type: ['number', 'null'] },
          },
        },
      },
    },
    paths: {
      '/processors': {
        get: {
          summary: 'List processors',
          parameters: [
            { name: 'type', in: 'query', schema: { type: 'string', enum: ['CPU', 'GPU'] } },
            {
              name: 'manufacturer',
              in: 'query',
              schema: { type: 'string', enum: ['INTEL', 'AMD', 'NVIDIA'] },
            },
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
            { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
          ],
          responses: {
            '200': {
              description: 'Paginated processor list',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      items: { type: 'array', items: { $ref: '#/components/schemas/Processor' } },
                      total: { type: 'integer' },
                      limit: { type: 'integer' },
                      offset: { type: 'integer' },
                    },
                  },
                },
              },
            },
            '401': { description: 'Missing or invalid API key' },
            '429': { description: 'Rate limit exceeded for your tier' },
          },
        },
      },
      '/processors/{slug}': {
        get: {
          summary: 'Get a processor by slug',
          parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': {
              description: 'Processor detail',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/Processor' } },
              },
            },
            '404': { description: 'Not found' },
          },
        },
      },
      '/comparisons': {
        post: {
          summary: 'Compare two processors',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['aSlug', 'bSlug'],
                  properties: {
                    aSlug: { type: 'string' },
                    bSlug: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Comparison result' },
            '400': { description: 'Incompatible or identical processors' },
          },
        },
      },
      '/bottleneck/calculate': {
        post: {
          summary: 'Calculate a CPU+GPU bottleneck across resolutions and profiles',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['cpuSlug', 'gpuSlug'],
                  properties: {
                    cpuSlug: { type: 'string' },
                    gpuSlug: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: '12-scenario bottleneck matrix' },
            '400': { description: 'Wrong processor types' },
          },
        },
      },
    },
  } as const;
}
