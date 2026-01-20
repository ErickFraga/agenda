import {
    format,
    parse,
    addMinutes,
    isBefore,
    startOfDay,
    isSameDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Appointment, TimeSlot } from '@/types/database';

const SLOT_DURATION_MINUTES = 45;

/**
 * Gera slots de horário disponíveis baseado no horário de trabalho do barbeiro
 * e agendamentos existentes
 */
export function generateTimeSlots(
    workStartTime: string,
    workEndTime: string,
    existingAppointments: Appointment[],
    selectedDate: Date
): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const now = new Date();
    const isToday = isSameDay(selectedDate, now);

    // Parse work times (formato HH:mm)
    const baseDate = startOfDay(selectedDate);
    let currentSlot = parse(workStartTime, 'HH:mm', baseDate);
    const endTime = parse(workEndTime, 'HH:mm', baseDate);

    // Horários ocupados (apenas agendamentos 'scheduled')
    const bookedTimes = new Set(
        existingAppointments
            .filter((apt) => apt.status === 'scheduled')
            .map((apt) => apt.appointment_time.slice(0, 5)) // Pega apenas HH:mm
    );

    while (isBefore(currentSlot, endTime)) {
        const timeString = format(currentSlot, 'HH:mm');

        // Verifica se o slot já passou (se for hoje)
        const isInPast = isToday && isBefore(currentSlot, now);

        // Verifica se o slot está ocupado
        const isBooked = bookedTimes.has(timeString);

        slots.push({
            time: timeString,
            available: !isInPast && !isBooked,
        });

        currentSlot = addMinutes(currentSlot, SLOT_DURATION_MINUTES);
    }

    return slots;
}

/**
 * Formata uma data para exibição
 */
export function formatDate(date: Date): string {
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
}

/**
 * Formata uma data para o formato do banco (YYYY-MM-DD)
 */
export function formatDateForDB(date: Date): string {
    return format(date, 'yyyy-MM-dd');
}

/**
 * Verifica se uma data é um dia de trabalho do barbeiro
 */
export function isWorkDay(date: Date, workDays: number[]): boolean {
    return workDays.includes(date.getDay());
}

/**
 * Formata telefone para apenas números
 */
export function formatPhone(phone: string): string {
    return phone.replace(/\D/g, '');
}

/**
 * Máscara de telefone para exibição
 */
export function maskPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}
