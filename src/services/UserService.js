import { auth, db } from '@/config/firebaseConfig'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth'

import { collection, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

export class UserService {
    // Register a new user & store profile
    async register(email, password, displayName, firstName = '', lastName = '') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Store extra profile data in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: displayName || '',
            firstName: firstName || displayName?.split(' ')[0] || '',
            lastName: lastName || displayName?.split(' ').slice(1).join(' ') || '',
            photoUrl: user.photoURL || '/default-avatar.png',
            createdAt: serverTimestamp(),
        })

        return user
    }

    // Login
    async login(email, password) {
        return await signInWithEmailAndPassword(auth, email, password)
    }

    // Logout
    async logout() {
        await signOut(auth)
    }

    // Get current user (Auth object)
    getCurrentAuthUser() {
        return auth.currentUser
    }

    // Listen for auth state changes
    listenAuthChanges(callback) {
        return onAuthStateChanged(auth, callback)
    }

    // Get Firestore user profile
    async getUserProfile(uid) {
        const docRef = doc(db, 'users', uid)
        const snapshot = await getDoc(docRef)
        return snapshot.exists() ? snapshot.data() : null
    }

    getUserProfileDetailsOnLoad(callback) {
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                callback(null) // not logged in
                return
            }

            const docRef = doc(db, 'users', user.uid)
            const docSnap = await getDoc(docRef)

            if (!docSnap.exists()) {
                callback(null)
                return
            }

            callback({ id: docSnap.id, ...docSnap.data() })
        })
    }

    // Update Firestore user profile
    async updateProfile(uid, data) {
        const docRef = doc(db, 'users', uid)
        await updateDoc(docRef, data)
    }
}
