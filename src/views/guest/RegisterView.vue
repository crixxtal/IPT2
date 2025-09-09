<script setup>
import { ref, onMounted } from 'vue'
import { auth, db } from '@/config/firebaseConfig'
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { toast } from 'vue3-toastify'

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const program = ref('')
const role = ref('')
const password = ref('')
const confirmPassword = ref('')
const user = ref(null)
const isSubmitting = ref(false)

const register = async () => {
    if (password.value != confirmPassword.value) {
        console.log(password.value)
        console.log(confirmPassword.value)
        toast.error('Your password did not match')
        return
    }

    isSubmitting.value = true

    try {
        const userCredentials = await createUserWithEmailAndPassword(
            auth,
            email.value,
            password.value,
        )
        const uid = userCredentials.user.uid

        // Save extra fields to firestore
        await setDoc(doc(db, 'users', uid), {
            firstName: firstName.value,
            lastName: lastName.value,
            email: email.value,
            program: program.value,
            role: role.value,
            about: 'Hi! I am new here',
            followersCount: 0,
            followersUid: [],
            createdAt: serverTimestamp(),
        })

        toast.success('Account created successfully')
    } catch (err) {
        console.log(err.message)
        toast.error('Failed to register, please try again')
    } finally {
        isSubmitting.value = false
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
                    Create your account
                </h2>
                <p class="mt-2 text-center text-sm text-gray-600">
                    Already have an account?
                    <router-link
                        to="/login"
                        class="font-medium text-indigo-600 hover:text-indigo-500"
                        >Sign in</router-link
                    >
                </p>
            </div>
            <form class="mt-8 space-y-6" action="#" method="POST">
                <div class="rounded-md shadow-sm space-y-4">
                    <div>
                        <label for="firstName" class="sr-only">First name</label>
                        <input
                            v-model="firstName"
                            id="firstName"
                            name="firstName"
                            type="text"
                            autocomplete="firstName"
                            required
                            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="First name"
                        />
                    </div>
                    <div>
                        <label for="lastName" class="sr-only">Last name</label>
                        <input
                            v-model="lastName"
                            id="lastName"
                            name="lastName"
                            type="text"
                            autocomplete="lastName"
                            required
                            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Last name"
                        />
                    </div>
                    <div>
                        <label for="email-address" class="sr-only">Email address</label>
                        <input
                            v-model="email"
                            id="email-address"
                            name="email"
                            type="email"
                            autocomplete="email"
                            required
                            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Email address"
                        />
                    </div>
                    <div>
                        <label for="program" class="sr-only">Program</label>
                        <select
                            v-model="program"
                            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        >
                            <option disabled value="">Select your program</option>
                            <option value="computer_science">Computer Science</option>
                            <option value="information_technology">Information Technology</option>
                            <option value="business_administration">Business Administration</option>
                            <option value="accounting">Accounting</option>
                            <option value="psychology">Psychology</option>
                            <option value="education">Education</option>
                            <option value="nursing">Nursing</option>
                            <option value="engineering">Engineering</option>
                            <option value="hospitality_management">Hospitality Management</option>
                            <option value="mass_communication">Mass Communication</option>
                            <option value="biology">Biology</option>
                            <option value="mathematics">Mathematics</option>
                            <option value="economics">Economics</option>
                            <option value="political_science">Political Science</option>
                            <option value="public_administration">Public Administration</option>
                            <option value="criminology">Criminology</option>
                            <option value="architecture">Architecture</option>
                            <option value="fine_arts">Fine Arts</option>
                            <option value="pharmacy">Pharmacy</option>
                            <option value="social_work">Social Work</option>
                        </select>
                    </div>
                    <div>
                        <label for="role" class="sr-only">Role</label>
                        <select
                            v-model="role"
                            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        >
                            <option disabled value="">Select Role</option>
                            <option value="teacher">Teacher</option>
                            <option value="student">Student</option>
                        </select>
                    </div>
                    <div>
                        <label for="password" class="sr-only">Password</label>
                        <input
                            v-model="password"
                            id="password"
                            name="password"
                            type="password"
                            autocomplete="new-password"
                            required
                            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Password"
                        />
                    </div>
                    <div>
                        <label for="confirm-password" class="sr-only">Confirm password</label>
                        <input
                            v-model="confirmPassword"
                            id="confirm-password"
                            name="confirm-password"
                            type="password"
                            autocomplete="new-password"
                            required
                            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Confirm password"
                        />
                    </div>
                </div>
                <div class="flex items-center">
                    <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        required
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label for="terms" class="ml-2 block text-sm text-gray-900">
                        I agree to the
                        <a href="#" class="text-indigo-600 hover:text-indigo-500"
                            >terms and conditions</a
                        >
                    </label>
                </div>
                <div>
                    <button
                        v-if="!isSubmitting"
                        @click="register"
                        type="button"
                        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Register
                    </button>
                    <button
                        v-if="isSubmitting"
                        type="button"
                        class="animate-pulse group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-400 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Registering...
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
