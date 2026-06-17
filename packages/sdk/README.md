# @cgpu-max/sdk

Official Node.js client for the [CGPU-MAX](../../README.md) public API. Requires an Enterprise API key.

## Usage

```ts
import { CgpuMaxClient } from '@cgpu-max/sdk';

const client = new CgpuMaxClient({ apiKey: process.env.CGPU_MAX_API_KEY! });

// List processors
const { items } = await client.listProcessors({ type: 'GPU', manufacturer: 'NVIDIA', limit: 10 });

// Get one
const gpu = await client.getProcessor('nvidia-rtx-4090');

// Compare
const result = await client.compare('intel-core-i9-14900k', 'amd-ryzen-9-9950x');

// Bottleneck
const bn = await client.bottleneck('intel-core-i9-14900k', 'nvidia-rtx-4090');
```

Errors throw `CgpuMaxApiError` with `.status` and `.code`.

Point at a non-production endpoint via `baseUrl`:

```ts
new CgpuMaxClient({ apiKey, baseUrl: 'http://localhost:3001/api/public/v1' });
```
