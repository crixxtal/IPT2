<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { CommentService } from '@/services/CommentService'
import { UserService } from '@/services/UserService'

const props = defineProps({
    isOpen: { type: Boolean, default: false },
    post: { type: Object, required: true },
})

const emit = defineEmits(['close', 'comment-added'])

const commentService = new CommentService()
const userService = new UserService()

const comments = ref([])
const newComment = ref('')
const loading = ref(false)
const submitting = ref(false)
const currentUser = ref(null)
const unsubscribeComments = ref(null)

const editingComment = ref(null)
const editCommentText = ref('')
const updatingComment = ref(false)

const replyingTo = ref(null)
const replyText = ref('')
const submittingReply = ref(false)
const replyingToUser = ref(null)

const showDeleteModal = ref(false)
const commentToDelete = ref(null)

const userReaction = ref(null)
const reactionTypes = [
    { type: 'like', label: '👍', color: 'text-blue-500' },
    { type: 'love', label: '❤️', color: 'text-red-500' },
    { type: 'laugh', label: '😂', color: 'text-yellow-500' },
    { type: 'wow', label: '😮', color: 'text-purple-500' },
    { type: 'sad', label: '😢', color: 'text-blue-400' },
    { type: 'angry', label: '😡', color: 'text-red-600' }
]

const commentInputRef = ref(null)
const showMainReplies = ref(new Map())

watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
        loadComments()
        loadCurrentUser()
        document.body.style.overflow = 'hidden'
    } else {
        cleanup()
        document.body.style.overflow = 'auto'
    }
})

const loadCurrentUser = async () => {
    const user = userService.getCurrentAuthUser()
    if (user) {
        const profile = await userService.getUserProfile(user.uid)
        if (profile) {
            currentUser.value = {
                ...user,
                ...profile,
                photoURL: profile.photoUrl || user.photoURL || '/default-avatar.png'
            }
        } else {
            currentUser.value = {
                ...user,
                firstName: user.displayName?.split(' ')[0] || 'Unknown',
                lastName: user.displayName?.split(' ').slice(1).join(' ') || 'User',
                photoURL: user.photoURL || '/default-avatar.png'
            }
        }
    }
}

const loadComments = async () => {
    if (!props.post?.id) return
    
    loading.value = true
    
    try {
        unsubscribeComments.value = commentService.listenToComments(
            props.post.id,
            async (commentsData) => {
                const commentsWithUsers = await Promise.all(
                    commentsData.map(async (comment) => {
                        const userProfile = await userService.getUserProfile(comment.uid)
                        
                        const processedReplies = await Promise.all(
                            (comment.replies || []).map(async (reply) => {
                                const replyUserProfile = await userService.getUserProfile(reply.uid)
                                let mentionedUser = null
                                
                                if (reply.mentionedUserId) {
                                    mentionedUser = await userService.getUserProfile(reply.mentionedUserId)
                                }
                                
                                return {
                                    ...reply,
                                    user: replyUserProfile || {
                                        uid: reply.uid,
                                        firstName: 'Unknown',
                                        lastName: 'User',
                                        photoUrl: '/default-avatar.png'
                                    },
                                    mentionedUser: mentionedUser
                                }
                            })
                        )
                        
                        return {
                            ...comment,
                            user: userProfile || {
                                uid: comment.uid,
                                firstName: 'Unknown',
                                lastName: 'User',
                                photoUrl: '/default-avatar.png'
                            },
                            replies: processedReplies
                        }
                    })
                )
                
                comments.value = commentsWithUsers
                loading.value = false
            }
        )
    } catch (error) {
        console.error('Error loading comments:', error)
        loading.value = false
    }
}

const addComment = async () => {
    if (!newComment.value.trim() || submitting.value) return
    
    submitting.value = true
    
    try {
        await commentService.addComment(props.post.id, newComment.value)
        newComment.value = ''
        emit('comment-added')
    } catch (error) {
        console.error('Error adding comment:', error)
        alert('Failed to add comment. Please try again.')
    } finally {
        submitting.value = false
    }
}

