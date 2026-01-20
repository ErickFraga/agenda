// Tipos baseados no schema do banco de dados (PostgreSQL/Supabase)

export type AppointmentStatus = 'scheduled' | 'canceled' | 'completed';

export interface Barber {
    id: string;
    name: string;
    avatar_url: string | null;
    work_start_time: string; // HH:mm format
    work_end_time: string; // HH:mm format
    work_days: number[]; // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab
    created_at: string;
}

export interface Appointment {
    id: string;
    barber_id: string;
    client_name: string;
    client_phone: string;
    appointment_date: string; // YYYY-MM-DD format
    appointment_time: string; // HH:mm format  
    status: AppointmentStatus;
    created_at: string;
}

// Tipos para criação (sem id e created_at)
export interface CreateAppointment {
    barber_id: string;
    client_name: string;
    client_phone: string;
    appointment_date: string;
    appointment_time: string;
}

export interface TimeSlot {
    time: string; // HH:mm format
    available: boolean;
}

// Tipos para formulários
export interface BookingFormData {
    barber_id: string;
    date: Date | null;
    time: string;
    client_name: string;
    client_phone: string;
}
