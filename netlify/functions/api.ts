import serverless from 'serverless-http';
import startServer from '../../server';

let cachedApp: any = null;

async function getApp() {
  if (!cachedApp) {
    cachedApp = await startServer();
  }
  return cachedApp;
}

export const handler = async (event: any, context: any) => {
  try {
    const app = await getApp();
    const wrapper = serverless(app);
    return wrapper(event, context);
  } catch (error) {
    console.error('[FUNCTION ERROR] Initialization failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error during initialization', details: error instanceof Error ? error.message : String(error) }),
    };
  }
};
