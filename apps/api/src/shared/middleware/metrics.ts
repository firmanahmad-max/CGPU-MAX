import type { RequestHandler } from 'express';

import { httpRequestDuration, httpRequestsTotal } from '../observability/metrics.js';

// Times every request and records method/route/status. We label by the matched
// route *pattern* (e.g. /api/v1/processors/:slug), never the concrete path, to
// avoid unbounded label cardinality from slugs and ids.
export const metricsMiddleware: RequestHandler = (req, res, next) => {
  const stop = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const pattern = req.route?.path ?? '';
    const route = `${req.baseUrl}${pattern}` || 'unmatched';
    const labels = { method: req.method, route, status: String(res.statusCode) };
    stop(labels);
    httpRequestsTotal.inc(labels);
  });
  next();
};
