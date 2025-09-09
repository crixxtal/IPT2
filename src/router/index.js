import { auth } from '@/config/firebaseConfig'
import { onAuthStateChanged } from 'firebase/auth'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/guest',
            name: 'guest',
            component: import('@/layouts/GuestLayout.vue'),
            children: [
                {
                    path: '/login',
                    name: 'login',
                    component: import('@/views/guest/LoginView.vue'),
                },
                {
                    path: '/register',
                    name: 'register',
                    component: import('@/views/guest/RegisterView.vue'),
                },
                {
                    path: '/dog',
                    name: 'dog',
                    component: import('@/views/guest/DogView.vue'),
                },
                {
                    path: '/gender-reveal',
                    name: 'gender.reveal',
                    component: import('@/views/guest/GenderReveal.vue'),
                },
            ],
        },
        {
            path: '/',
            name: 'dashboard',
            component: import('@/layouts/AppLayout.vue'),
            meta: { requiresAuth: true },
            children: [
                {
                    path: '/',
                    name: 'feed',
                    component:() => import('@/views/authenticated/FeedView.vue'),
                },
                {
                    path: '/communities',
                    name: 'communities',
                    component:() => import('@/views/authenticated/CommunitiesView.vue'),
                },
                {
                    path: '/assignments',
                    name: 'assignments',
                    component:() => import('@/views/authenticated/AssignmentsView.vue'),
                },
                {
                    path: '/events',
                    name: 'events',
                    component:() => import('@/views/authenticated/EventsView.vue'),
                },
                {
                    path: '/chats',
                    name: 'chats',
                    component: () => import('@/views/authenticated/ChatsView.vue'),
                },
                {
                    path: '/profile',
                    name: 'personal.profile',
                    component: import('@/views/authenticated/profile/PersonalProfile.vue'),
                },
                {
                    path: '/profile/:uid',
                    name: 'user.profile',
                    component: () => import('@/views/authenticated/profile/UserProfileView.vue'),
                    props: true, // so you can access uid as a prop inside the component
                    meta: { requiresAuth: true }
                },
            ],
        },
    ],
})

router.beforeEach((to, from, next) => {
    onAuthStateChanged(auth, () => {
        const user = auth.currentUser
        if (to.meta.requiresAuth && !user) {
            next({ name: 'login' })
        } else {
            next()
        }
    })
})

export default router
