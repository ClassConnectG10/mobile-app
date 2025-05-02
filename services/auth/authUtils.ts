import { firebaseApp } from "./firebaseConfig";
import { authErrorMessages } from "./authErrorMessages";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { FirebaseError } from "@firebase/util";

/**
 * Signs up a new user using the provided email and password.
 *
 * @param email - The email address of the user to sign up.
 * @param password - The password for the new user account.
 * @returns A promise that resolves to the unique user ID (UID) of the newly created user.
 * @throws An error with a user-friendly message if the sign-up fails due to a Firebase error.
 *         If the error is not a Firebase error or does not match known error codes, the original error is thrown.
 */
export async function signUp(email: string, password: string) {
  const auth = getAuth(firebaseApp);
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user.uid;
  } catch (error) {
    if (error instanceof FirebaseError && error.code in authErrorMessages) {
      const errorMessage =
        authErrorMessages[error.code as keyof typeof authErrorMessages];
      throw new Error(errorMessage);
    }
    throw error;
  }
}

/**
 * Signs in a user using their email and password.
 *
 * @param email - The email address of the user.
 * @param password - The password of the user.
 * @returns A promise that resolves to the user's unique identifier (UID) upon successful sign-in.
 * @throws An error with a user-friendly message if the sign-in fails due to a known Firebase error.
 *         If the error is not recognized, the original error is thrown.
 */
export async function signIn(email: string, password: string) {
  const auth = getAuth(firebaseApp);
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user.uid;
  } catch (error) {
    if (error instanceof FirebaseError && error.code in authErrorMessages) {
      const errorMessage =
        authErrorMessages[error.code as keyof typeof authErrorMessages];
      throw new Error(errorMessage);
    }
    throw error;
  }
}
