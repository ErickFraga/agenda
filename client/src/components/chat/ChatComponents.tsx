import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User, Sparkles } from 'lucide-react';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    options?: string[]; // Opções clareáveis para o usuário
}

interface ChatMessageProps {
    message: Message;
    onOptionSelect?: (option: string) => void;
}

export function ChatMessage({ message, onOptionSelect }: ChatMessageProps) {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'flex w-full mb-4 gap-2',
                isUser ? 'justify-end' : 'justify-start'
            )}
        >
            {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <Sparkles className="w-4 h-4" />
                </div>
            )}

            <div className={cn("max-w-[80%] space-y-2")}>
                <div
                    className={cn(
                        'px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm',
                        isUser
                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                            : 'bg-muted text-foreground rounded-tl-none'
                    )}
                >
                    {message.content}
                </div>

                {/* Opções (Quick Replies) */}
                {message.options && message.options.length > 0 && !isUser && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {message.options.map((option) => (
                            <button
                                key={option}
                                onClick={() => onOptionSelect?.(option)}
                                className="bg-background border border-primary/20 hover:bg-accent text-primary text-xs px-3 py-1.5 rounded-full transition-colors"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <User className="w-4 h-4" />
                </div>
            )}
        </motion.div>
    );
}

export function TypingIndicator() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 mb-4 ml-10 p-2"
        >
            <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 bg-primary/40 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                    />
                ))}
            </div>
            <span className="text-xs text-muted-foreground ml-2">Digitando...</span>
        </motion.div>
    );
}
