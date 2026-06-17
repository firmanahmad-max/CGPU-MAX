import type { RequestHandler } from 'express';
import { v4 as uuid } from 'uuid';

// `req.id` is provided by pino-http's augmentation of http.IncomingMessage
// (typed as ReqId). We set it to a string correlation id.

export const correlationId: RequestHandler = (req, res, next) => {
  const incoming = req.headers['x-correlation-id'];
  const id = typeof incoming === 'string' && incoming.length > 0 ? incoming : uuid();
  req.id = id;
  res.setHeader('x-correlation-id', id);
  next();
};
