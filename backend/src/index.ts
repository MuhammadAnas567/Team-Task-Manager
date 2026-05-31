// backend/src/index.ts

import { createApp } from './app';
import { connectDatabase } from './config/db';

const port = Number(process.env.PORT ?? 4000);
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';

const start = async () => {
  await connectDatabase();

  const app = createApp();

  app.get('/', (_req, res) => {
    res.redirect(frontendOrigin);
  });

  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
};

start().catch((error: Error) => {
  console.error('Failed to start API', error);
  process.exit(1);
});