const deleteComment = (commentId) => {
    commentToDelete.value = commentId
    showDeleteModal.value = true
}

const confirmDelete = async () => {
    if (!commentToDelete.value) return
    
    try {
        await commentService.deleteComment(props.post.id, commentToDelete.value)
        showDeleteModal.value = false
        commentToDelete.value = null
    } catch (error) {
        console.error('Error deleting comment:', error)
        alert('Failed to delete comment. Please try again.')
    }
}

const cancelDelete = () => {
    showDeleteModal.value = false
    commentToDelete.value = null
}

const startEdit = (comment) => {
    editingComment.value = comment.id
    editCommentText.value = comment.content
}

const cancelEdit = () => {
    editingComment.value = null
    editCommentText.value = ''
}

const saveEdit = async (commentId) => {
    if (!editCommentText.value.trim() || updatingComment.value) return
    
    updatingComment.value = true
    
    try {
        await commentService.updateComment(props.post.id, commentId, editCommentText.value)
        editingComment.value = null
        editCommentText.value = ''
    } catch (error) {
        console.error('Error updating comment:', error)
        alert('Failed to update comment. Please try again.')
    } finally {
        updatingComment.value = false
    }
}

const startReply = async (comment, targetUser = null) => {
    replyingTo.value = comment.id
    replyText.value = ''
    
    const userId = targetUser?.uid || comment.uid
    
    try {
        const userProfile = await userService.getUserProfile(userId)
        replyingToUser.value = userProfile || {
            uid: userId,
            firstName: 'Unknown',
            lastName: 'User',
            photoUrl: '/default-avatar.png'
        }
    } catch (error) {
        console.error('Error fetching user profile for reply:', error)
        replyingToUser.value = {
            uid: userId,
            firstName: 'Unknown',
            lastName: 'User',
            photoUrl: '/default-avatar.png'
        }
    }
}

const cancelReply = () => {
    replyingTo.value = null
    replyText.value = ''
    replyingToUser.value = null
}

const submitReply = async (parentCommentId) => {
    if (!replyText.value.trim() || submittingReply.value) return
    
    submittingReply.value = true
    
    try {
        let commentContent = replyText.value.trim()
        
        if (replyingToUser.value) {
            const mentionText = `@${replyingToUser.value.firstName} ${replyingToUser.value.lastName} `
            commentContent = mentionText + commentContent
        }
        
        const mentionedUserId = replyingToUser.value?.uid || null
        await commentService.addComment(props.post.id, commentContent, parentCommentId, mentionedUserId)
        replyText.value = ''
        replyingTo.value = null
        replyingToUser.value = null
    } catch (error) {
        console.error('Error adding reply:', error)
        alert('Failed to add reply. Please try again.')
    } finally {
        submittingReply.value = false
    }
}

const getTotalCommentCount = () => {
    let totalCount = 0
    comments.value.forEach(comment => {
        totalCount += 1
        if (comment.replies && comment.replies.length > 0) {
            totalCount += comment.replies.length
        }
    })
    return totalCount
}

const setReaction = (reactionType) => {
    userReaction.value = userReaction.value === reactionType ? null : reactionType
}

const focusCommentInput = () => {
    if (commentInputRef.value) {
        commentInputRef.value.focus()
    }
}

const getTotalReplyCount = (comment) => {
    return comment.replies ? comment.replies.length : 0
}

const toggleMainReplies = (commentId) => {
    const currentState = showMainReplies.value.get(commentId) || false
    showMainReplies.value.set(commentId, !currentState)
}

const formatReplyContent = (content) => {
    if (!content) return ''
    return content.replace(/@([A-Za-z]+ [A-Za-z]+)/g, '<span class="text-indigo-600 font-medium">@$1</span>')
}

const closeModal = () => {
    emit('close')
}

const cleanup = () => {
    if (unsubscribeComments.value) {
        unsubscribeComments.value()
        unsubscribeComments.value = null
    }
    comments.value = []
    newComment.value = ''
    editingComment.value = null
    editCommentText.value = ''
    updatingComment.value = false
    replyingTo.value = null
    replyText.value = ''
    submittingReply.value = false
    replyingToUser.value = null
    showDeleteModal.value = false
    commentToDelete.value = null
    userReaction.value = null
    showMainReplies.value.clear()
}

