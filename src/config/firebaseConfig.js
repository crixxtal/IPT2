// Import needed Firebase modules
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Your Firebase project configuration (from Firebase console)
const firebaseConfig = {
    apiKey: 'AIzaSyBFabHR6sDor3Np52rCPCC2m49zUgt120A',
    authDomain: 'edu-platform-95c0f.firebaseapp.com',
    projectId: 'edu-platform-95c0f',
    storageBucket: 'edu-platform-95c0f.firebasestorage.app',
    messagingSenderId: '285378478750',
    appId: '1:285378478750:web:63a846a88f748f4976b18f',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Export Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
