import * as SecureStore from "expo-secure-store";

export async function storeValue(key: string, credential_value: string) {
  await SecureStore.setItemAsync(key, credential_value);
}

export async function getStoredValue(key: string) {
  let credential = await SecureStore.getItemAsync(key);
  if (!credential) {
    throw new Error("Value not found");
  }
  return credential;
}

export async function storeObject(key: string, object: object) {
  const jsonValue = JSON.stringify(object);
  await SecureStore.setItemAsync(key, jsonValue);
}

export async function getStoredObject(key: string) {
  const jsonValue = await SecureStore.getItemAsync(key);
  if (!jsonValue) {
    throw new Error("Object not found");
  }
  return JSON.parse(jsonValue);
}
