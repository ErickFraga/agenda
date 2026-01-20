import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Barber } from '@/types/database';
import { Skeleton } from '@/components/ui/skeleton';

interface BarberListProps {
    barbers: Barber[];
    selectedId: string | null;
    onSelect: (barber: Barber) => void;
    isLoading?: boolean;
}

export function BarberList({ barbers, selectedId, onSelect, isLoading }: BarberListProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>
        );
    }

    if (barbers.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8">
                Nenhum barbeiro disponível no momento.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {barbers.map((barber) => (
                <button
                    key={barber.id}
                    onClick={() => onSelect(barber)}
                    className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:border-primary/50 hover:bg-accent',
                        selectedId === barber.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border'
                    )}
                >
                    {barber.avatar_url ? (
                        <img
                            src={barber.avatar_url}
                            alt={barber.name}
                            className="w-16 h-16 rounded-full object-cover ring-2 ring-background shadow-md"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center ring-2 ring-background shadow-md">
                            <User className="w-8 h-8 text-muted-foreground" />
                        </div>
                    )}
                    <span className="font-medium text-sm text-center">{barber.name}</span>
                </button>
            ))}
        </div>
    );
}
