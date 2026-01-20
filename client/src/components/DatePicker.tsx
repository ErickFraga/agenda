import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
    isBefore,
    startOfDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { isWorkDay } from '@/lib/date-utils';

interface DatePickerProps {
    selectedDate: Date | null;
    onSelect: (date: Date) => void;
    workDays: number[];
}

export function DatePicker({ selectedDate, onSelect, workDays }: DatePickerProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const today = startOfDay(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
        days.push(day);
        day = addDays(day, 1);
    }

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <div className="w-full max-w-sm mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    disabled={isSameMonth(currentMonth, today)}
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <h3 className="font-semibold text-lg capitalize">
                    {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </h3>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>

            {/* Week days header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((weekDay) => (
                    <div
                        key={weekDay}
                        className="text-center text-xs font-medium text-muted-foreground py-2"
                    >
                        {weekDay}
                    </div>
                ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((d, i) => {
                    const isCurrentMonth = isSameMonth(d, currentMonth);
                    const isSelected = selectedDate && isSameDay(d, selectedDate);
                    const isPast = isBefore(d, today);
                    const isWork = isWorkDay(d, workDays);
                    const isDisabled = !isCurrentMonth || isPast || !isWork;

                    return (
                        <button
                            key={i}
                            onClick={() => !isDisabled && onSelect(d)}
                            disabled={isDisabled}
                            className={cn(
                                'aspect-square p-2 rounded-lg text-sm font-medium transition-all',
                                isDisabled && 'text-muted-foreground/30 cursor-not-allowed',
                                !isDisabled && 'hover:bg-accent cursor-pointer',
                                isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90',
                                isSameDay(d, today) && !isSelected && 'ring-1 ring-primary',
                            )}
                        >
                            {format(d, 'd')}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
