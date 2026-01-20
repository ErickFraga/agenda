import {
    format,
    parse,
    addMinutes,
    isBefore,
    startOfDay,
    isSameDay,
    isAfter,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Appointment, TimeSlot, BreakTime } from '@/types/database';

/**
 * Verifica se um slot de horário colide com uma pausa
 */
function isOverlappingBreak(
    slotStart: Date,
    slotDuration: number,
    breaks: BreakTime[],
    baseDate: Date
): boolean {
    const slotEnd = addMinutes(slotStart, slotDuration);

    for (const breakItem of breaks) {
        const breakStart = parse(breakItem.start.slice(0, 5), 'HH:mm', baseDate);
        const breakEnd = parse(breakItem.end.slice(0, 5), 'HH:mm', baseDate);

        // Verifica overlap: SlotStart < BreakEnd AND SlotEnd > BreakStart
        // Permite que o slot termine exatamente quando a pausa começa (e.g. 12:00)
        // Permite que o slot comece exatamente quando a pausa termina (e.g. 13:00)
        const overlaps = isBefore(slotStart, breakEnd) && isAfter(slotEnd, breakStart);

        if (overlaps) return true;
    }
    return false;
}

/**
 * Gera slots de horário disponíveis baseado no horário de trabalho do barbeiro,
 * pausas e agendamentos existentes
 */
export function generateTimeSlots(
    workStartTime: string,
    workEndTime: string,
    existingAppointments: Appointment[],
    selectedDate: Date,
    slotDuration: number = 45,
    breaks: BreakTime[] = []
): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const now = new Date();
    const isToday = isSameDay(selectedDate, now);

    // Parse work times (formato HH:mm ou HH:mm:ss)
    const baseDate = startOfDay(selectedDate);
    const startTimeStr = workStartTime.slice(0, 5);
    const endTimeStr = workEndTime.slice(0, 5);
    let currentSlot = parse(startTimeStr, 'HH:mm', baseDate);
    const endTime = parse(endTimeStr, 'HH:mm', baseDate);

    // Horários ocupados (apenas agendamentos 'scheduled')
    const bookedTimes = new Set(
        existingAppointments
            .filter((apt) => apt.status === 'scheduled')
            .map((apt) => apt.appointment_time.slice(0, 5))
    );

    while (isBefore(currentSlot, endTime)) {
        const timeString = format(currentSlot, 'HH:mm');

        // Verifica se o slot já passou (se for hoje)
        const isInPast = isToday && isBefore(currentSlot, now);

        // Verifica se o slot está ocupado
        const isBooked = bookedTimes.has(timeString);

        // Verifica se o slot colide com uma pausa
        const isDuringBreak = isOverlappingBreak(currentSlot, slotDuration, breaks, baseDate);

        // Se estiver em pausa, não adiciona à lista (conforme solicitado: "não devem ser exibidos")
        if (!isDuringBreak) {
            slots.push({
                time: timeString,
                available: !isInPast && !isBooked,
            });
        }

        currentSlot = addMinutes(currentSlot, slotDuration);
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
