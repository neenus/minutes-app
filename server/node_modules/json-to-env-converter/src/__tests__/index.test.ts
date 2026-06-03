const { test: jestTest, expect: jestExpect } = require('@jest/globals');
import { jsonToEnv } from "../index";

describe("jsonToEnv", () => {
  it("should correctly convert a JSON object to environment variables", () => {
    const config = {
      database: {
        host: "localhost",
        port: 5432,
      },
    };

    const result = jsonToEnv(config);

    expect(process.env.DATABASE_HOST).toBe("localhost");
    expect(process.env.DATABASE_PORT).toBe("5432");
    expect(result).toStrictEqual({
      DATABASE_HOST: "localhost",
      DATABASE_PORT: "5432",
    });
  });

  it("should apply a prefix to the environment variables if specified", () => {
    const config = {
      api: {
        key: "my-api-key",
      },
    };

    const result = jsonToEnv(config, { prefix: "APP_" });
    expect(process.env.APP_API_KEY).toBe("my-api-key");
    expect(result).toStrictEqual({
      APP_API_KEY: "my-api-key",
    });
  });

  it("should correctly handle nested objects", () => {
    const config = {
      database: {
        host: "localhost",
        port: 5432,
        credentials: {
          username: "admin",
          password: "password",
        },
      },
    };

    const result = jsonToEnv(config);

    expect(process.env.DATABASE_HOST).toBe("localhost");
    expect(process.env.DATABASE_PORT).toBe("5432");
    expect(process.env.DATABASE_CREDENTIALS_USERNAME).toBe("admin");
    expect(process.env.DATABASE_CREDENTIALS_PASSWORD).toBe("password");
    expect(result).toStrictEqual({
      DATABASE_HOST: "localhost",
      DATABASE_PORT: "5432",
      DATABASE_CREDENTIALS_USERNAME: "admin",
      DATABASE_CREDENTIALS_PASSWORD: "password",
    });
  });

  it("should correctly handle arrays", () => {
    const config = {
      database: {
        hosts: ["localhost", "http://localhost"],
      },
    };

    const result = jsonToEnv(config);

    expect(process.env.DATABASE_HOSTS).toBe("localhost,http://localhost");
    expect(result).toStrictEqual({
      DATABASE_HOSTS: "localhost,http://localhost",
    });
  });

  it("should create a .env file", () => {
    const config = {
      database: {
        host: "localhost",
        port: 5432,
      },
    };

    const result = jsonToEnv(config);

    // check if the .env file was created
    const fs = require("fs");
    const path = require("path");
    const envFilePath = path.resolve(process.cwd(), ".env");
    expect(fs.existsSync(envFilePath)).toBe(true);
  });

  it("should create a .env file with the environment variables with valid contents", () => {
    const config = {
      database: {
        host: "localhost",
        port: 5432,
      },
      api: {
        key: "my-api-key",
      }
    };

    const result = jsonToEnv(config);

    // check if the .env file was created
    const fs = require("fs");
    const path = require("path");
    const envFilePath = path.resolve(process.cwd(), ".env");
    expect(fs.existsSync(envFilePath)).toBe(true);

    // check the contents of the .env file
    const envFileContents = fs.readFileSync(envFilePath, "utf8");
    console.log(`.env file contents:\n${envFileContents}`);
    expect(envFileContents).toBe("DATABASE_HOST=localhost\nDATABASE_PORT=5432\nAPI_KEY=my-api-key");
  });
});