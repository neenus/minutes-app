declare module "json-to-env-converter" {
  export interface JsonToEnvOptions {
    prefix?: string;
  }

  export type JsonValue = string | number | boolean | null | JsonObject;

  export interface JsonObject {
    [key: string]: JsonValue | JsonValue[];
  }

  export function jsonToENV(
    json: JsonObject,
    options?: JsonToEnvOptions
  ): Record<string, string>;

  export default jsonToENV;
}