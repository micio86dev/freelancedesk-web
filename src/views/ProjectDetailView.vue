<script setup lang="ts">
    import { computed, onMounted, reactive, ref } from 'vue'
    import { useRoute } from 'vue-router'
    import AppLayout from '@/layouts/AppLayout.vue'
    import { http } from '@/api/http'
    import type { Project } from '@/types'

    interface Task {
        id: number
        title: string
        description: string | null
        status: 'todo' | 'in_progress' | 'done'
        estimatedHours: string | null
    }
    interface TimeEntry {
        id: number
        taskId: number | null
        description: string | null
        startedAt: string
        endedAt: string | null
        durationSeconds: number | null
    }
    interface Expense {
        id: number
        description: string
        category: string | null
        amount: string
        spentAt: string
    }

    const route = useRoute()
    const projectId = computed(() => Number(route.params.id))
    const project = ref<Project | null>(null)
    const tasks = ref<Task[]>([])
    const entries = ref<TimeEntry[]>([])
    const expenses = ref<Expense[]>([])
    const taskForm = reactive({ title: '', description: '', status: 'todo', estimated_hours: '' })
    const expenseForm = reactive({
        description: '',
        category: '',
        amount: '',
        spent_at: new Date().toISOString().slice(0, 10),
    })
    const timerDescription = ref('')

    const activeEntry = computed(() => entries.value.find((entry) => !entry.endedAt) ?? null)
    const totalSeconds = computed(() =>
        entries.value.reduce((sum, entry) => sum + (entry.durationSeconds ?? 0), 0),
    )
    const totalHours = computed(() => (totalSeconds.value / 3600).toFixed(2))
    const totalExpenses = computed(() =>
        expenses.value.reduce((sum, expense) => sum + Number(expense.amount), 0).toFixed(2),
    )

    async function load(): Promise<void> {
        const [projectResponse, tasksResponse, entriesResponse, expensesResponse] =
            await Promise.all([
                http.get<{ data: Project }>(`/api/projects/${projectId.value}`),
                http.get<{ data: Task[] }>(`/api/projects/${projectId.value}/tasks`),
                http.get<{ data: TimeEntry[] }>(`/api/projects/${projectId.value}/time-entries`),
                http.get<{ data: Expense[] }>(`/api/projects/${projectId.value}/expenses`),
            ])
        project.value = projectResponse.data.data
        tasks.value = tasksResponse.data.data
        entries.value = entriesResponse.data.data
        expenses.value = expensesResponse.data.data
    }

    async function addTask(): Promise<void> {
        await http.post(`/api/projects/${projectId.value}/tasks`, {
            title: taskForm.title,
            description: taskForm.description || null,
            status: taskForm.status,
            estimated_hours: taskForm.estimated_hours || null,
        })
        Object.assign(taskForm, { title: '', description: '', status: 'todo', estimated_hours: '' })
        await load()
    }

    async function startTimer(): Promise<void> {
        await http.post(`/api/projects/${projectId.value}/time-entries/start`, {
            description: timerDescription.value || null,
        })
        timerDescription.value = ''
        await load()
    }

    async function stopTimer(): Promise<void> {
        if (!activeEntry.value) return
        await http.post(`/api/time-entries/${activeEntry.value.id}/stop`)
        await load()
    }

    async function addExpense(): Promise<void> {
        await http.post(`/api/projects/${projectId.value}/expenses`, {
            description: expenseForm.description,
            category: expenseForm.category || null,
            amount: expenseForm.amount,
            spent_at: expenseForm.spent_at,
        })
        Object.assign(expenseForm, {
            description: '',
            category: '',
            amount: '',
            spent_at: new Date().toISOString().slice(0, 10),
        })
        await load()
    }

    onMounted(load)
</script>

<template>
    <AppLayout>
        <template v-if="project">
            <div class="page-heading">
                <div>
                    <h1>{{ project.name }}</h1>
                    <p>{{ project.client?.name }} · {{ project.status }}</p>
                </div>
                <RouterLink to="/projects">← Progetti</RouterLink>
            </div>
            <div class="grid">
                <article class="card">
                    <strong>{{ totalHours }} h</strong>
                    <span>Tempo registrato</span>
                </article>
                <article class="card">
                    <strong>€ {{ totalExpenses }}</strong>
                    <span>Spese</span>
                </article>
                <article class="card">
                    <strong>€ {{ project.hourlyRate ?? '0.00' }}</strong>
                    <span>Tariffa oraria</span>
                </article>
            </div>

            <section class="section">
                <h2>Timer</h2>
                <div class="card form">
                    <label>
                        Descrizione
                        <input v-model="timerDescription" :disabled="!!activeEntry" />
                    </label>
                    <button v-if="!activeEntry" @click="startTimer">Avvia timer</button>
                    <button v-else class="danger" @click="stopTimer">
                        Ferma timer iniziato
                        {{ new Date(activeEntry.startedAt).toLocaleTimeString() }}
                    </button>
                </div>
            </section>

            <section class="section">
                <h2>Task</h2>
                <div class="two-cols">
                    <form class="card form" @submit.prevent="addTask">
                        <label>
                            Titolo
                            <input v-model="taskForm.title" required />
                        </label>
                        <label>
                            Descrizione
                            <textarea v-model="taskForm.description" />
                        </label>
                        <label>
                            Stato
                            <select v-model="taskForm.status">
                                <option value="todo">Todo</option>
                                <option value="in_progress">In corso</option>
                                <option value="done">Fatto</option>
                            </select>
                        </label>
                        <label>
                            Stima ore
                            <input
                                v-model="taskForm.estimated_hours"
                                type="number"
                                min="0"
                                step="0.25"
                            />
                        </label>
                        <button>Salva task</button>
                    </form>
                    <div>
                        <article v-for="task in tasks" :key="task.id" class="card row">
                            <strong>{{ task.title }}</strong>
                            <span>{{ task.status }}</span>
                        </article>
                    </div>
                </div>
            </section>

            <section class="section">
                <h2>Spese</h2>
                <div class="two-cols">
                    <form class="card form" @submit.prevent="addExpense">
                        <label>
                            Descrizione
                            <input v-model="expenseForm.description" required />
                        </label>
                        <label>
                            Categoria
                            <input v-model="expenseForm.category" />
                        </label>
                        <label>
                            Importo
                            <input
                                v-model="expenseForm.amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                required
                            />
                        </label>
                        <label>
                            Data
                            <input v-model="expenseForm.spent_at" type="date" required />
                        </label>
                        <button>Salva spesa</button>
                    </form>
                    <div>
                        <article v-for="expense in expenses" :key="expense.id" class="card row">
                            <div>
                                <strong>{{ expense.description }}</strong>
                                <div>{{ expense.spentAt }}</div>
                            </div>
                            <strong>€ {{ expense.amount }}</strong>
                        </article>
                    </div>
                </div>
            </section>
        </template>
    </AppLayout>
</template>
