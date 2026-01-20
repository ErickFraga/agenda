import { useState, useRef, useEffect } from 'react';
import { Send, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [message, setMessage] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSend(message);
            setMessage('');
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 p-2 bg-background/80 backdrop-blur-sm border-t"
        >
            <Input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 rounded-full pl-4"
                disabled={disabled}
            />
            <Button
                type="submit"
                size="icon"
                className="rounded-full flex-shrink-0"
                disabled={!message.trim() || disabled}
            >
                {message.trim() ? <Send className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
        </form>
    );
}
