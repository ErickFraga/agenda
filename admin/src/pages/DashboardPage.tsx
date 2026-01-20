import { CalendarDays, Users, Clock, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useBarbers, useAppointments } from '@/hooks/useApi';

export function DashboardPage() {
    const { data: barbers = [] } = useBarbers();
    const { data: appointments = [] } = useAppointments();

    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.appointment_date === today && a.status === 'scheduled');
    const scheduledTotal = appointments.filter(a => a.status === 'scheduled').length;
    const completedTotal = appointments.filter(a => a.status === 'completed').length;

    const stats = [
        { label: 'Barbeiros', value: barbers.length, icon: Users, color: 'text-primary' },
        { label: 'Agendamentos Hoje', value: todayAppointments.length, icon: CalendarDays, color: 'text-success' },
        { label: 'Pendentes', value: scheduledTotal, icon: Clock, color: 'text-warning' },
        { label: 'Concluídos', value: completedTotal, icon: TrendingUp, color: 'text-muted-foreground' },
    ];

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Visão geral da barbearia</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map(({ label, value, icon: Icon, color }) => (
                    <Card key={label}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                            <Icon className={`w-5 h-5 ${color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Agendamentos de Hoje</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {todayAppointments.length === 0 ? (
                            <p className="text-muted-foreground text-sm">Nenhum agendamento para hoje.</p>
                        ) : (
                            <div className="space-y-3">
                                {todayAppointments.slice(0, 5).map(apt => (
                                    <div key={apt.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                        <div>
                                            <p className="font-medium">{apt.client_name}</p>
                                            <p className="text-sm text-muted-foreground">{apt.barber?.name || 'Barbeiro'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono font-medium">{apt.appointment_time.slice(0, 5)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Barbeiros Ativos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {barbers.map(barber => (
                                <div key={barber.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                            <Users className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{barber.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {barber.work_start_time} - {barber.work_end_time}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
