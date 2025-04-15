import * as SecureStore from "expo-secure-store";

/**
 * Stores a value securely in the device's storage.
 *
 * @param key - The key under which the value will be stored.
 * @param credential_value - The value to be securely stored.
 * @returns A promise that resolves when the value has been successfully stored.
 */
export async function storeValue(key: string, credential_value: string) {
  await SecureStore.setItemAsync(key, credential_value);
}

/**
 * Retrieves a stored value from secure storage using the provided key.
 *
 * @param key - The key associated with the value to retrieve.
 * @returns A promise that resolves to the stored value as a string.
 * @throws An error if the value is not found in secure storage.
 */
export async function getStoredValue(key: string) {
  let credential = await SecureStore.getItemAsync(key);
  if (!credential) {
    throw new Error("Value not found");
  }
  return credential;
}

/**
 * Stores an object in secure storage under the specified key.
 *
 * @param key - The key under which the object will be stored.
 * @param object - The object to be stored.
 * @returns A promise that resolves when the object has been successfully stored.
 */
export async function storeObject(key: string, object: object) {
  const jsonValue = JSON.stringify(object);
  await SecureStore.setItemAsync(key, jsonValue);
}

/**
 * Retrieves a stored object from secure storage by its key.
 *
 * @param key - The key associated with the stored object.
 * @returns A promise that resolves to the parsed object retrieved from secure storage.
 * @throws An error if the object is not found or the key does not exist.
 */
export async function getStoredObject(key: string) {
  const jsonValue = await SecureStore.getItemAsync(key);
  if (!jsonValue) {
    throw new Error("Object not found");
  }
  return JSON.parse(jsonValue);
}
