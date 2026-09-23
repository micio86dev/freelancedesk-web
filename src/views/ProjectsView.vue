<script setup lang="ts">
    import { onMounted, reactive, ref } from 'vue'
    import AppLayout from '@/layouts/AppLayout.vue'
    import { http } from '@/api/http'
    import type { Client, Paginated, Project, ProjectStatus } from '@/types'

    const projects = ref<Project[]>([])
    const clients = ref<Client[]>([])
    const loading = ref(false)
    const form = reactive({
        clientId: 0,
        name: '',
        description: '',
        status: 'draft' as ProjectStatus,
        hourly_rate: '',
        started_at: '',
        deadline: '',
    })

    async function load(): Promise<void> {
        const [projectsResponse, clientsResponse] = await Promise.all([
            http.get<Paginated<Project>>('/api/projects'),
            http.get<Paginated<Client>>('/api/clients'),
        ])
        projects.value = projectsResponse.data.data
        clients.value = clientsResponse.data.data
        if (!form.clientId && clients.value[0]) form.clientId = clients.value[0].id
    }

    async function createProject(): Promise<void> {
        if (!form.clientId) return
        loading.value = true
        try {
            await http.post(`/api/clients/${form.clientId}/projects`, {
                name: form.name,
                description: form.description || null,
                status: form.status,
                hourly_rate: form.hourly_rate || null,
                started_at: form.started_at || null,
                deadline: form.deadline || null,
            })
            Object.assign(form, {
                clientId: clients.value[0]?.id ?? 0,
                name: '',
                description: '',
                status: 'draft',
                hourly_rate: '',
                started_at: '',
                deadline: '',
            })
            await load()
        } finally {
            loading.value = false
        }
    }

    onMounted(load)
</script>

<template>
    <AppLayout>
        <h1>Progetti</h1>
        <div class="two-cols">
            <form class="card form" @submit.prevent="createProject">
                <h2>Nuovo progetto</h2>
                <label>
                    Cliente
                    <select v-model.number="form.clientId" required>
                        <option v-for="client in clients" :key="client.id" :value="client.id">
                            {{ client.name }}
                        </option>
                    </select>
                </label>
                <label>
                    Nome
                    <input v-model="form.name" required />
                </label>
                <label>
                    Descrizione
                    <textarea v-model="form.description" />
                </label>
                <label>
                    Stato
                    <select v-model="form.status">
                        <option value="draft">Bozza</option>
                        <option value="active">Attivo</option>
                        <option value="completed">Completato</option>
                        <option value="cancelled">Annullato</option>
                    </select>
                </label>
                <label>
                    Tariffa oraria
                    <input v-model="form.hourly_rate" type="number" min="0" step="0.01" />
                </label>
                <label>
                    Inizio
                    <input v-model="form.started_at" type="date" />
                </label>
                <label>
                    Scadenza
                    <input v-model="form.deadline" type="date" />
                </label>
                <button :disabled="loading || clients.length === 0">Salva progetto</button>
                <small v-if="clients.length === 0">Crea prima almeno un cliente.</small>
            </form>
            <section>
                <RouterLink
                    v-for="project in projects"
                    :key="project.id"
                    :to="`/projects/${project.id}`"
                    class="card row project-link"
                >
                    <div>
                        <strong>{{ project.name }}</strong>
                        <div>{{ project.client?.name }}</div>
                    </div>
                    <span>{{ project.status }}</span>
                </RouterLink>
            </section>
        </div>
    </AppLayout>
</template>
