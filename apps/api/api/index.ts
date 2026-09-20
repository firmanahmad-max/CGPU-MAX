// Vercel serverless entrypoint for the CGPU-MAX API.
//
// The whole Express app runs as a single Node serverless function. We import the
// *compiled* app from `dist/` (produced by `tsc` in the build step) rather than
// from `src/` so Vercel's bundler doesn't have to resolve our NodeNext `.js`
// import specifiers against `.ts` sources. `vercel.json` rewrites every path to
// this function, so Express keeps its own routing (`/health`, `/api/v1/...`).
//
// An Express app is itself a `(req, res)` handler, which is exactly what
// Vercel's Node runtime invokes — so the default export is the app.
import { createServer } from '../dist/server.js';

const app = createServer();

export default app;
