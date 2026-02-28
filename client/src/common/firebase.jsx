import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDVFq4sLdCozk-D9YOwPpo5yJYnkF5KgZs",
  authDomain: "mern-bloggingwebsite.firebaseapp.com",
  projectId: "mern-bloggingwebsite",
  storageBucket: "mern-bloggingwebsite.firebasestorage.app",
  messagingSenderId: "445531921131",
  appId: "1:445531921131:web:fa8d4fab74b07ca07dfcae"
};

const app = initializeApp(firebaseConfig);

//Firebase Auth and Provider
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Google Sign-in Function
const authWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken(); 
    return { idToken, user: result.user };
  } catch (error) {
    console.log("Google Sign-in Error:", error.message);
    return null;
  }
};

export { auth, authWithGoogle };
