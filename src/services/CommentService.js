// src/services/CommentService.js
import { db, auth } from '@/config/firebaseConfig'
import {
    collection,
    addDoc,
    doc,
    onSnapshot,
    query,
    where,
    serverTimestamp,
    orderBy,
    getDocs,
    deleteDoc,
    updateDoc,
    getDoc,
} from 'firebase/firestore'

export class CommentService {
    constructor() {
        this.commentsCollection = 'comments'
    }

    // Get comments collection reference for a specific post
    getCommentsCollection(postId) {
        return collection(db, 'posts', postId, 'comments')
    }

    // Add a comment to a post
    async addComment(postId, content, parentCommentId = null, mentionedUserId = null) {
        const user = auth.currentUser
        if (!user) throw new Error('You must be logged in to comment')
        if (!content.trim()) throw new Error('Comment cannot be empty')

        const commentData = {
            postId: postId,
            uid: user.uid,
            email: user.email,
            content: content.trim(),
            parentCommentId: parentCommentId, // null for top-level comments
            mentionedUserId: mentionedUserId, // ID of the user being mentioned/replied to
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }

        return await addDoc(this.getCommentsCollection(postId), commentData)
    }

    // Get all comments for a specific post (real-time)
    listenToComments(postId, callback) {
        const q = query(
            this.getCommentsCollection(postId),
            orderBy('createdAt', 'asc')
        )
        
        return onSnapshot(q, (snapshot) => {
            const comments = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
            
            // Organize comments into nested structure
            const organizedComments = this.organizeComments(comments)
            callback(organizedComments)
        })
    }

    // Organize comments into 2-level structure (main comments and direct replies only)
    organizeComments(comments) {
        const commentMap = new Map()
        const rootComments = []

        // First pass: create map of all comments
        comments.forEach(comment => {
            commentMap.set(comment.id, { ...comment, replies: [] })
        })

        // Second pass: organize into 2-level structure only
        comments.forEach(comment => {
            const commentObj = commentMap.get(comment.id)
            if (comment.parentCommentId) {
                // This is a reply - find the root parent (main comment)
                let rootParent = commentMap.get(comment.parentCommentId)
                
                // If the parent is also a reply, find the main comment
                while (rootParent && rootParent.parentCommentId) {
                    rootParent = commentMap.get(rootParent.parentCommentId)
                }
                
                // Add this reply to the main comment's replies
                if (rootParent) {
                    rootParent.replies.push(commentObj)
                }
            } else {
                // This is a top-level comment
                rootComments.push(commentObj)
            }
        })

        // Third pass: sort replies by createdAt
        rootComments.forEach(comment => {
            if (comment.replies && comment.replies.length > 0) {
                comment.replies.sort((a, b) => (a.createdAt?.toDate?.() || 0) - (b.createdAt?.toDate?.() || 0))
            }
        })

        // Sort main comments by createdAt
        rootComments.sort((a, b) => (a.createdAt?.toDate?.() || 0) - (b.createdAt?.toDate?.() || 0))
        
        return rootComments
    }

    // Get comments count for a post
    async getCommentsCount(postId) {
        const q = query(this.getCommentsCollection(postId))
        const snapshot = await getDocs(q)
        return snapshot.size
    }

    // Update a comment
    async updateComment(postId, commentId, newContent) {
        const user = auth.currentUser
        if (!user) throw new Error('You must be logged in to update comment')

        const commentRef = doc(db, 'posts', postId, 'comments', commentId)
        
        // Verify ownership before updating
        const commentDoc = await getDocs(query(
            this.getCommentsCollection(postId),
            where('__name__', '==', commentId)
        ))
        
        if (commentDoc.empty) throw new Error('Comment not found')
        
        const commentData = commentDoc.docs[0].data()
        if (commentData.uid !== user.uid) {
            throw new Error('You can only update your own comments')
        }

        return await updateDoc(commentRef, {
            content: newContent.trim(),
            updatedAt: serverTimestamp(),
        })
    }

    // Delete a comment
    async deleteComment(postId, commentId) {
        const user = auth.currentUser
        if (!user) throw new Error('You must be logged in to delete comment')

        // Verify ownership before deleting
        const commentDoc = await getDocs(query(
            this.getCommentsCollection(postId),
            where('__name__', '==', commentId)
        ))
        
        if (commentDoc.empty) throw new Error('Comment not found')
        
        const commentData = commentDoc.docs[0].data()
        if (commentData.uid !== user.uid) {
            throw new Error('You can only delete your own comments')
        }

        const commentRef = doc(db, 'posts', postId, 'comments', commentId)
        return await deleteDoc(commentRef)
    }

    // Get user profile data for comments
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
}
