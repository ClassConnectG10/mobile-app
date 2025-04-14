import * as SecureStore from 'expo-secure-store';

export async function saveCredential(key: string, credential_value: string) {
    try {
        await SecureStore.setItemAsync(key, credential_value);
    } catch (error) {
        console.error("Error saving credential:", error);
    }
  }
  
  export async function getCredentialByKey(key: string) {
    try {
        let credential = await SecureStore.getItemAsync(key);
        if (!credential) {
            throw new Error("Credential not found");
        }
        return credential;
    } catch (error) {
        console.error("Error getting credential:", error);
    }
  }