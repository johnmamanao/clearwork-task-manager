import { useEffect, useRef, useState } from 'react';
import { CalendarIcon } from './Icons';

interface Props {
    value: string;
    onChange: (value: string) => void;
}

const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toDate(value: string): Date | null {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function toValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function sameDay(first: Date, second: Date): boolean {
    return first.getFullYear() === second.getFullYear()
        && first.getMonth() === second.getMonth()
        && first.getDate() === second.getDate();
}

export function DatePicker({ value, onChange }: Props) {
    const selected = toDate(value);
    const today = new Date();
    const [open, setOpen] = useState(false);
    const [visibleMonth, setVisibleMonth] = useState(() => selected ?? today);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const close = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        };
        const escape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };

        document.addEventListener('pointerdown', close);
        document.addEventListener('keydown', escape);
        return () => {
            document.removeEventListener('pointerdown', close);
            document.removeEventListener('keydown', escape);
        };
    }, []);

    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const displayValue = selected
        ? new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(selected)
        : 'Choose a date';

    const moveMonth = (amount: number) => {
        setVisibleMonth(new Date(year, month + amount, 1));
    };

    const choose = (date: Date) => {
        onChange(toValue(date));
        setVisibleMonth(date);
        setOpen(false);
    };

    return <div className="date-picker" ref={rootRef}>
        <button type="button" className={open ? 'date-trigger open' : 'date-trigger'} onClick={() => setOpen((current) => !current)} aria-haspopup="dialog" aria-expanded={open}>
            <span className={selected ? '' : 'placeholder'}>{displayValue}</span>
            <CalendarIcon />
        </button>

        {open && <section className="calendar-popover" role="dialog" aria-label="Choose due date">
            <header className="calendar-header">
                <div><span>{visibleMonth.toLocaleString('en', { month: 'long' })}</span><strong>{year}</strong></div>
                <div>
                    <button type="button" onClick={() => moveMonth(-1)} aria-label="Previous month">←</button>
                    <button type="button" onClick={() => moveMonth(1)} aria-label="Next month">→</button>
                </div>
            </header>
            <div className="calendar-weekdays" aria-hidden="true">{weekDays.map((day) => <span key={day}>{day}</span>)}</div>
            <div className="calendar-grid">
                {Array.from({ length: firstWeekday }, (_, index) => <span key={`blank-${index}`} />)}
                {Array.from({ length: daysInMonth }, (_, index) => {
                    const date = new Date(year, month, index + 1);
                    const isSelected = selected ? sameDay(date, selected) : false;
                    const isToday = sameDay(date, today);
                    return <button
                        key={index + 1}
                        type="button"
                        className={`${isSelected ? 'selected ' : ''}${isToday ? 'today' : ''}`.trim()}
                        onClick={() => choose(date)}
                        aria-pressed={isSelected}
                        aria-label={new Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(date)}
                    >{index + 1}</button>;
                })}
            </div>
            <footer className="calendar-footer">
                <button type="button" onClick={() => { onChange(''); setOpen(false); }}>Clear</button>
                <button type="button" onClick={() => choose(today)}>Today</button>
            </footer>
        </section>}
    </div>;
}