onUnmounted(() => {
    cleanup()
    document.body.style.overflow = 'auto'
})
</script>
<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click="closeModal"
    >
        <div
            class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            @click.stop
        >
            <div class="flex items-center justify-between p-4 border-b border-gray-200">
                <div class="flex-1 flex items-center justify-center">
                    <div class="text-center">
                        <h3 class="font-semibold text-gray-800 capitalize">
                            {{ post?.user?.firstName || post?.user?.lastName
                                ? `${post?.user?.firstName} ${post?.user?.lastName}`
                                : post?.user?.email || 'Unknown User'
                            }}'s Post
                        </h3>
                    </div>
                </div>
                <button
                    @click="closeModal"
                    class="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                    ×
                </button>
            </div>

            <div class="flex-1 overflow-y-auto">
                <div class="p-4 border-b border-gray-100">
                    <p class="text-gray-800 leading-relaxed">{{ post?.content }}</p>
                    
                    <div class="mt-4">
                        <div class="flex items-center justify-between text-sm text-gray-500 mb-2">
                            <div class="flex items-center space-x-1">
                                <span>{{ post?.reactions?.total || 0 }} reactions</span>
                            </div>
                            <div class="flex items-center space-x-4">
                                <span>{{ getTotalCommentCount() }} comments</span>
                                <span>{{ post?.shares || 0 }} shares</span>
                            </div>
                        </div>
                        <div class="border-t border-gray-200 mb-3"></div>
                        <div class="flex items-center justify-around text-gray-600">
                            <div class="relative group">
                                <button class="flex items-center hover:text-indigo-600">
                                    <span v-if="userReaction" class="mr-1">
                                        {{ reactionTypes.find((r) => r.type === userReaction)?.label }}
                                    </span>
                                    <span>{{ userReaction || 'React' }}</span>
                                </button>
                                <div
                                    class="absolute bottom-full mb-2 left-0 bg-white shadow-lg rounded-full px-3 py-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition"
                                >
                                    <button
                                        v-for="r in reactionTypes"
                                        :key="r.type"
                                        @click="setReaction(r.type)"
                                        class="text-xl hover:scale-125 transition"
                                        :class="r.color"
                                    >
                                        {{ r.label }}
                                    </button>
                                </div>
                            </div>
                            <button
                                @click="focusCommentInput"
                                class="hover:text-indigo-600 transition-colors"
                            >
                                Comment
                            </button>
                            <button class="hover:text-indigo-600 transition-colors">
                                Share
                            </button>
                        </div>
                    </div>
                </div>

                <div class="p-4">
                    <div v-if="loading" class="text-center py-4">
                        <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                        <p class="text-gray-500 mt-2">Loading comments...</p>
                    </div>

                    <div v-else-if="comments.length === 0" class="text-center py-8">
                        <p class="text-gray-500">No comments yet. Be the first to comment!</p>
                    </div>

                    <div v-else class="space-y-4">
                        <div
                            v-for="comment in comments"
                            :key="comment.id"
                            class="space-y-3"
                        >
                            <div class="flex space-x-3">
                                <img
                                    :src="comment.user?.photoUrl || '/default-avatar.png'"
                                    alt="Commenter avatar"
                                    class="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                />
                                <div class="flex-1">
                                    <div v-if="editingComment === comment.id" class="bg-gray-100 rounded-lg px-3 py-2">
                                        <div class="flex items-center space-x-2 mb-2">
                                            <span class="font-semibold text-sm text-gray-800">
                                                {{ comment.user?.firstName || comment.user?.lastName
                                                    ? `${comment.user?.firstName} ${comment.user?.lastName}`
                                                    : comment.user?.email || 'Unknown User'
                                                }}
                                            </span>
                                            <span class="text-xs text-gray-500">
                                                {{ formatDistanceToNow(comment.createdAt?.toDate?.() || new Date(), {
                                                    addSuffix: true,
                                                }) }}
                                            </span>
                                        </div>
                                        <textarea
                                            v-model="editCommentText"
                                            class="w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            rows="2"
                                            placeholder="Edit your comment..."
                                        ></textarea>
                                        <div class="flex items-center space-x-2 mt-2">
                                            <button
                                                @click="saveEdit(comment.id)"
                                                :disabled="!editCommentText.trim() || updatingComment"
                                                class="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {{ updatingComment ? 'Saving...' : 'Save' }}
                                            </button>
                                            <button
                                                @click="cancelEdit"
                                                class="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>

                                    <div v-else class="bg-gray-100 rounded-lg px-3 py-2">
                                        <div class="flex items-center space-x-2 mb-1">
                                            <span class="font-semibold text-sm text-gray-800">
                                                {{ comment.user?.firstName || comment.user?.lastName
                                                    ? `${comment.user?.firstName} ${comment.user?.lastName}`
                                                    : comment.user?.email || 'Unknown User'
                                                }}
                                            </span>
                                            <span class="text-xs text-gray-500">
                                                {{ formatDistanceToNow(comment.createdAt?.toDate?.() || new Date(), {
                                                    addSuffix: true,
                                                }) }}
                                            </span>
                                        </div>
                                        <p class="text-sm text-gray-700">{{ comment.content }}</p>
                                    </div>
                                    
                                    <div v-if="editingComment !== comment.id" class="flex items-center space-x-4 mt-1 ml-3">
                                        <button
                                            v-if="comment.uid === currentUser?.uid"
                                            @click="startEdit(comment)"
                                            class="text-xs text-blue-500 hover:text-blue-700"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            v-if="comment.uid === currentUser?.uid"
                                            @click="deleteComment(comment.id)"
                                            class="text-xs text-red-500 hover:text-red-700"
                                        >
                                            Delete
                                        </button>
                                        <button 
                                            @click="startReply(comment)"
                                            class="text-xs text-gray-500 hover:text-gray-700"
                                        >
                                            Reply
                                        </button>
                                        <button 
                                            v-if="comment.replies && comment.replies.length > 0"
                                            @click="toggleMainReplies(comment.id)"
                                            class="text-xs text-indigo-500 hover:text-indigo-700"
                                        >
                                            {{ showMainReplies.get(comment.id) ? 'Hide' : 'View' }} {{ getTotalReplyCount(comment) }} {{ getTotalReplyCount(comment) === 1 ? 'reply' : 'replies' }}
                                        </button>
                                    </div>

                                </div>
                            </div>

                            <div v-if="comment.replies && comment.replies.length > 0 && showMainReplies.get(comment.id)" class="ml-11 space-y-3">
                                <div
                                    v-for="reply in comment.replies"
                                    :key="reply.id"
                                    class="flex space-x-3"
                                >
                                    <img
                                        :src="reply.user?.photoUrl || '/default-avatar.png'"
                                        alt="Replyer avatar"
                                        class="w-6 h-6 rounded-full object-cover flex-shrink-0"
                                    />
                                    <div class="flex-1">
                                        <div v-if="editingComment === reply.id" class="bg-gray-50 rounded-lg px-3 py-2 border-l-2 border-indigo-300">
                                            <div class="flex items-center space-x-2 mb-2">
                                                <span class="font-semibold text-sm text-gray-800">
                                                    {{ reply.user?.firstName || reply.user?.lastName
                                                        ? `${reply.user?.firstName} ${reply.user?.lastName}`
                                                        : reply.user?.email || 'Unknown User'
                                                    }}
                                                </span>
                                                <span class="text-xs text-gray-500">
                                                    {{ formatDistanceToNow(reply.createdAt?.toDate?.() || new Date(), {
                                                        addSuffix: true,
                                                    }) }}
                                                </span>
                                            </div>
                                            <textarea
                                                v-model="editCommentText"
                                                class="w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                rows="2"
                                                placeholder="Edit your reply..."
                                            ></textarea>
                                            <div class="flex items-center space-x-2 mt-2">
                                                <button
                                                    @click="saveEdit(reply.id)"
                                                    :disabled="!editCommentText.trim() || updatingComment"
                                                    class="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {{ updatingComment ? 'Saving...' : 'Save' }}
                                                </button>
                                                <button
                                                    @click="cancelEdit"
                                                    class="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>

                                        <div v-else class="bg-gray-50 rounded-lg px-3 py-2 border-l-2 border-indigo-300">
                                            <div class="flex items-center space-x-2 mb-1">
                                                <span class="font-semibold text-sm text-gray-800">
                                                    {{ reply.user?.firstName || reply.user?.lastName
                                                        ? `${reply.user?.firstName} ${reply.user?.lastName}`
                                                        : reply.user?.email || 'Unknown User'
                                                    }}
                                                </span>
                                                <span class="text-xs text-gray-500">
                                                    {{ formatDistanceToNow(reply.createdAt?.toDate?.() || new Date(), {
                                                        addSuffix: true,
                                                    }) }}
                                                </span>
                                            </div>
                                            <p class="text-sm text-gray-700">
                                                <span v-html="formatReplyContent(reply.content)"></span>
                                            </p>
                                        </div>
                                        
                                        <div v-if="editingComment !== reply.id" class="flex items-center space-x-4 mt-1 ml-3">
                                            <button
                                                v-if="reply.uid === currentUser?.uid"
                                                @click="startEdit(reply)"
                                                class="text-xs text-blue-500 hover:text-blue-700"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                v-if="reply.uid === currentUser?.uid"
                                                @click="deleteComment(reply.id)"
                                                class="text-xs text-red-500 hover:text-red-700"
                                            >
                                                Delete
                                            </button>
                                            <button 
                                                @click="startReply(comment, reply.user)"
                                                class="text-xs text-gray-500 hover:text-gray-700"
                                            >
                                                Reply
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                            
                            <div v-if="replyingTo === comment.id" class="ml-11 mt-3">
                                <div class="flex items-center space-x-2">
                                    <img
                                        :src="currentUser?.photoURL || '/default-avatar.png'"
                                        alt="Your avatar"
                                        class="w-6 h-6 rounded-full object-cover"
                                    />
                                    <div class="flex-1 flex items-center space-x-2">
                                        <input
                                            v-model="replyText"
                                            @keypress.enter="submitReply(comment.id)"
                                            type="text"
                                            placeholder="Write a reply..."
                                            class="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                            :disabled="submittingReply"
                                        />
                                        <button
                                            @click="submitReply(comment.id)"
                                            :disabled="!replyText.trim() || submittingReply"
                                            class="px-3 py-1 bg-indigo-600 text-white text-xs rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {{ submittingReply ? 'Posting...' : 'Reply' }}
                                        </button>
                                        <button
                                            @click="cancelReply"
                                            class="px-3 py-1 bg-gray-500 text-white text-xs rounded-full hover:bg-gray-600"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="p-4 border-t border-gray-200">
                <div class="flex items-center space-x-3">
                    <img
                        :src="currentUser?.photoURL || '/default-avatar.png'"
                        alt="Your avatar"
                        class="w-8 h-8 rounded-full object-cover"
                    />
                    <div class="flex-1 flex items-center space-x-2">
                        <input
                            ref="commentInputRef"
                            v-model="newComment"
                            @keypress.enter="addComment"
                            type="text"
                            placeholder="Write a comment..."
                            class="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            :disabled="submitting"
                        />
                        <button
                            @click="addComment"
                            :disabled="!newComment.trim() || submitting"
                            class="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <span v-if="submitting">Posting...</span>
                            <span v-else>Comment</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div
        v-if="showDeleteModal"
        class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-60 p-4"
        @click="cancelDelete"
    >
        <div
            class="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
            @click.stop
        >
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-800">Delete Comment?</h3>
                <button
                    @click="cancelDelete"
                    class="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                    ×
                </button>
            </div>
            <p class="text-gray-600 mb-6">Are you sure you want to delete this comment?</p>
            <div class="flex justify-end space-x-3">
                <button
                    @click="cancelDelete"
                    class="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                    No
                </button>
                <button
                    @click="confirmDelete"
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>
