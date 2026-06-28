import { get, set } from "./chromeStorage";

export async function getItem(key, defaultValue = null) {
  const value = await get(key);
  return value !== null ? value : defaultValue;
}

export async function setItem(key, value) {
  return set(key, value);
}
