import { useEffect, useState, type FormEvent } from 'react';
import { ApiError } from '../api';
import type { Task, TaskInput, ValidationErrors } from '../types';
import { CloseIcon } from './Icons';

const emptyTask: TaskInput = {
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
};

interface Props {
    task: Task | null;
    open: boolean;
    onClose: () => void;
    onSave: (input: TaskInput) => Promise<void>;
}

export function TaskForm({ task, open, onClose, onSave }: Props) {
    const [form, setForm] = useState<TaskInput>(emptyTask);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setForm(task ? {
            title: task.title,
            description: task.description ?? '',
            status: task.status,
            priority: task.priority,
            due_date: task.due_date ?? '',
        } : emptyTask);
        setErrors({});
    }, [task, open]);

    if (!open) return null;

    const set = <K extends keyof TaskInput>(key: K, value: TaskInput[K]) => {
        setForm((current) => ({ ...current, [key]: value }));
        setErrors((current) => ({ ...current, [key]: undefined }));
    };

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setSaving(true);
        try {
            await onSave(form);
            onClose();
        } catch (error) {
            if (error instanceof ApiError) setErrors(error.errors);
        } finally {
            setSaving(false);
        }
    };

    return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="task-form-title">
            <div className="modal-header">
                <div>
                    <span className="eyebrow">{task ? 'Edit task' : 'New task'}</span>
                    <h2 id="task-form-title">{task ? 'Update the details' : 'What needs doing?'}</h2>
                </div>
                <button className="icon-button" onClick={onClose} aria-label="Close dialog"><CloseIcon /></button>
            </div>
            <form onSubmit={submit}>
                <label>Title <span>*</span>
                    <input autoFocus value={form.title} onChange={(event) => set('title', event.target.value)} placeholder="e.g. Prepare project demo" />
                    {errors.title && <small className="field-error">{errors.title[0]}</small>}
                </label>
                <label>Description
                    <textarea rows={4} value={form.description} onChange={(event) => set('description', event.target.value)} placeholder="Add useful context…" />
                    {errors.description && <small className="field-error">{errors.description[0]}</small>}
                </label>
                <div className="form-grid">
                    <label>Status
                        <select value={form.status} onChange={(event) => set('status', event.target.value as TaskInput['status'])}>
                            <option value="pending">To do</option>
                            <option value="in_progress">In progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </label>
                    <label>Priority
                        <select value={form.priority} onChange={(event) => set('priority', event.target.value as TaskInput['priority'])}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </label>
                </div>
                <label>Due date
                    <input type="date" value={form.due_date} onChange={(event) => set('due_date', event.target.value)} />
                    {errors.due_date && <small className="field-error">{errors.due_date[0]}</small>}
                </label>
                <div className="modal-actions">
                    <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
                    <button className="button primary" disabled={saving}>{saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}</button>
                </div>
            </form>
        </section>
    </div>;
}
