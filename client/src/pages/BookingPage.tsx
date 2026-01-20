import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Scissors, CalendarCheck, ArrowLeft, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarberList } from '@/components/BarberList';
import { DatePicker } from '@/components/DatePicker';
import { TimeSlotGrid } from '@/components/TimeSlotGrid';
import { BookingForm } from '@/components/BookingForm';
import { useBarbers, useAppointmentsByDateAndBarber, useCreateAppointment } from '@/hooks/useApi';
import { generateTimeSlots, formatDateForDB, formatDate } from '@/lib/date-utils';
import type { Barber } from '@/types/database';

type Step = 'barber' | 'date' | 'time' | 'confirm' | 'success';

export function BookingPage() {
    const [step, setStep] = useState<Step>('barber');
    const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const { data: barbers = [], isLoading: loadingBarbers } = useBarbers();

    const dateString = selectedDate ? formatDateForDB(selectedDate) : null;
    const { data: appointments = [], isLoading: loadingAppointments } = useAppointmentsByDateAndBarber(
        dateString,
        selectedBarber?.id || null
    );

    const createAppointment = useCreateAppointment();

    const timeSlots = useMemo(() => {
        if (!selectedBarber || !selectedDate) return [];
        return generateTimeSlots(
            selectedBarber.work_start_time,
            selectedBarber.work_end_time,
            appointments,
            selectedDate
        );
    }, [selectedBarber, selectedDate, appointments]);

    const handleBarberSelect = (barber: Barber) => {
        setSelectedBarber(barber);
        setStep('date');
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setSelectedTime(null);
        setStep('time');
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        setStep('confirm');
    };

    const handleBooking = async (data: { client_name: string; client_phone: string }) => {
        if (!selectedBarber || !selectedDate || !selectedTime) return;

        try {
            await createAppointment.mutateAsync({
                barber_id: selectedBarber.id,
                appointment_date: formatDateForDB(selectedDate),
                appointment_time: selectedTime,
                client_name: data.client_name,
                client_phone: data.client_phone,
            });
            toast.success('Agendamento confirmado!');
            setStep('success');
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Erro ao agendar. Tente novamente.');
            }
        }
    };

    const handleBack = () => {
        if (step === 'date') setStep('barber');
        else if (step === 'time') setStep('date');
        else if (step === 'confirm') setStep('time');
    };

    const handleReset = () => {
        setStep('barber');
        setSelectedBarber(null);
        setSelectedDate(null);
        setSelectedTime(null);
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center gap-2 mb-6">
            {['barber', 'date', 'time', 'confirm'].map((s, i) => (
                <div
                    key={s}
                    className={`w-2 h-2 rounded-full transition-all ${step === s ? 'w-8 bg-primary' :
                            ['barber', 'date', 'time', 'confirm'].indexOf(step) > i ? 'bg-primary' : 'bg-muted'
                        }`}
                />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
            <div className="container max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4 shadow-lg">
                        <Scissors className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Barbearia</h1>
                    <p className="text-muted-foreground">Agende seu horário</p>
                </div>

                {step !== 'success' && step !== 'barber' && (
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                    </Button>
                )}

                {step !== 'success' && renderStepIndicator()}

                {/* Step: Barber Selection */}
                {step === 'barber' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Escolha seu barbeiro</CardTitle>
                            <CardDescription>
                                Selecione o profissional para seu atendimento
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BarberList
                                barbers={barbers}
                                selectedId={selectedBarber?.id || null}
                                onSelect={handleBarberSelect}
                                isLoading={loadingBarbers}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Step: Date Selection */}
                {step === 'date' && selectedBarber && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Escolha a data</CardTitle>
                            <CardDescription>
                                Atendimento com {selectedBarber.name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DatePicker
                                selectedDate={selectedDate}
                                onSelect={handleDateSelect}
                                workDays={selectedBarber.work_days}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Step: Time Selection */}
                {step === 'time' && selectedBarber && selectedDate && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Escolha o horário</CardTitle>
                            <CardDescription className="capitalize">
                                {formatDate(selectedDate)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TimeSlotGrid
                                slots={timeSlots}
                                selectedTime={selectedTime}
                                onSelect={handleTimeSelect}
                                isLoading={loadingAppointments}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Step: Confirmation */}
                {step === 'confirm' && selectedBarber && selectedDate && selectedTime && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Confirme seus dados</CardTitle>
                            <CardDescription>
                                <div className="space-y-1 mt-2">
                                    <p><strong>Barbeiro:</strong> {selectedBarber.name}</p>
                                    <p className="capitalize"><strong>Data:</strong> {formatDate(selectedDate)}</p>
                                    <p><strong>Horário:</strong> {selectedTime}</p>
                                </div>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BookingForm
                                onSubmit={handleBooking}
                                isLoading={createAppointment.isPending}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Step: Success */}
                {step === 'success' && (
                    <Card className="text-center">
                        <CardContent className="pt-8 pb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6">
                                <Check className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Agendamento Confirmado!</h2>
                            <p className="text-muted-foreground mb-6">
                                Você receberá uma confirmação no WhatsApp.
                            </p>
                            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                                <p><strong>Barbeiro:</strong> {selectedBarber?.name}</p>
                                <p className="capitalize"><strong>Data:</strong> {selectedDate && formatDate(selectedDate)}</p>
                                <p><strong>Horário:</strong> {selectedTime}</p>
                            </div>
                            <Button onClick={handleReset} size="lg">
                                <CalendarCheck className="w-4 h-4 mr-2" />
                                Novo Agendamento
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
