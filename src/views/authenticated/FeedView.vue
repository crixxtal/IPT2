<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db, auth } from '@/config/firebaseConfig'
import { onAuthStateChanged } from 'firebase/auth'
import {
    collection,
    addDoc,
    setDoc,
    onSnapshot,
    deleteDoc,
    doc,
    updateDoc,
    serverTimestamp,
    query,
    orderBy,
    getDoc,
} from 'firebase/firestore'
import { formatDistanceToNow } from 'date-fns'
import PostCard from '@/components/ui/posts/PostCard.vue'

const router = useRouter()

const userDetails = ref({})
const currentUser = ref([])
const posts = ref([])
const content = ref('')

const createPost = async () => {
    const user = auth.currentUser
    console.log('User Details', user)
    if (!user) {
        console.log('You must be logged in to post')
        return
    }

    if (!content.value.trim()) {
        console.log('No content')
        return
    }

    await addDoc(collection(db, 'posts'), {
        uid: user.uid,
        email: user.email,
        displayname: user.displayName,
        photoUrl: user.photoURL,
        content: content.value,
        like: 0,
        dislike: 0,
        reactions: [],
        likersUid: [],
        dislikersuid: [],
        createdAt: serverTimestamp(),
    })

    content.value = ''
}

// Get user details
const fetchUserDetails = async (userId) => {
    try {
        const docRef = doc(db, 'users', userId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            userDetails.value = docSnap.data()
            console.log(userDetails.value)
        } else {
            userDetails.value = null
        }
    } catch (error) {
        console.error('Error getting document: ', error)
    }
}

function listenToPosts() {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))

    onSnapshot(q, async (snapshot) => {
        const postPromises = snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data()
            let userData = {}

            if (data.uid) {
                const userDoc = await getDoc(doc(db, 'users', data.uid))
                if (userDoc.exists()) {
                    userData = userDoc.data()
                }
            }

            return {
                id: docSnap.id,
                ...data,
                user: userData,
            }
        })

        posts.value = await Promise.all(postPromises)
    })
}

const visitProfile = (uid) => {
    router.push({ name: 'user.profile', params: { uid: uid } })
}

onMounted(() => {
    // ✅ Wait for Firebase to restore the user session
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('User is logged in:', user)
            currentUser.value = user
            listenToPosts()
            fetchUserDetails(user.uid)
        } else {
            console.log('No user logged in')
            currentUser.value = null
        }
    })
})
</script>
<template>
    <div class="bg-white rounded-lg shadow p-4">
        <div class="flex space-x-4">
            <img
                src="https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?auto=format&fit=facearea&facepad=3&w=64&h=64&q=80"
                alt="Avatar"
                class="w-10 h-10 rounded-full"
            />
            <textarea
                v-model="content"
                rows="2"
                placeholder="Share something with your classmates…"
                class="flex-1 resize-none bg-gray-100 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
        </div>
        <div class="mt-3 flex justify-end space-x-3">
            <button class="flex items-center text-gray-600 hover:text-indigo-600">
                <svg
                    class="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3 15a4 4 0 018 0h6a4 4 0 018 0m-9-4V2m0 0h4m-4 0H7"
                    />
                </svg>
                Photo/Video
            </button>
            <button class="flex items-center text-gray-600 hover:text-indigo-600">
                <svg
                    class="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Poll
            </button>
            <button
                @click="createPost"
                type="button"
                class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
            >
                Post
            </button>
        </div>
    </div>
    <!-- Sample Post (reused) -->
    <div class="w-full mx-auto space-y-4">
        <PostCard v-for="(post, index) in posts" :key="index" :post="post" />

        <!-- Loader -->
        <div v-if="loading" class="text-center py-4">
            <span>Loading...</span>
        </div>

        <!-- Trigger for infinite scroll -->
        <div ref="loadMoreTrigger" class="h-2"></div>
    </div>
    <!-- Assignments -->
    <section class="bg-white rounded-lg shadow p-4">
        <h3 class="text-lg font-semibold mb-4">Assignments</h3>
        <ul class="space-y-3">
            <li class="flex items-center justify-between">
                <div>
                    <h4 class="font-medium text-gray-800">Calculus Homework #3</h4>
                    <p class="text-sm text-gray-500">Due Aug 5, 2025</p>
                </div>
                <button
                    class="bg-green-500 text-white text-sm px-3 py-1 rounded-md hover:bg-green-600"
                >
                    Submit
                </button>
            </li>
            <li class="flex items-center justify-between">
                <div>
                    <h4 class="font-medium text-gray-800">Group Project Proposal</h4>
                    <p class="text-sm text-gray-500">Due Aug 10, 2025</p>
                </div>
                <button
                    class="bg-green-500 text-white text-sm px-3 py-1 rounded-md hover:bg-green-600"
                >
                    Submit
                </button>
            </li>
            <li class="flex items-center justify-between">
                <div>
                    <h4 class="font-medium text-gray-800">Reading Response</h4>
                    <p class="text-sm text-gray-500">Due Aug 12, 2025</p>
                </div>
                <button
                    class="bg-green-500 text-white text-sm px-3 py-1 rounded-md hover:bg-green-600"
                >
                    Submit
                </button>
            </li>
        </ul>
    </section>
    <!-- Events -->
    <section class="bg-white rounded-lg shadow p-4">
        <h3 class="text-lg font-semibold mb-4">Upcoming Events</h3>
        <ul class="space-y-3">
            <li class="flex items-center justify-between">
                <div>
                    <h4 class="font-medium text-gray-800">Webinar: Career in AI</h4>
                    <p class="text-sm text-gray-500">Aug 3, 2025 – 3:00 PM</p>
                </div>
                <button
                    class="bg-indigo-600 text-white text-sm px-3 py-1 rounded-md hover:bg-indigo-700"
                >
                    Join
                </button>
            </li>
            <li class="flex items-center justify-between">
                <div>
                    <h4 class="font-medium text-gray-800">Study Group Session</h4>
                    <p class="text-sm text-gray-500">Aug 6, 2025 – 10:00 AM</p>
                </div>
                <button
                    class="bg-indigo-600 text-white text-sm px-3 py-1 rounded-md hover:bg-indigo-700"
                >
                    Join
                </button>
            </li>
            <li class="flex items-center justify-between">
                <div>
                    <h4 class="font-medium text-gray-800">Hackathon Kickoff</h4>
                    <p class="text-sm text-gray-500">Aug 15, 2025 – 9:00 AM</p>
                </div>
                <button
                    class="bg-indigo-600 text-white text-sm px-3 py-1 rounded-md hover:bg-indigo-700"
                >
                    Join
                </button>
            </li>
        </ul>
    </section>
</template>
