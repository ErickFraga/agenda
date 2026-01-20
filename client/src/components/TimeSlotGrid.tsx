import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimeSlot } from '@/types/database';
import { Skeleton } from '@/components/ui/skeleton';

interface TimeSlotGridProps {
    slots: TimeSlot[];
    selectedTime: string | null;
    onSelect: (time: string) => void;
    isLoading?: boolean;
}

export function TimeSlotGrid({ slots, selectedTime, onSelect, isLoading }: TimeSlotGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
            </div>
        );
    }

    const availableSlots = slots.filter((slot) => slot.available);

    if (availableSlots.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8 flex flex-col items-center gap-2">
                <Clock className="w-8 h-8" />
                <p>Nenhum horário disponível nesta data.</p>
                <p className="text-sm">Tente selecionar outra data.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {slots.map((slot) => (
                <button
                    key={slot.time}
                    onClick={() => slot.available && onSelect(slot.time)}
                    disabled={!slot.available}
                    className={cn(
                        'h-12 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1',
                        !slot.available && 'bg-muted text-muted-foreground/50 cursor-not-allowed line-through',
                        slot.available && 'border border-border hover:border-primary hover:bg-accent cursor-pointer',
                        selectedTime === slot.time && slot.available && 'bg-primary text-primary-foreground border-primary hover:bg-primary/90',
                    )}
                >
                    {slot.time}
                </button>
            ))}
        </div>
    );
}
