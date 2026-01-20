import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBarbers, useCreateBarber, useUpdateBarber, useDeleteBarber } from '@/hooks/useApi';
import type { Barber, CreateBarber } from '@/types/database';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function BarbersPage() {
    const { data: barbers = [], isLoading } = useBarbers();
    const createBarber = useCreateBarber();
    const updateBarber = useUpdateBarber();
    const deleteBarber = useDeleteBarber();

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<CreateBarber>({
        name: '',
        work_start_time: '09:00',
        work_end_time: '18:00',
        work_days: [1, 2, 3, 4, 5, 6],
    });

    const resetForm = () => {
        setForm({ name: '', work_start_time: '09:00', work_end_time: '18:00', work_days: [1, 2, 3, 4, 5, 6] });
        setIsAdding(false);
        setEditingId(null);
    };

    const handleCreate = async () => {
        if (!form.name.trim()) return toast.error('Nome é obrigatório');
        try {
            await createBarber.mutateAsync(form);
            toast.success('Barbeiro criado');
            resetForm();
        } catch { toast.error('Erro ao criar'); }
    };

    const handleUpdate = async () => {
        if (!editingId || !form.name.trim()) return;
        try {
            await updateBarber.mutateAsync({ id: editingId, ...form });
            toast.success('Barbeiro atualizado');
            resetForm();
        } catch { toast.error('Erro ao atualizar'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remover barbeiro?')) return;
        try {
            await deleteBarber.mutateAsync(id);
            toast.success('Barbeiro removido');
        } catch { toast.error('Erro ao remover'); }
    };

    const startEdit = (barber: Barber) => {
        setEditingId(barber.id);
        setForm({ name: barber.name, work_start_time: barber.work_start_time, work_end_time: barber.work_end_time, work_days: barber.work_days });
    };

    const toggleDay = (day: number) => {
        setForm(f => ({
            ...f,
            work_days: f.work_days.includes(day) ? f.work_days.filter(d => d !== day) : [...f.work_days, day].sort(),
        }));
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Barbeiros</h1>
                    <p className="text-muted-foreground">Gerencie os profissionais</p>
                </div>
                <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
                    <Plus className="w-4 h-4" /> Adicionar
                </Button>
            </div>

            {(isAdding || editingId) && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>{editingId ? 'Editar Barbeiro' : 'Novo Barbeiro'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Nome</label>
                            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome do barbeiro" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Início</label>
                                <Input type="time" value={form.work_start_time} onChange={e => setForm(f => ({ ...f, work_start_time: e.target.value }))} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Fim</label>
                                <Input type="time" value={form.work_end_time} onChange={e => setForm(f => ({ ...f, work_end_time: e.target.value }))} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Dias de Trabalho</label>
                            <div className="flex gap-2">
                                {WEEKDAYS.map((day, i) => (
                                    <button
                                        key={i}
                                        onClick={() => toggleDay(i)}
                                        className={`w-10 h-10 rounded-lg text-xs font-medium transition-colors ${form.work_days.includes(i) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button onClick={editingId ? handleUpdate : handleCreate} disabled={createBarber.isPending || updateBarber.isPending}>
                                {(createBarber.isPending || updateBarber.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Salvar
                            </Button>
                            <Button variant="outline" onClick={resetForm}>
                                <X className="w-4 h-4" /> Cancelar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isLoading ? (
                <p className="text-muted-foreground">Carregando...</p>
            ) : barbers.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">Nenhum barbeiro cadastrado.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {barbers.map(barber => (
                        <Card key={barber.id}>
                            <CardContent className="py-4 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">{barber.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {barber.work_start_time} - {barber.work_end_time} · {barber.work_days.map(d => WEEKDAYS[d]).join(', ')}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => startEdit(barber)}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(barber.id)} className="text-destructive">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
