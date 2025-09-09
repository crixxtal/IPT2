// src/services/PostService.js
import { db, auth } from '@/config/firebaseConfig'
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    where,
    serverTimestamp,
    orderBy,
    getDoc,
} from 'firebase/firestore'

export class PostService {
    constructor(useNested = false) {
        // Switch between flat or nested collections
        this.useNested = useNested
    }

    // Get reference to the user's posts collection
    getPostsCollection(uid = null) {
        if (this.useNested) {
            const userId = uid || auth.currentUser?.uid
            return collection(db, 'posts', userId, 'userPosts')
        } else {
            return collection(db, 'posts')
        }
    }

    // Create a post
    async create(content) {
        const user = auth.currentUser
        if (!user) throw new Error('You must be logged in to post')
        if (!content.trim()) throw new Error('No content')

        // Get user profile data
        const userProfile = await this.getUserProfile(user.uid)

        return await addDoc(this.getPostsCollection(), {
            uid: user.uid,
            email: user.email,
            content: content,
            user: userProfile,
            createdAt: serverTimestamp(),
        })
    }

    // Get user profile data
    async getUserProfile(uid) {
        try {
            const userDoc = doc(db, 'users', uid)
            const userSnap = await getDoc(userDoc)
            
            if (!userSnap.exists()) {
                return {
                    uid: uid,
                    firstName: 'Unknown',
                    lastName: 'User',
                    photoUrl: '/default-avatar.png'
                }
            }
            
            const userData = userSnap.data()
            return {
                uid: uid,
                firstName: userData.firstName || userData.displayName?.split(' ')[0] || 'Unknown',
                lastName: userData.lastName || userData.displayName?.split(' ').slice(1).join(' ') || 'User',
                photoUrl: userData.photoUrl || '/default-avatar.png'
            }
        } catch (error) {
            console.error('Error fetching user profile:', error)
            return {
                uid: uid,
                firstName: 'Unknown',
                lastName: 'User',
                photoUrl: '/default-avatar.png'
            }
        }
    }

    // Update a post
    async update(postId, newContent, uid = null) {
        const ref = this.useNested
            ? doc(db, 'posts', uid || auth.currentUser.uid, 'userPosts', postId)
            : doc(db, 'posts', postId)
        return await updateDoc(ref, { content: newContent })
    }

    // Delete a post
    async delete(postId, uid = null) {
        const ref = this.useNested
            ? doc(db, 'posts', uid || auth.currentUser.uid, 'userPosts', postId)
            : doc(db, 'posts', postId)
        return await deleteDoc(ref)
    }

    // Listen to all posts (real-time)
    listenAll(callback) {
        const q = query(this.getPostsCollection(), orderBy('createdAt', 'desc'))
        return onSnapshot(q, (snapshot) => {
            callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
        })
    }

    // Listen only to current user's posts
    listenMine(callback) {
        if (this.useNested) {
            const q = query(this.getPostsCollection(), orderBy('createdAt', 'desc'))
            return onSnapshot(q, (snapshot) => {
                callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
            })
        } else {
            const user = auth.currentUser
            const q = query(
                this.getPostsCollection(),
                where('uid', '==', user.uid),
                orderBy('createdAt', 'desc'),
            )
            return onSnapshot(q, (snapshot) => {
                callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
            })
        }
    }
}
