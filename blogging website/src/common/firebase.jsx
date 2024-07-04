/* eslint-disable no-unused-vars */
import { initializeApp } from "firebase/app";
import { signInWithPopup, GoogleAuthProvider, getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAaP9He5uTdR2XXZRFcvvbyRtZTwtwDflI",
    authDomain: "intcom-627e3.firebaseapp.com",
    projectId: "intcom-627e3",
    storageBucket: "intcom-627e3.appspot.com",
    messagingSenderId: "659906813753",
    appId: "1:659906813753:web:51cfface7b4232490b12e8"
  };

const app = initializeApp(firebaseConfig);

// Google Auth

const provider = new GoogleAuthProvider();

const auth = getAuth();

export const authWithGoogle = async () => {

    let user = null;

    await signInWithPopup(auth, provider)
    .then((result) => {        
        user = result.user;
    })
    .catch((error) => {
        console.log(error)
    });

    return user;

}