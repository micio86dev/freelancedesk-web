<script setup lang="ts">
    import { onMounted, ref } from 'vue'
    import AppLayout from '@/layouts/AppLayout.vue'
    import { http } from '@/api/http'
    import type { Dashboard } from '@/types'
    const data = ref<Dashboard | null>(null)
    onMounted(async () => {
        data.value = (await http.get<Dashboard>('/api/dashboard')).data
    })
</script>
<template>
    <AppLayout>
        <h1>Dashboard</h1>
        <div v-if="data" class="grid">
            <article class="card">
                <strong>{{ data.clients }}</strong>
                <span>Clienti</span>
            </article>
            <article class="card">
                <strong>{{ data.activeProjects }}</strong>
                <span>Progetti attivi</span>
            </article>
            <article class="card">
                <strong>{{ data.workedHoursThisMonth }} h</strong>
                <span>Ore questo mese</span>
            </article>
            <article class="card">
                <strong>€ {{ data.expensesThisMonth }}</strong>
                <span>Spese questo mese</span>
            </article>
            <article class="card">
                <strong>€ {{ data.potentialRevenue }}</strong>
                <span>Fatturato potenziale</span>
            </article>
        </div>
    </AppLayout>
</template>
