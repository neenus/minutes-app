import axios from 'axios';
import dotenv from 'dotenv';

// Explicitly specify the path to the .env file
dotenv.config({ path: './.env' });

export const getConfig = async () => {

  try {
    const response = await axios.get(process.env.SECRETS_API_URL_DEV, {
      headers: {
        "x-api-key": process.env.SECRETS_API_KEY
      },
      params: {
        projectName: "incorporate-app",
      }
    });

    console.log({ getConfig: process.env.SECRETS_API_URL_DEV });

    const config = response.data;
    console.log({ getConfig: config });
    return config
  } catch (error) {
    console.error(error);
    return {};
  }
}

export default getConfig;