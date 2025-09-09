<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebaseConfig'
import { formatDistanceToNow } from 'date-fns'

const route = useRoute()
const profile = ref(null)
const posts = ref([])
const loading = ref(true)

const fetchProfile = async () => {
    try {
        const docRef = doc(db, 'users', route.params.uid)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            profile.value = docSnap.data()
        } else {
            profile.value = null
        }
    } catch (error) {
        console.error('Error fetching profile:', error)
    }
}

const fetchPosts = async () => {
    try {
        const q = query(collection(db, 'posts'), where('uid', '==', route.params.uid))
        const querySnapshot = await getDocs(q)
        posts.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
        console.error('Error fetching posts:', error)
    }
}

onMounted(async () => {
    await fetchProfile()
    await fetchPosts()
    loading.value = false
})

onUnmounted(() => {
    console.log('Leaving profile page')
})
</script>

<template>
    <div v-if="loading" class="p-6 text-center">Loading profile...</div>

    <div v-else-if="!profile" class="p-6 text-center text-red-500">Profile not found.</div>

    <div v-else class="space-y-6">
        <!-- Cover & Basic Info -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
            <div class="h-40 bg-indigo-600 relative">
                <img
                    src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80"
                    alt="Cover"
                    class="w-full h-full object-cover opacity-80"
                />
                <div class="absolute inset-0 bg-indigo-600 opacity-50"></div>

                <div class="absolute bottom-0 left-0 ml-6 mb-6 flex items-center space-x-4">
                    <img
                        :src="profile?.photoUrl || 'https://via.placeholder.com/150'"
                        alt="Avatar"
                        class="w-20 h-20 rounded-full border-4 border-white"
                    />
                    <div class="text-white">
                        <h2 class="text-2xl font-bold">
                            {{ profile?.firstName }} {{ profile?.lastName }}
                        </h2>
                        <p class="text-sm">{{ profile?.program }} – Class of 2026</p>
                    </div>
                </div>
            </div>
            <div class="p-4 flex justify-between items-center">
                <div>
                    <span class="text-sm text-gray-600">{{ profile?.location || 'Unknown' }}</span>
                </div>
            </div>
        </div>

        <!-- About Section -->
        <section class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">About</h3>
            <p class="text-gray-700 mb-4">{{ profile?.about || 'No bio provided' }}</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                <div><span class="font-medium">Program:</span> {{ profile?.program }}</div>
                <div><span class="font-medium">Email:</span> {{ profile?.email }}</div>
            </div>
        </section>

        <!-- Recent Posts -->
        <section class="bg-white rounded-lg shadow p-6 space-y-6">
            <h3 class="text-lg font-semibold">Recent Posts</h3>
            <div v-if="!posts.length" class="text-gray-500">No posts yet.</div>
            <div
                v-for="post in posts"
                :key="post.id"
                class="border-t pt-4 first:border-0 first:pt-0"
            >
                <p class="text-gray-700">{{ post.content }}</p>
                <span class="text-sm text-gray-500"
                    >Posted
                    {{
                        formatDistanceToNow(post.createdAt?.toDate?.() || new Date(), {
                            addSuffix: true,
                        })
                    }}</span
                >
            </div>
        </section>
    </div>
</template>
