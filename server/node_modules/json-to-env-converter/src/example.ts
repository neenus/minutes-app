import { jsonToEnv } from './index';

const config = {
  database: {
    host: 'localhost',
    port: 5432,
  },
  api: {
    key: 'my-api-key',
    retries: 3,
  },
  enableFeatureX: true,
};

// Convert JSON to environment variables
jsonToEnv(config, { prefix: 'APP_' });

// Access environment variables
console.log(process.env.APP_DATABASE_HOST); // "localhost"
console.log(process.env.APP_DATABASE_PORT); // "5432"
console.log(process.env.APP_API_KEY); // "my-api-key"
console.log(process.env.APP_ENABLEFEATUREX); // "true"
