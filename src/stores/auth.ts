import { defineStore } from 'pinia'
import { ref } from 'vue'
import { http } from '@/api/http'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const initialized = ref(false)

    async function csrf(): Promise<void> {
        await http.get('/sanctum/csrf-cookie')
    }

    async function fetchUser(): Promise<void> {
        try {
            const response = await http.get<{ data: User }>('/api/me')
            user.value = response.data.data
        } catch {
            user.value = null
        } finally {
            initialized.value = true
        }
    }

    async function login(email: string, password: string): Promise<void> {
        await csrf()
        await http.post('/api/login', { email, password })
        await fetchUser()
    }

    async function register(name: string, email: string, password: string, passwordConfirmation: string): Promise<void> {
        await csrf()
        await http.post('/api/register', { name, email, password, password_confirmation: passwordConfirmation })
        await fetchUser()
    }

    async function logout(): Promise<void> {
        await http.post('/api/logout')
        user.value = null
    }

    return { user, initialized, fetchUser, login, register, logout }
})