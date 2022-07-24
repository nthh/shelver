type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }
  | JSONObject
  | JSONArray;

interface JSONArray extends Array<JSONValue> {}

export interface JSONObject {
  [k: string]: JSONValue;
}

export type BaseConfig = {
  name: string;
};
