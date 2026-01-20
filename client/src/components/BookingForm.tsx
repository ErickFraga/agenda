import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { maskPhone, formatPhone } from '@/lib/date-utils';
import { Loader2 } from 'lucide-react';

interface BookingFormProps {
    onSubmit: (data: { client_name: string; client_phone: string }) => void;
    isLoading?: boolean;
}

export function BookingForm({ onSubmit, isLoading }: BookingFormProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPhone(maskPhone(value));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) return;

        onSubmit({
            client_name: name.trim(),
            client_phone: formatPhone(phone),
        });
    };

    const isValid = name.trim().length >= 2 && formatPhone(phone).length >= 10;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                    Seu nome
                </label>
                <Input
                    id="name"
                    placeholder="Digite seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    required
                    minLength={2}
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                    Telefone (WhatsApp)
                </label>
                <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={handlePhoneChange}
                    disabled={isLoading}
                    required
                    maxLength={15}
                />
            </div>

            <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!isValid || isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Agendando...
                    </>
                ) : (
                    'Confirmar Agendamento'
                )}
            </Button>
        </form>
    );
}
