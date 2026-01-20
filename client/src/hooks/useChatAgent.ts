import { useState, useCallback, useEffect } from 'react';
import { useBarbers, useCreateAppointment, useAppointmentsByDateAndBarber } from '@/hooks/useApi';
import { generateTimeSlots, formatDateForDB, isWorkDay } from '@/lib/date-utils';
import type { Message } from '@/components/chat/ChatComponents';
import type { Barber } from '@/types/database';
import { parse, addDays, nextDay } from 'date-fns';

type ChatState =
    | 'GREETING'
    | 'SELECT_BARBER'
    | 'SELECT_DATE'
    | 'SELECT_TIME'
    | 'GET_NAME'
    | 'GET_PHONE'
    | 'CONFIRM'
    | 'SAVING'
    | 'SUCCESS'
    | 'ERROR';

interface ChatContext {
    barberId?: string;
    date?: Date;
    time?: string;
    customerName?: string;
    customerPhone?: string;
}

export function useChatAgent() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [state, setState] = useState<ChatState>('GREETING');
    const [context, setContext] = useState<ChatContext>({});

    const { data: barbers = [] } = useBarbers();
    const createAppointment = useCreateAppointment();

    // Fetch appointment data when context has barber and date
    // Note: We can't conditionally call hooks, so we always call it but ignore if params missing
    const dateString = context.date ? formatDateForDB(context.date) : null;
    const { data: existingAppointments = [] } = useAppointmentsByDateAndBarber(
        dateString,
        context.barberId || null
    );

    const addMessage = useCallback((role: 'user' | 'assistant', content: string, options?: string[]) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            role,
            content,
            timestamp: new Date(),
            options
        };
        setMessages(prev => [...prev, newMessage]);
    }, []);

    const processUserInput = async (input: string) => {
        // Add user message
        addMessage('user', input);
        setIsTyping(true);

        // Simulate thinking time
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            switch (state) {
                case 'GREETING':
                    handleGreeting(input);
                    break;
                case 'SELECT_BARBER':
                    handleBarberSelection(input);
                    break;
                case 'SELECT_DATE':
                    handleDateSelection(input);
                    break;
                case 'SELECT_TIME':
                    handleTimeSelection(input);
                    break;
                case 'GET_NAME':
                    handleNameInput(input);
                    break;
                case 'GET_PHONE':
                    handlePhoneInput(input);
                    break;
                case 'CONFIRM':
                    handleConfirmation(input);
                    break;
                case 'SUCCESS':
                    // Reset or new appointment
                    restartChat();
                    break;
                default:
                    addMessage('assistant', "Desculpe, me perdi. Vamos começar de novo?");
                    setState('GREETING');
            }
        } catch (error) {
            console.error(error);
            addMessage('assistant', "Tive um problema técnico. Tente novamente.");
        } finally {
            setIsTyping(false);
        }
    };

    // --- Handlers ---

    const handleGreeting = (input: string) => {
        if (input.toLowerCase().includes('agendar') || input.toLowerCase().includes('marcar') || input.toLowerCase().includes('corte')) {
            if (barbers.length === 0) {
                addMessage('assistant', "Desculpe, não encontrei barbeiros disponíveis no momento.");
                return;
            }

            const options = barbers.map(b => b.name);
            addMessage('assistant', "Claro! Com qual barbeiro você gostaria de cortar?", options);
            setState('SELECT_BARBER');
        } else {
            addMessage('assistant', "Olá! Sou a IA da barbearia. Posso ajudar você a agendar um horário. Digite 'agendar' para começar.");
        }
    };

    const handleBarberSelection = (input: string) => {
        // Find barber by name fuzzy match
        const selectedBarber = barbers.find(b =>
            input.toLowerCase().includes(b.name.toLowerCase()) ||
            b.name.toLowerCase().includes(input.toLowerCase())
        );

        if (selectedBarber) {
            setContext(prev => ({ ...prev, barberId: selectedBarber.id }));
            addMessage('assistant', `Ótima escolha! O ${selectedBarber.name} é excelente. Para quando você gostaria? (Ex: Hoje, Amanhã, Segunda)`);
            setState('SELECT_DATE');
        } else {
            const options = barbers.map(b => b.name);
            addMessage('assistant', "Não encontrei esse barbeiro. Por favor escolha um da lista:", options);
        }
    };

    const handleDateSelection = (input: string) => {
        let selectedDate = new Date();
        const lowerInput = input.toLowerCase();

        if (lowerInput.includes('amanhã') || lowerInput.includes('amanha')) {
            selectedDate = addDays(new Date(), 1);
        } else if (lowerInput.includes('hoje')) {
            selectedDate = new Date();
        } else {
            // Simple parsing for weekdays
            const daysMap: Record<string, number> = { 'domingo': 0, 'segunda': 1, 'terça': 2, 'quarta': 3, 'quinta': 4, 'sexta': 5, 'sábado': 6 };
            let foundDay = -1;
            for (const [dayName, dayIdx] of Object.entries(daysMap)) {
                if (lowerInput.includes(dayName)) {
                    foundDay = dayIdx;
                    break;
                }
            }
            if (foundDay !== -1) {
                selectedDate = nextDay(new Date(), foundDay as any);
            } else {
                addMessage('assistant', "Não entendi a data. Tente 'Hoje', 'Amanhã' ou um dia da semana.");
                return;
            }
        }

        // Verify work day
        const barber = barbers.find(b => b.id === context.barberId);
        if (barber && !isWorkDay(selectedDate, barber.work_days)) {
            addMessage('assistant', "Infelizmente o barbeiro não trabalha nesse dia. Tente outra data.");
            return;
        }

        setContext(prev => ({ ...prev, date: selectedDate }));

        // We need to wait for react query to update existingAppointments in the next render cycle 
        // OR we just Optimistically ask for time. 
        // But generateTimeSlots needs the appointments.
        // A tricky part of local state machine hooks. 
        // We'll set state to SELECT_TIME and trigger the slot calculation in a useEffect when dependencies change
        setState('SELECT_TIME');
    };

    const handleTimeSelection = (input: string) => {
        // Simple regex to find time like 14:00 or 14h
        const timeMatch = input.match(/(\d{1,2})[:h]?(\d{2})?/);
        if (timeMatch) {
            let hour = timeMatch[1].padStart(2, '0');
            let minute = timeMatch[2]?.padStart(2, '0') || '00';
            const timeStr = `${hour}:${minute}`;

            // TODO: Validate if time is in valid slots list
            setContext(prev => ({ ...prev, time: timeStr }));
            addMessage('assistant', "Perfeito! Qual o seu nome completo?");
            setState('GET_NAME');
        } else {
            addMessage('assistant', "Não entendi o horário. Por favor use o formato HH:mm (ex: 14:30)");
        }
    };

    const handleNameInput = (input: string) => {
        setContext(prev => ({ ...prev, customerName: input }));
        addMessage('assistant', "E qual seu telefone para contato? (apenas números)");
        setState('GET_PHONE');
    };

    const handlePhoneInput = (input: string) => {
        const cleanPhone = input.replace(/\D/g, '');
        if (cleanPhone.length < 8) {
            addMessage('assistant', "O telefone parece inválido. Digite novamente.");
            return;
        }
        setContext(prev => ({ ...prev, customerPhone: cleanPhone }));

        // Summary
        const barber = barbers.find(b => b.id === context.barberId);
        const dateStr = context.date?.toLocaleDateString('pt-BR');

        addMessage('assistant',
            `Confirma o agendamento?\n\n📅 ${dateStr}\n⏰ ${context.time}\n💈 ${barber?.name}\n👤 ${context.customerName}`,
            ['Sim, confirmar', 'Cancelar']
        );
        setState('CONFIRM');
    };

    const handleConfirmation = async (input: string) => {
        if (input.toLowerCase().includes('sim') || input.toLowerCase().includes('confirmar')) {
            setIsTyping(true);
            try {
                if (!context.barberId || !context.date || !context.time || !context.customerName || !context.customerPhone) {
                    throw new Error("Dados incompletos");
                }

                await createAppointment.mutateAsync({
                    barber_id: context.barberId,
                    appointment_date: formatDateForDB(context.date),
                    appointment_time: context.time,
                    client_name: context.customerName,
                    client_phone: context.customerPhone
                });

                setState('SUCCESS');
                addMessage('assistant', "Agendamento confirmado com sucesso! 🎉 Te esperamos lá.");
                addMessage('assistant', "Gostaria de realizar outro agendamento?", ['Novo Agendamento']);
            } catch (err: any) {
                addMessage('assistant', "Erro ao salvar agendamento: " + err?.message);
                setState('GREETING');
            }
        } else {
            addMessage('assistant', "Agendamento cancelado. Podemos começar de novo quando quiser.");
            restartChat();
        }
    };

    const restartChat = () => {
        setContext({});
        setState('GREETING');
        // Optional: clear messages? 
        // setMessages([]); 
        addMessage('assistant', "Como posso ajudar agora?", ['Agendar Corte']);
    };

    // Effect to present time slots once we have date and barber
    useEffect(() => {
        if (state === 'SELECT_TIME' && context.barberId && context.date && existingAppointments) {
            const barber = barbers.find(b => b.id === context.barberId);
            if (!barber) return;

            const slots = generateTimeSlots(
                barber.work_start_time,
                barber.work_end_time,
                existingAppointments,
                context.date,
                barber.slot_duration || 45,
                barber.breaks || []
            );

            const availableSlots = slots.filter(s => s.available).slice(0, 8).map(s => s.time);

            if (availableSlots.length === 0) {
                addMessage('assistant', "Poxa, não tenho horários livres para esse dia. Tente outra data.");
                setState('SELECT_DATE');
                return;
            }

            // Check if we already sent the time prompt to avoid loop (simple check: last msg role)
            setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg && lastMsg.role === 'assistant' && lastMsg.content.includes('horários livres')) return prev;

                return [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: "Tenho estes horários livres:",
                        timestamp: new Date(),
                        options: availableSlots
                    }
                ];
            });
        }
    }, [state, context.date, context.barberId, existingAppointments, barbers]);

    // Initial greeting
    useEffect(() => {
        if (messages.length === 0) {
            addMessage('assistant', "Olá! Bem-vindo à barbearia. Sou seu assistente virtual. Gostaria de agendar um horário?", ['Sim, agendar']);
        }
    }, []);

    return {
        messages,
        isTyping,
        processUserInput,
        restartChat
    };
}
