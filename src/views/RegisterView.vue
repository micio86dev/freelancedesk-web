<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore();
const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');
const confirmation = ref('');
const error = ref('')

async function submit() {
    error.value = '';
    try {
        await auth.register(name.value, email.value, password.value, confirmation.value);
        await router.push('/')
    } catch {
        error.value = 'Controlla i dati inseriti.'
    }
}
</script>

<template>
    <main class="auth-page">
        <form class="card form" @submit.prevent="submit">
            <h1>Registrati</h1>
            <label>Nome<input v-model="name" required></label>

            <label>Email<input v-model="email" type="email" required></label>

            <label>Password<input v-model="password" type="password" required></label>

            <label>Conferma password<input v-model="confirmation" type="password" required></label>
            <p v-if="error" class="error">{{ error }}</p><button>Crea account</button>

            <RouterLink to="/login">Hai già un account?</RouterLink>
        </form>
    </main>
</template>