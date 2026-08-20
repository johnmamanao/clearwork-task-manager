import { useEffect, useMemo, useState } from 'react';
import { createTask, deleteTask, getTasks, updateTask } from './api';
import { LayersIcon, PlusIcon, SearchIcon } from './components/Icons';
import { TaskCard } from './components/TaskCard';
import { TaskForm } from './components/TaskForm';
import type { Task, TaskInput, TaskStatus } from './types';

const filters: Array<{ value: TaskStatus | 'all'; label: string }> = [
    { value: 'all', label: 'All tasks' },
    { value: 'pending', label: 'To do' },
    { value: 'in_progress', label: 'In progress' },
    { value: 'completed', label: 'Completed' },
];

export default function App() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<TaskStatus | 'all'>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Task | null>(null);
    const [deleting, setDeleting] = useState<Task | null>(null);

    useEffect(() => {
        const timer = window.setTimeout(async () => {
            setLoading(true);
            try {
                setTasks(await getTasks(search, status));
                setError('');
            } catch {
                setError('Could not load tasks. Please try again.');
            } finally {
                setLoading(false);
            }
        }, search ? 250 : 0);

        return () => window.clearTimeout(timer);
    }, [search, status]);

    const counts = useMemo(() => ({
        total: tasks.length,
        completed: tasks.filter((task) => task.status === 'completed').length,
        active: tasks.filter((task) => task.status !== 'completed').length,
    }), [tasks]);

    const openNew = () => {
        setEditing(null);
        setFormOpen(true);
    };

    const save = async (input: TaskInput) => {
        const saved = editing ? await updateTask(editing.id, input) : await createTask(input);
        setTasks((current) => editing
            ? current.map((task) => task.id === saved.id ? saved : task)
            : [saved, ...current]);
    };

    const toggle = async (task: Task) => {
        const status: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
        const updated = await updateTask(task.id, { status });
        setTasks((current) => current.map((item) => item.id === updated.id ? updated : item));
    };

    const confirmDelete = async () => {
        if (!deleting) return;
        await deleteTask(deleting.id);
        setTasks((current) => current.filter((task) => task.id !== deleting.id));
        setDeleting(null);
    };

    return <>
        <header className="site-header">
            <div className="shell header-inner">
                <a className="brand" href="/" aria-label="Clearwork home"><span><LayersIcon /></span>Clearwork</a>
                <button className="button primary compact" onClick={openNew}><PlusIcon /> Add task</button>
            </div>
        </header>

        <main className="shell">
            <section className="hero">
                <div>
                    <span className="eyebrow">My workspace</span>
                    <h1>Make today count.</h1>
                    <p>Keep the important work visible, focused, and moving forward.</p>
                </div>
                <div className="stats" aria-label="Task summary">
                    <div><strong>{counts.active}</strong><span>Open</span></div>
                    <div><strong>{counts.completed}</strong><span>Done</span></div>
                    <div><strong>{counts.total}</strong><span>Total</span></div>
                </div>
            </section>

            <section className="toolbar" aria-label="Task filters">
                <div className="search-box"><SearchIcon /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks…" aria-label="Search tasks" /></div>
                <div className="filter-tabs">
                    {filters.map((filter) => <button key={filter.value} className={status === filter.value ? 'active' : ''} onClick={() => setStatus(filter.value)}>{filter.label}</button>)}
                </div>
            </section>

            {error && <div className="alert" role="alert">{error}</div>}
            {loading ? <div className="loading-list" aria-label="Loading tasks">{[1, 2, 3].map((item) => <div className="skeleton" key={item} />)}</div>
                : tasks.length ? <div className="task-list">{tasks.map((task) => <TaskCard key={task.id} task={task} onEdit={(task) => { setEditing(task); setFormOpen(true); }} onDelete={setDeleting} onToggle={toggle} />)}</div>
                : <section className="empty-state"><div><LayersIcon /></div><h2>No tasks found</h2><p>{search || status !== 'all' ? 'Try changing your search or filter.' : 'Add your first task and get things moving.'}</p>{!search && status === 'all' && <button className="button primary" onClick={openNew}><PlusIcon /> Add your first task</button>}</section>}
        </main>

        <TaskForm task={editing} open={formOpen} onClose={() => setFormOpen(false)} onSave={save} />

        {deleting && <div className="modal-backdrop" role="presentation">
            <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
                <span className="eyebrow">Delete task</span>
                <h2 id="delete-title">Remove “{deleting.title}”?</h2>
                <p>This action cannot be undone.</p>
                <div className="modal-actions"><button className="button secondary" onClick={() => setDeleting(null)}>Cancel</button><button className="button delete" onClick={confirmDelete}>Delete task</button></div>
            </section>
        </div>}
    </>;
}
