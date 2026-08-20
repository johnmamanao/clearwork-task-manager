import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
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

    const displayValue = selected
        ? new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(selected)
        : 'Pick a date';

    const choose = (date: Date) => {
        onChange(toValue(date));
        setVisibleMonth(date);
        setOpen(false);
    };

    return <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
            <button type="button" className={open ? 'date-trigger open' : 'date-trigger'} aria-label="Due date">
                <span className={selected ? '' : 'placeholder'}>{displayValue}</span>
                <CalendarIcon />
            </button>
        </Popover.Trigger>

        <Popover.Portal>
            <Popover.Content className="calendar-popover" side="bottom" align="start" sideOffset={7} collisionPadding={16} role="dialog" aria-label="Choose due date">
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
            </Popover.Content>
        </Popover.Portal>
    </Popover.Root>;
}
