import firebaseApp from "./firebaseConfig"
import { authErrorMessages } from "./authErrorMessages";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "@firebase/util";

export async function signUp(email: string, password: string) {
  const auth = getAuth(firebaseApp);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user.uid;
  } catch (error) {
    if (error instanceof FirebaseError && error.code in authErrorMessages) {
      const errorMessage = authErrorMessages[error.code as keyof typeof authErrorMessages];
      throw new Error(errorMessage);
    }
    throw error;
  }
}

export async function signIn(email: string, password: string) {
    const auth = getAuth(firebaseApp);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user.uid;
      } catch (error) {
        if (error instanceof FirebaseError && error.code in authErrorMessages) {
          const errorMessage = authErrorMessages[error.code as keyof typeof authErrorMessages];
          throw new Error(errorMessage);
        }
        throw error;
      }
    }
