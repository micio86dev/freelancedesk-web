<script setup lang="ts">
    import { onMounted, reactive, ref } from 'vue'
    import AppLayout from '@/layouts/AppLayout.vue'
    import { http } from '@/api/http'
    import type { Client, Paginated } from '@/types'

    const clients = ref<Client[]>([])
    const form = reactive({ name: '', company: '', email: '', phone: '', notes: '' })
    const loading = ref(false)

    async function load() {
        clients.value = (await http.get<Paginated<Client>>('/api/clients')).data.data
    }

    async function create() {
        loading.value = true
        try {
            await http.post('/api/clients', form)
            Object.assign(form, { name: '', company: '', email: '', phone: '', notes: '' })
            await load()
        } finally {
            loading.value = false
        }
    }

    async function remove(id: number) {
        await http.delete(`/api/clients/${id}`)
        await load()
    }

    onMounted(load)
</script>

<template>
    <AppLayout>
        <h1>Clienti</h1>
        <div class="two-cols">
            <form class="card form" @submit.prevent="create">
                <h2>Nuovo cliente</h2>
                <label>
                    Nome
                    <input v-model="form.name" required />
                </label>
                <label>
                    Azienda
                    <input v-model="form.company" />
                </label>
                <label>
                    Email
                    <input v-model="form.email" type="email" />
                </label>
                <label>
                    Telefono
                    <input v-model="form.phone" />
                </label>
                <label>
                    Note
                    <textarea v-model="form.notes" />
                </label>
                <button :disabled="loading">Salva</button>
            </form>
            <section>
                <article v-for="client in clients" :key="client.id" class="card row">
                    <div>
                        <strong>{{ client.name }}</strong>
                        <div>{{ client.company || '—' }}</div>
                        <small>{{ client.email || 'Nessuna email' }}</small>
                    </div>
                    <button class="danger" @click="remove(client.id)">Elimina</button>
                </article>
            </section>
        </div>
    </AppLayout>
</template>
