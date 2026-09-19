<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

async function logout() {
    await auth.logout()
    await router.push({ name: 'login' })
}
</script>

<template>
    <div class="shell">
        <header class="topbar">
            <strong>FreelanceDesk</strong>
            <nav>
                <RouterLink to="/">Dashboard</RouterLink>
                <RouterLink to="/clients">Clienti</RouterLink>
                <RouterLink to="/projects">Progetti</RouterLink>
                <button @click="logout">Logout</button>
            </nav>
        </header>
        <main class="container">
            <slot />
        </main>
    </div>
</template>