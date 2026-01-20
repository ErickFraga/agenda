import { useState, useMemo } from 'react';
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
    isToday,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Users, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppointments, useBarbers } from '@/hooks/useApi';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/types/database';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function CalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedBarber, setSelectedBarber] = useState<string | null>(null);

    const { data: barbers = [] } = useBarbers();
    const { data: allAppointments = [] } = useAppointments();

    // Filtrar agendamentos por barbeiro se selecionado
    const appointments = useMemo(() => {
        if (!selectedBarber) return allAppointments;
        return allAppointments.filter(apt => apt.barber_id === selectedBarber);
    }, [allAppointments, selectedBarber]);

    // Agrupar agendamentos por data
    const appointmentsByDate = useMemo(() => {
        const map = new Map<string, Appointment[]>();
        appointments.forEach(apt => {
            const dateKey = apt.appointment_date;
            if (!map.has(dateKey)) map.set(dateKey, []);
            map.get(dateKey)!.push(apt);
        });
        return map;
    }, [appointments]);

    // Gerar dias do calendário
    const calendarDays = useMemo(() => {
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
        return days;
    }, [currentMonth]);

    // Agendamentos do dia selecionado
    const selectedDayAppointments = useMemo(() => {
        if (!selectedDate) return [];
        const dateKey = format(selectedDate, 'yyyy-MM-dd');
        return appointmentsByDate.get(dateKey) || [];
    }, [selectedDate, appointmentsByDate]);

    const getBarberName = (barberId: string) => {
        return barbers.find(b => b.id === barberId)?.name || 'Barbeiro';
    };

    const getBarberColor = (barberId: string) => {
        const colors = ['bg-primary', 'bg-success', 'bg-warning', 'bg-destructive', 'bg-[#8b5cf6]'];
        const idx = barbers.findIndex(b => b.id === barberId);
        return colors[idx % colors.length];
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Calendário</h1>
                    <p className="text-muted-foreground">Visualize os agendamentos por dia</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendário */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                                <CardTitle className="capitalize">
                                    {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                                </CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Filtro de barbeiro */}
                            <div className="flex gap-2 mb-4 flex-wrap">
                                <Button
                                    variant={selectedBarber === null ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedBarber(null)}
                                >
                                    Todos
                                </Button>
                                {barbers.map(barber => (
                                    <Button
                                        key={barber.id}
                                        variant={selectedBarber === barber.id ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedBarber(barber.id)}
                                    >
                                        {barber.name}
                                    </Button>
                                ))}
                            </div>

                            {/* Header dias da semana */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {WEEKDAYS.map(day => (
                                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Grid de dias */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((day, i) => {
                                    const dateKey = format(day, 'yyyy-MM-dd');
                                    const dayAppointments = appointmentsByDate.get(dateKey) || [];
                                    const scheduledCount = dayAppointments.filter(a => a.status === 'scheduled').length;
                                    const isCurrentMonth = isSameMonth(day, currentMonth);
                                    const isSelected = selectedDate && isSameDay(day, selectedDate);

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedDate(day)}
                                            className={cn(
                                                'relative min-h-[80px] p-1 rounded-lg border transition-all text-left',
                                                !isCurrentMonth && 'opacity-40',
                                                isSelected && 'ring-2 ring-primary',
                                                isToday(day) && 'bg-primary/10',
                                                'hover:bg-accent'
                                            )}
                                        >
                                            <div className={cn(
                                                'text-sm font-medium mb-1',
                                                isToday(day) && 'text-primary'
                                            )}>
                                                {format(day, 'd')}
                                            </div>

                                            {scheduledCount > 0 && (
                                                <div className="space-y-0.5">
                                                    {dayAppointments.slice(0, 3).map(apt => (
                                                        <div
                                                            key={apt.id}
                                                            className={cn(
                                                                'text-[10px] px-1 py-0.5 rounded truncate text-white',
                                                                getBarberColor(apt.barber_id)
                                                            )}
                                                            title={`${apt.appointment_time.slice(0, 5)} - ${apt.client_name}`}
                                                        >
                                                            {apt.appointment_time.slice(0, 5)}
                                                        </div>
                                                    ))}
                                                    {dayAppointments.length > 3 && (
                                                        <div className="text-[10px] text-muted-foreground">
                                                            +{dayAppointments.length - 3} mais
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Detalhes do dia selecionado */}
                <div>
                    <Card className="sticky top-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                {selectedDate
                                    ? format(selectedDate, "d 'de' MMMM", { locale: ptBR })
                                    : 'Selecione um dia'
                                }
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!selectedDate ? (
                                <p className="text-muted-foreground text-sm">
                                    Clique em um dia no calendário para ver os agendamentos.
                                </p>
                            ) : selectedDayAppointments.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                    Nenhum agendamento para esta data.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {selectedDayAppointments
                                        .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                                        .map(apt => (
                                            <div
                                                key={apt.id}
                                                className={cn(
                                                    'p-3 rounded-lg border-l-4',
                                                    apt.status === 'scheduled' && 'bg-card border-l-primary',
                                                    apt.status === 'completed' && 'bg-success/10 border-l-success',
                                                    apt.status === 'canceled' && 'bg-destructive/10 border-l-destructive line-through opacity-60'
                                                )}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono font-semibold text-sm">
                                                        {apt.appointment_time.slice(0, 5)}
                                                    </span>
                                                    <span className={cn(
                                                        'text-xs px-1.5 py-0.5 rounded',
                                                        apt.status === 'scheduled' && 'bg-primary/20 text-primary',
                                                        apt.status === 'completed' && 'bg-success/20 text-success',
                                                        apt.status === 'canceled' && 'bg-destructive/20 text-destructive'
                                                    )}>
                                                        {apt.status === 'scheduled' ? 'Agendado' : apt.status === 'completed' ? 'Concluído' : 'Cancelado'}
                                                    </span>
                                                </div>
                                                <p className="font-medium">{apt.client_name}</p>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                    <Users className="w-3 h-3" />
                                                    {getBarberName(apt.barber_id)}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{apt.client_phone}</p>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
