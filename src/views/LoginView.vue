<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore();
const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false)

async function submit() {
    error.value = '';
    loading.value = true;

    try {
        await auth.login(email.value, password.value);
        await router.push('/')
    } catch {
        error.value = 'Credenziali non valide.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <main class="auth-page">
        <form class="card form" @submit.prevent="submit">
            <h1>Accedi</h1>
            <label>Email<input v-model="email" type="email" required></label>

            <label>Password<input v-model="password" type="password" required></label>
            <p v-if="error" class="error">{{ error }}</p>

            <button :disabled="loading">{{ loading ? 'Accesso…' : 'Accedi'
                }}</button>

            <RouterLink to="/register">Crea account</RouterLink>
        </form>
    </main>
</template>