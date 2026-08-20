import type { Task, TaskStatus } from '../types';
import { CalendarIcon, CheckIcon, EditIcon, TrashIcon } from './Icons';

const statusLabels: Record<TaskStatus, string> = {
    pending: 'To do',
    in_progress: 'In progress',
    completed: 'Completed',
};

interface Props {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
    onToggle: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onDelete, onToggle }: Props) {
    const dueDate = task.due_date
        ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${task.due_date}T00:00:00`))
        : null;

    return <article className={`task-card ${task.status === 'completed' ? 'is-complete' : ''}`}>
        <button className="complete-toggle" onClick={() => onToggle(task)} aria-label={task.status === 'completed' ? 'Mark incomplete' : 'Mark complete'}>
            {task.status === 'completed' && <CheckIcon />}
        </button>
        <div className="task-content">
            <div className="task-title-row">
                <h3>{task.title}</h3>
                <span className={`priority priority-${task.priority}`}>{task.priority}</span>
            </div>
            {task.description && <p>{task.description}</p>}
            <div className="task-meta">
                <span className={`status status-${task.status}`}>{statusLabels[task.status]}</span>
                {dueDate && <span className="due-date"><CalendarIcon /> {dueDate}</span>}
            </div>
        </div>
        <div className="card-actions">
            <button className="icon-button" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`}><EditIcon /></button>
            <button className="icon-button danger" onClick={() => onDelete(task)} aria-label={`Delete ${task.title}`}><TrashIcon /></button>
        </div>
    </article>;
}
