import { useRef, useEffect } from 'react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChatMessage, TypingIndicator } from '@/components/chat/ChatComponents';
import { ChatInput } from '@/components/chat/ChatInput';
import { useChatAgent } from '@/hooks/useChatAgent';

export function ChatPage() {
    const { messages, isTyping, processUserInput } = useChatAgent();
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="flex items-center p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                <Link to="/">
                    <Button variant="ghost" size="icon" className="mr-2">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-semibold text-lg">Assistente Virtual</h1>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs text-muted-foreground">Online</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <ChatMessage
                        key={msg.id}
                        message={msg}
                        onOptionSelect={(opt) => processUserInput(opt)}
                    />
                ))}

                {isTyping && <TypingIndicator />}

                <div ref={bottomRef} className="h-2" />
            </main>

            {/* Input Area */}
            <div className="sticky bottom-0 w-full">
                <ChatInput
                    onSend={processUserInput}
                    disabled={isTyping}
                />
            </div>
        </div>
    );
}
