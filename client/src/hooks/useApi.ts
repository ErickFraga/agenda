import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Barber, Appointment, CreateAppointment } from '@/types/database';

// Dados de exemplo para quando Supabase não está configurado
const MOCK_BARBERS: Barber[] = [
    {
        id: '1',
        name: 'João Silva',
        avatar_url: null,
        work_start_time: '09:00',
        work_end_time: '18:00',
        work_days: [1, 2, 3, 4, 5, 6],
        created_at: new Date().toISOString(),
    },
    {
        id: '2',
        name: 'Carlos Santos',
        avatar_url: null,
        work_start_time: '10:00',
        work_end_time: '19:00',
        work_days: [1, 2, 3, 4, 5],
        created_at: new Date().toISOString(),
    },
    {
        id: '3',
        name: 'Miguel Oliveira',
        avatar_url: null,
        work_start_time: '08:00',
        work_end_time: '17:00',
        work_days: [2, 3, 4, 5, 6],
        created_at: new Date().toISOString(),
    },
];

// ============= BARBERS =============

export function useBarbers() {
    return useQuery({
        queryKey: ['barbers'],
        queryFn: async (): Promise<Barber[]> => {
            if (!isSupabaseConfigured) {
                return MOCK_BARBERS;
            }

            const { data, error } = await supabase
                .from('barbers')
                .select('*')
                .order('name');

            if (error) throw error;
            return data || [];
        },
    });
}

export function useBarber(id: string | null) {
    return useQuery({
        queryKey: ['barbers', id],
        queryFn: async (): Promise<Barber | null> => {
            if (!id) return null;

            if (!isSupabaseConfigured) {
                return MOCK_BARBERS.find(b => b.id === id) || null;
            }

            const { data, error } = await supabase
                .from('barbers')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

// ============= APPOINTMENTS =============

export function useAppointmentsByDateAndBarber(date: string | null, barberId: string | null) {
    return useQuery({
        queryKey: ['appointments', date, barberId],
        queryFn: async (): Promise<Appointment[]> => {
            if (!date || !barberId) return [];

            if (!isSupabaseConfigured) {
                return []; // Sem agendamentos no modo demo
            }

            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('appointment_date', date)
                .eq('barber_id', barberId)
                .eq('status', 'scheduled');

            if (error) throw error;
            return data || [];
        },
        enabled: !!date && !!barberId,
    });
}

export function useAppointmentsByDate(date: string) {
    return useQuery({
        queryKey: ['appointments', 'day', date],
        queryFn: async (): Promise<(Appointment & { barber: Barber })[]> => {
            if (!isSupabaseConfigured) {
                return []; // Sem agendamentos no modo demo
            }

            const { data, error } = await supabase
                .from('appointments')
                .select('*, barber:barbers(*)')
                .eq('appointment_date', date)
                .order('appointment_time');

            if (error) throw error;
            return data || [];
        },
    });
}

export function useCreateAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (appointment: CreateAppointment) => {
            if (!isSupabaseConfigured) {
                // Modo demo: simula sucesso
                return { id: Date.now().toString(), ...appointment, status: 'scheduled', created_at: new Date().toISOString() };
            }

            const { data, error } = await supabase
                .from('appointments')
                .insert(appointment)
                .select()
                .single();

            if (error) {
                // Tratamento de erro de concorrência
                if (error.code === '23505') {
                    throw new Error('Este horário acabou de ser reservado. Por favor, escolha outro.');
                }
                throw error;
            }
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
}

export function useCancelAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (appointmentId: string) => {
            if (!isSupabaseConfigured) {
                return; // Modo demo
            }

            const { error } = await supabase
                .from('appointments')
                .update({ status: 'canceled' })
                .eq('id', appointmentId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
}

export function useCompleteAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (appointmentId: string) => {
            if (!isSupabaseConfigured) {
                return; // Modo demo
            }

            const { error } = await supabase
                .from('appointments')
                .update({ status: 'completed' })
                .eq('id', appointmentId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
}
