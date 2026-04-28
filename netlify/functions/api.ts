import serverless from 'serverless-http';
import startServer from '../../server';

// We need an async handler because startServer is async
// This will initialize the app on every function call (might need memoization,
// but let's start with this to ensure compatibility).
export const handler = async (event: any, context: any) => {
  const app = await startServer();
  const wrapper = serverless(app);
  return wrapper(event, context);
};
