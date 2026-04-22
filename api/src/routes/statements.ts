import { Hono } from 'hono';
import type { AuthVariables } from '../middleware/auth.js';

export const statementsRouter = new Hono<{ Variables: AuthVariables }>();

statementsRouter.get('/', (c) => {
  return c.json({
    data: [],
    meta: {
      placeholder: true,
      message: 'TODO: implement statements listing in Phase 1 functional pass.'
    }
  });
});

statementsRouter.post('/upload', (c) => {
  return c.json(
    {
      error: 'Not implemented',
      message: 'TODO: implement PDF upload + statement persistence in Phase 1 functional pass.'
    },
    501
  );
});

statementsRouter.get('/:id/transactions', (c) => {
  return c.json({
    data: [],
    meta: {
      statementId: Number(c.req.param('id')),
      placeholder: true,
      message: 'TODO: implement statement transaction listing in Phase 1 functional pass.'
    }
  });
});
