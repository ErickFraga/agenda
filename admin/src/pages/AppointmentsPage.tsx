import { useState } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Trash2, Calendar, Clock, User, Phone, CalendarClock, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppointments, useUpdateAppointmentStatus, useDeleteAppointment, useCreateAppointment } from '@/hooks/useApi';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/types/database';

const statusColors: Record<string, string> = {
    scheduled: 'bg-primary/20 text-primary',
    completed: 'bg-success/20 text-success',
    canceled: 'bg-destructive/20 text-destructive',
};

const statusLabels: Record<string, string> = {
    scheduled: 'Agendado',
    completed: 'Concluído',
    canceled: 'Cancelado',
};

export function AppointmentsPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filter, setFilter] = useState<string | null>(null);
    const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');

    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const { data: appointments = [], isLoading } = useAppointments(dateString);
    const updateStatus = useUpdateAppointmentStatus();
    const deleteApt = useDeleteAppointment();
    const createApt = useCreateAppointment();

    const filteredAppointments = filter
        ? appointments.filter(a => a.status === filter)
        : appointments;

    const handleComplete = async (id: string) => {
        try {
            await updateStatus.mutateAsync({ id, status: 'completed' });
            toast.success('Marcado como concluído');
        } catch { toast.error('Erro'); }
    };

    const handleCancel = async (id: string) => {
        try {
            await updateStatus.mutateAsync({ id, status: 'canceled' });
            toast.success('Cancelado');
        } catch { toast.error('Erro'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remover agendamento?')) return;
        try {
            await deleteApt.mutateAsync(id);
            toast.success('Removido');
        } catch { toast.error('Erro'); }
    };

    const openReschedule = (apt: Appointment) => {
        setRescheduleApt(apt);
        setNewDate(apt.appointment_date);
        setNewTime(apt.appointment_time.slice(0, 5));
    };

    const handleReschedule = async () => {
        if (!rescheduleApt || !newDate || !newTime) return;

        try {
            // Cancelar agendamento antigo
            await updateStatus.mutateAsync({ id: rescheduleApt.id, status: 'canceled' });

            // Criar novo agendamento
            await createApt.mutateAsync({
                barber_id: rescheduleApt.barber_id,
                client_name: rescheduleApt.client_name,
                client_phone: rescheduleApt.client_phone,
                appointment_date: newDate,
                appointment_time: newTime,
            });

            toast.success('Agendamento remarcado com sucesso!');
            setRescheduleApt(null);
            setNewDate('');
            setNewTime('');
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Erro ao remarcar');
            }
        }
    };

    const isRescheduling = updateStatus.isPending || createApt.isPending;

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Agendamentos</h1>
                <p className="text-muted-foreground">Gerencie os horários</p>
            </div>

            {/* Modal de Remarcação */}
            {rescheduleApt && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <CalendarClock className="w-5 h-5 text-primary" />
                                    Remarcar Agendamento
                                </h2>
                                <Button variant="ghost" size="icon" onClick={() => setRescheduleApt(null)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="bg-muted/50 rounded-lg p-3 mb-4">
                                <p className="font-medium">{rescheduleApt.client_name}</p>
                                <p className="text-sm text-muted-foreground">
                                    Atual: {format(new Date(rescheduleApt.appointment_date + 'T00:00'), 'dd/MM/yyyy', { locale: ptBR })} às {rescheduleApt.appointment_time.slice(0, 5)}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Nova Data</label>
                                    <Input
                                        type="date"
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                        min={format(new Date(), 'yyyy-MM-dd')}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Novo Horário</label>
                                    <Input
                                        type="time"
                                        value={newTime}
                                        onChange={(e) => setNewTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 mt-6">
                                <Button
                                    onClick={handleReschedule}
                                    disabled={!newDate || !newTime || isRescheduling}
                                    className="flex-1"
                                >
                                    {isRescheduling ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Remarcando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Confirmar
                                        </>
                                    )}
                                </Button>
                                <Button variant="outline" onClick={() => setRescheduleApt(null)} disabled={isRescheduling}>
                                    Cancelar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Date Navigation */}
            <Card className="mb-6">
                <CardContent className="py-4 flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-2 text-lg font-medium">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span className="capitalize">{format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                <Button variant={filter === null ? 'default' : 'outline'} size="sm" onClick={() => setFilter(null)}>
                    Todos
                </Button>
                {Object.entries(statusLabels).map(([status, label]) => (
                    <Button key={status} variant={filter === status ? 'default' : 'outline'} size="sm" onClick={() => setFilter(status)}>
                        {label}
                    </Button>
                ))}
            </div>

            {/* Appointments List */}
            {isLoading ? (
                <p className="text-muted-foreground">Carregando...</p>
            ) : filteredAppointments.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-muted-foreground">Nenhum agendamento para esta data.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredAppointments.map(apt => (
                        <Card key={apt.id}>
                            <CardContent className="py-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex items-center gap-1 font-mono font-semibold">
                                                <Clock className="w-4 h-4 text-primary" />
                                                {apt.appointment_time.slice(0, 5)}
                                            </div>
                                            <span className={cn('px-2 py-0.5 rounded text-xs font-medium', statusColors[apt.status])}>
                                                {statusLabels[apt.status]}
                                            </span>
                                        </div>
                                        <div className="grid gap-1 text-sm">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">{apt.client_name}</span>
                                                <span className="text-muted-foreground">· {apt.barber?.name || 'Barbeiro'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Phone className="w-4 h-4" />
                                                {apt.client_phone}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1 justify-end content-start min-w-[80px]">
                                        {apt.status === 'scheduled' && (
                                            <>
                                                <Button variant="ghost" size="icon" onClick={() => openReschedule(apt)} title="Remarcar" className="text-warning">
                                                    <CalendarClock className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleComplete(apt.id)} title="Concluir" className="text-success">
                                                    <CheckCircle className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleCancel(apt.id)} title="Cancelar" className="text-destructive">
                                                    <XCircle className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(apt.id)} title="Remover">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
