import { defineStore } from 'pinia'
import { UserService } from '@/services/UserService'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/config/firebaseConfig'

export const useAuthStore = defineStore('AuthStore', {
    state: () => ({
        me: null,
        initialized: false,
    }),
    getters: {
        isAuthenticated: (state) => !!state.me,
    },
    actions: {
        init() {
            return new Promise((resolve) => {
                onAuthStateChanged(auth, async (user) => {
                    if (user) {
                        await this.fetchUserDetails(user.uid)
                    } else {
                        this.me = null
                    }

                    this.initialized = true
                    resolve(user)
                })
            })
        },
        async login(email, password) {
            if (!email || !password) {
                return 'Please check your credentials'
            }

            try {
                const authDetails = await new UserService().login(email, password)

                if (!authDetails.user) {
                    return { success: false, message: 'Invalid credentials' }
                }

                await this.fetchUserDetails(authDetails.user.uid)

                return { success: true }
            } catch (err) {
                throw err
            }
        },
        async handleLogout() {},
        async fetchUserDetails(uid) {
            try {
                this.me = await new UserService().getUserProfile(uid)
                return { success: true }
            } catch (err) {
                console.error('There is a problem in fetching user details', err)
                return { success: false, message: 'There is a problem in fetching user details' }
            }
        },
        async handleUnsetAllData() {},
        async logout() {
            try {
                await new UserService().logout()
                return { success: true }
            } catch (err) {
                return { success: false, message: 'Failed to logout user account' }
            }
        },
    },
})
