import { useState, useMemo } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Phone, CheckCircle, XCircle, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAppointmentsByDate, useBarbers, useCancelAppointment, useCompleteAppointment, useCreateAppointment } from '@/hooks/useApi';
import { formatDateForDB, maskPhone } from '@/lib/date-utils';
import type { Appointment, Barber } from '@/types/database';

export function AdminPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [blockingBarber, setBlockingBarber] = useState<Barber | null>(null);
    const [blockTime, setBlockTime] = useState('');
    const [blockName, setBlockName] = useState('Bloqueio');

    const dateString = formatDateForDB(selectedDate);
    const { data: appointments = [], isLoading } = useAppointmentsByDate(dateString);
    const { data: barbers = [] } = useBarbers();

    const cancelAppointment = useCancelAppointment();
    const completeAppointment = useCompleteAppointment();
    const createBlock = useCreateAppointment();

    const scheduledAppointments = useMemo(() =>
        appointments.filter(apt => apt.status === 'scheduled'),
        [appointments]
    );

    const handleCancel = async (apt: Appointment) => {
        try {
            await cancelAppointment.mutateAsync(apt.id);
            toast.success('Agendamento cancelado');
        } catch {
            toast.error('Erro ao cancelar');
        }
    };

    const handleComplete = async (apt: Appointment) => {
        try {
            await completeAppointment.mutateAsync(apt.id);
            toast.success('Atendimento concluído');
        } catch {
            toast.error('Erro ao concluir');
        }
    };

    const handleBlock = async () => {
        if (!blockingBarber || !blockTime) return;

        try {
            await createBlock.mutateAsync({
                barber_id: blockingBarber.id,
                appointment_date: dateString,
                appointment_time: blockTime,
                client_name: blockName || 'Bloqueio',
                client_phone: '0000000000',
            });
            toast.success('Horário bloqueado');
            setBlockingBarber(null);
            setBlockTime('');
            setBlockName('Bloqueio');
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
            <div className="container max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Painel Administrativo</h1>
                        <p className="text-muted-foreground">Gerencie os agendamentos</p>
                    </div>
                    <a href="/" className="text-primary hover:underline text-sm">
                        ← Voltar para agendamentos
                    </a>
                </div>

                {/* Date Navigation */}
                <Card className="mb-6">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    <span className="capitalize">
                                        {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                                    </span>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Block Time Section */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            Bloquear Horário
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <select
                                value={blockingBarber?.id || ''}
                                onChange={(e) => {
                                    const barber = barbers.find(b => b.id === e.target.value);
                                    setBlockingBarber(barber || null);
                                }}
                                className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                            >
                                <option value="">Barbeiro...</option>
                                {barbers.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                            <Input
                                type="time"
                                value={blockTime}
                                onChange={(e) => setBlockTime(e.target.value)}
                                placeholder="Horário"
                            />
                            <Input
                                value={blockName}
                                onChange={(e) => setBlockName(e.target.value)}
                                placeholder="Motivo (ex: Almoço)"
                            />
                            <Button
                                onClick={handleBlock}
                                disabled={!blockingBarber || !blockTime || createBlock.isPending}
                            >
                                {createBlock.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Bloquear'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Appointments List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Agendamentos do Dia ({scheduledAppointments.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="h-20 rounded-lg" />
                                ))}
                            </div>
                        ) : scheduledAppointments.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Nenhum agendamento para esta data.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {scheduledAppointments.map((apt) => (
                                    <div
                                        key={apt.id}
                                        className={cn(
                                            'p-4 rounded-lg border transition-all',
                                            apt.client_phone === '0000000000'
                                                ? 'bg-yellow-50 border-yellow-200'
                                                : 'bg-card border-border'
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="flex items-center gap-1 text-primary font-semibold">
                                                        <Clock className="w-4 h-4" />
                                                        {apt.appointment_time.slice(0, 5)}
                                                    </div>
                                                    <span className="text-muted-foreground">•</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {(apt as any).barber?.name || 'Barbeiro'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <User className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-medium truncate">{apt.client_name}</span>
                                                </div>
                                                {apt.client_phone !== '0000000000' && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                        <Phone className="w-4 h-4" />
                                                        <span>{maskPhone(apt.client_phone)}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                {apt.client_phone !== '0000000000' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleComplete(apt)}
                                                        disabled={completeAppointment.isPending}
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleCancel(apt)}
                                                    disabled={cancelAppointment.isPending}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
