export interface User { id: number; name: string; email: string }
export interface Client { id: number; name: string; company: string | null; email: string | null; phone: string | null; notes: string | null }
export type ProjectStatus = 'draft' | 'active' | 'completed' | 'cancelled'
export interface Project { id: number; name: string; description: string | null; status: ProjectStatus; hourlyRate: string | null; startedAt: string | null; deadline: string | null; client?: Client }
export interface Dashboard { clients: number; activeProjects: number; workedHoursThisMonth: number; expensesThisMonth: number; potentialRevenue: number }
export interface Paginated<T> { data: T[]; links: unknown; meta: unknown }