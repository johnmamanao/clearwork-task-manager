import { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { CalendarIcon } from './Icons';

interface Props {
    value: string;
    onChange: (value: string) => void;
}

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

    const displayValue = selected
        ? new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(selected)
        : 'Choose a date';

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

        {open && <div className="calendar-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
            <section className="calendar-popover" role="dialog" aria-modal="true" aria-label="Choose due date">
                <DayPicker
                    mode="single"
                    selected={selected ?? undefined}
                    month={visibleMonth}
                    onMonthChange={setVisibleMonth}
                    onSelect={(date) => date && choose(date)}
                    showOutsideDays
                    fixedWeeks
                    navLayout="around"
                    animate
                />
                <footer className="calendar-footer">
                    <button type="button" onClick={() => { onChange(''); setOpen(false); }}>Clear</button>
                    <button type="button" onClick={() => choose(today)}>Today</button>
                </footer>
            </section>
        </div>}
    </div>;
}
