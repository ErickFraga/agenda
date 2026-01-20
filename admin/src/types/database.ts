// Tipos do banco de dados (PostgreSQL/Supabase)

export type AppointmentStatus = 'scheduled' | 'canceled' | 'completed';

export interface BreakTime {
    start: string; // HH:mm
    end: string;   // HH:mm
}

export interface Barber {
    id: string;
    name: string;
    avatar_url: string | null;
    work_start_time: string;
    work_end_time: string;
    work_days: number[];
    slot_duration: number; // duração em minutos
    breaks: BreakTime[];   // intervalos/pausas
    created_at: string;
}

export interface Appointment {
    id: string;
    barber_id: string;
    client_name: string;
    client_phone: string;
    appointment_date: string;
    appointment_time: string;
    status: AppointmentStatus;
    created_at: string;
    barber?: Barber;
}

export interface CreateBarber {
    name: string;
    avatar_url?: string | null;
    work_start_time: string;
    work_end_time: string;
    work_days: number[];
    slot_duration?: number;
    breaks?: BreakTime[];
}

export interface UpdateBarber extends Partial<CreateBarber> {
    id: string;
}

export interface CreateAppointment {
    barber_id: string;
    client_name: string;
    client_phone: string;
    appointment_date: string;
    appointment_time: string;
}
