<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/config/firebaseConfig'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { toast } from 'vue3-toastify'

const router = useRouter()

const email = ref('')
const password = ref('')
const isRememberMe = ref(false)
const user = ref(null)

// login function
const handleLogin = async () => {
    try {
        user.value = await signInWithEmailAndPassword(auth, email.value, password.value)

        router.push('/')
    } catch (err) {
        console.error(err) // full error
        const friendlyMessages = {
            'auth/user-not-found': 'No account found for that email.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/invalid-email': 'Invalid email format.',
            'auth/invalid-credential': 'Invalid Credentials.',
        }
        toast.error(friendlyMessages[err.code] || 'Something went wrong, please try again.')
    }
}
</script>
<template>
    <div
        class="bg-gray-100 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8"
    >
        <div class="max-w-md w-full space-y-8">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign in to your account
                </h2>
                <p class="mt-2 text-center text-sm text-gray-600">
                    Or
                    <router-link
                        to="/register"
                        class="font-medium text-indigo-600 hover:text-indigo-500"
                        >create a new account</router-link
                    >
                </p>
            </div>
            <form class="mt-8 space-y-6" action="#" method="POST">
                <input type="hidden" name="remember" value="true" />
                <div class="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label for="email-address" class="sr-only">Email address</label>
                        <input
                            id="email-address"
                            v-model="email"
                            name="email"
                            type="email"
                            autocomplete="email"
                            required
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Email address"
                        />
                    </div>
                    <div class="mt-4">
                        <label for="password" class="sr-only">Password</label>
                        <input
                            v-model="password"
                            id="password"
                            name="password"
                            type="password"
                            autocomplete="current-password"
                            required
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Password"
                        />
                    </div>
                </div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <input
                            v-model="isRememberMe"
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label for="remember-me" class="ml-2 block text-sm text-gray-900"
                            >Remember me</label
                        >
                    </div>
                    <div class="text-sm">
                        <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500"
                            >Forgot your password?</a
                        >
                    </div>
                </div>
                <div>
                    <button
                        @click="handleLogin"
                        type="button"
                        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Sign in
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
