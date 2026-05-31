import type { Handler, HandlerContext, HandlerEvent } from '@netlify/functions';
import serverless from 'serverless-http';
import { createApp } from '../../backend/src/app';
import { ensureDatabase } from '../../backend/src/config/db';

let server: ReturnType<typeof serverless> | undefined;

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  context.callbackWaitsForEmptyEventLoop = false;

  await ensureDatabase();

  if (!server) {
    server = serverless(createApp());
  }

  return server(event, context) as ReturnType<Handler>;
};
