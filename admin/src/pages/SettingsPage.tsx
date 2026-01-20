import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { isSupabaseConfigured } from '@/lib/supabase';

export function SettingsPage() {
    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Configurações</h1>
                <p className="text-muted-foreground">Configure o sistema</p>
            </div>

            <div className="grid gap-6 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Status do Banco de Dados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`p-4 rounded-lg ${isSupabaseConfigured ? 'bg-success/20' : 'bg-warning/20'}`}>
                            <p className={`font-medium ${isSupabaseConfigured ? 'text-success' : 'text-warning'}`}>
                                {isSupabaseConfigured ? '✓ Supabase configurado e conectado' : '⚠ Modo Demo - Supabase não configurado'}
                            </p>
                            {!isSupabaseConfigured && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    Para conectar ao banco de dados, crie um arquivo <code className="bg-muted px-1 rounded">.env</code> com:
                                </p>
                            )}
                        </div>
                        {!isSupabaseConfigured && (
                            <pre className="mt-4 p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                                {`VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key`}
                            </pre>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Sobre</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Sistema de Agendamento para Barbearia - Painel Administrativo
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Versão 1.0.0
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
