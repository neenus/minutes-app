import fs from 'fs';

interface JsonToEnvOptions {
  prefix?: string;
};

interface JsonObject {
  [key: string]: JsonValue | JsonValue[];
};

type JsonValue = string | number | boolean | null | JsonObject;

const jsonToEnv = (json: JsonObject, options: JsonToEnvOptions = {}): Record<string, string> => {
  const { prefix = '' } = options;

  // Check if the input is a valid JSON object
  if (typeof json !== 'object' || json === null || Array.isArray(json)) {
    throw new Error('Invalid input: Only JSON objects are supported.');
  }

  // Recursive function to flatten nested JSON
  const flatten = (obj: JsonObject, parentKey = ''): Record<string, string> => {
    const result: Record<string, string> = {};

    Object.entries(obj).forEach(([key, value]) => {
      const newKey = parentKey ? `${parentKey}_${key.toUpperCase()}` : key.toUpperCase();

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(result, flatten(value as JsonObject, newKey));
      } else {
        result[newKey] = String(value);
      }
    });

    return result;
  }

  // Flatten the JSON object
  const flattened = flatten(json);

  // Apply prefix and write to process.env
  const envVars: Record<string, string> = {};
  Object.entries(flattened).forEach(([key, value]) => {
    const envKey = `${prefix}${key}`;
    process.env[envKey] = value;
    envVars[envKey] = value;
  });

  // write to .env file
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync('.env', envContent, { "flag": "w" });

  return envVars;
}

export { jsonToEnv };