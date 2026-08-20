import type { Task, TaskInput, TaskStatus, ValidationErrors } from './types';

interface Resource<T> {
    data: T;
}

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly errors: ValidationErrors = {},
    ) {
        super(message);
    }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (response.status === 204) return undefined as T;

    const body = await response.json();
    if (!response.ok) {
        throw new ApiError(body.message ?? 'Something went wrong.', body.errors);
    }

    return body;
}

export async function getTasks(search = '', status: TaskStatus | 'all' = 'all'): Promise<Task[]> {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status !== 'all') params.set('status', status);
    const query = params.size ? `?${params.toString()}` : '';

    return (await request<Resource<Task[]>>(`/api/tasks${query}`)).data;
}

export async function createTask(input: TaskInput): Promise<Task> {
    return (await request<Resource<Task>>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(input),
    })).data;
}

export async function updateTask(id: number, input: Partial<TaskInput>): Promise<Task> {
    return (await request<Resource<Task>>(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
    })).data;
}

export async function deleteTask(id: number): Promise<void> {
    await request<void>(`/api/tasks/${id}`, { method: 'DELETE' });
}
