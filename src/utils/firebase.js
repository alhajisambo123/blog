// Import necessary Firebase modules
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4pX3SqmxE0zZUwbh0oGP0R01Vj46t1_A",
  authDomain: "blog-24dc3.firebaseapp.com",
  projectId: "blog-24dc3",
  storageBucket: "blog-24dc3.appspot.com",
  messagingSenderId: "710817575557",
  appId: "1:710817575557:web:fa1f2e478ce54a31ed2fec",
  measurementId: "G-SGPGBHWCCB",
};

// Initialize Firebase and Storage
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Export app, storage, and Firebase storage utility functions
export { app, storage, ref, uploadBytesResumable, getDownloadURL };
