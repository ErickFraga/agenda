import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Barber, Appointment, CreateBarber, UpdateBarber, CreateAppointment } from '@/types/database';

// Mock data para modo demo
const MOCK_BARBERS: Barber[] = [
    { id: '1', name: 'João Silva', avatar_url: null, work_start_time: '09:00', work_end_time: '18:00', work_days: [1, 2, 3, 4, 5, 6], slot_duration: 45, breaks: [{ start: '12:00', end: '13:00' }], created_at: new Date().toISOString() },
    { id: '2', name: 'Carlos Santos', avatar_url: null, work_start_time: '10:00', work_end_time: '19:00', work_days: [1, 2, 3, 4, 5], slot_duration: 45, breaks: [], created_at: new Date().toISOString() },
    { id: '3', name: 'Miguel Oliveira', avatar_url: null, work_start_time: '08:00', work_end_time: '17:00', work_days: [2, 3, 4, 5, 6], slot_duration: 60, breaks: [{ start: '12:00', end: '14:00' }], created_at: new Date().toISOString() },
];

let mockAppointments: Appointment[] = [
    { id: '1', barber_id: '1', client_name: 'Pedro Almeida', client_phone: '11999998888', appointment_date: new Date().toISOString().split('T')[0], appointment_time: '10:00', status: 'scheduled', created_at: new Date().toISOString() },
    { id: '2', barber_id: '1', client_name: 'José Costa', client_phone: '11999997777', appointment_date: new Date().toISOString().split('T')[0], appointment_time: '14:30', status: 'scheduled', created_at: new Date().toISOString() },
];

// ============= BARBERS =============

export function useBarbers() {
    return useQuery({
        queryKey: ['barbers'],
        queryFn: async (): Promise<Barber[]> => {
            if (!isSupabaseConfigured) return MOCK_BARBERS;
            const { data, error } = await supabase.from('barbers').select('*').order('name');
            if (error) throw error;
            return data || [];
        },
    });
}

export function useCreateBarber() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (barber: CreateBarber) => {
            if (!isSupabaseConfigured) {
                const newBarber: Barber = {
                    id: Date.now().toString(),
                    ...barber,
                    avatar_url: barber.avatar_url ?? null,
                    slot_duration: barber.slot_duration ?? 45,
                    breaks: barber.breaks ?? [],
                    created_at: new Date().toISOString()
                };
                MOCK_BARBERS.push(newBarber);
                return newBarber;
            }
            const { data, error } = await supabase.from('barbers').insert(barber).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['barbers'] }),
    });
}

export function useUpdateBarber() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: UpdateBarber) => {
            if (!isSupabaseConfigured) {
                const idx = MOCK_BARBERS.findIndex(b => b.id === id);
                if (idx >= 0) Object.assign(MOCK_BARBERS[idx], updates);
                return MOCK_BARBERS[idx];
            }
            const { data, error } = await supabase.from('barbers').update(updates).eq('id', id).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['barbers'] }),
    });
}

export function useDeleteBarber() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            if (!isSupabaseConfigured) {
                const idx = MOCK_BARBERS.findIndex(b => b.id === id);
                if (idx >= 0) MOCK_BARBERS.splice(idx, 1);
                return;
            }
            const { error } = await supabase.from('barbers').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['barbers'] }),
    });
}

// ============= APPOINTMENTS =============

export function useAppointments(date?: string) {
    return useQuery({
        queryKey: ['appointments', date],
        queryFn: async (): Promise<Appointment[]> => {
            if (!isSupabaseConfigured) {
                let result = mockAppointments;
                if (date) result = result.filter(a => a.appointment_date === date);
                return result.map(a => ({ ...a, barber: MOCK_BARBERS.find(b => b.id === a.barber_id) }));
            }
            let query = supabase.from('appointments').select('*, barber:barbers(*)').order('appointment_date', { ascending: false }).order('appointment_time');
            if (date) query = query.eq('appointment_date', date);
            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
    });
}

export function useCreateAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (apt: CreateAppointment) => {
            if (!isSupabaseConfigured) {
                const newApt: Appointment = { id: Date.now().toString(), ...apt, status: 'scheduled', created_at: new Date().toISOString() };
                mockAppointments.push(newApt);
                return newApt;
            }
            const { data, error } = await supabase.from('appointments').insert(apt).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
    });
}

export function useUpdateAppointmentStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            if (!isSupabaseConfigured) {
                const apt = mockAppointments.find(a => a.id === id);
                if (apt) apt.status = status as Appointment['status'];
                return apt;
            }
            const { data, error } = await supabase.from('appointments').update({ status }).eq('id', id).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
    });
}

export function useDeleteAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            if (!isSupabaseConfigured) {
                mockAppointments = mockAppointments.filter(a => a.id !== id);
                return;
            }
            const { error } = await supabase.from('appointments').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
    });
}
