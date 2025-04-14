import firebaseApp from "./firebaseConfig"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export async function signUp(email: string, password: string) {
  const auth = getAuth(firebaseApp);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User signed up:", userCredential.user);
    return userCredential.user.uid;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
    const auth = getAuth(firebaseApp);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User signed in:", userCredential.user);
        return userCredential.user.uid;
    } catch (error) {
        console.error("Error signing in:", error);
        throw error;
    }
    }
