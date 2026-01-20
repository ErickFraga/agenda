import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Loader2, Clock, Coffee } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBarbers, useCreateBarber, useUpdateBarber, useDeleteBarber } from '@/hooks/useApi';
import type { Barber, CreateBarber, BreakTime } from '@/types/database';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const DEFAULT_FORM: CreateBarber = {
    name: '',
    work_start_time: '09:00',
    work_end_time: '18:00',
    work_days: [1, 2, 3, 4, 5, 6],
    slot_duration: 45,
    breaks: [],
};

export function BarbersPage() {
    const { data: barbers = [], isLoading } = useBarbers();
    const createBarber = useCreateBarber();
    const updateBarber = useUpdateBarber();
    const deleteBarber = useDeleteBarber();

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<CreateBarber>(DEFAULT_FORM);

    const resetForm = () => {
        setForm(DEFAULT_FORM);
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
        setForm({
            name: barber.name,
            work_start_time: barber.work_start_time.slice(0, 5),
            work_end_time: barber.work_end_time.slice(0, 5),
            work_days: barber.work_days,
            slot_duration: barber.slot_duration || 45,
            breaks: barber.breaks || [],
        });
    };

    const toggleDay = (day: number) => {
        setForm(f => ({
            ...f,
            work_days: f.work_days!.includes(day) ? f.work_days!.filter(d => d !== day) : [...f.work_days!, day].sort(),
        }));
    };

    const addBreak = () => {
        setForm(f => ({
            ...f,
            breaks: [...(f.breaks || []), { start: '12:00', end: '13:00' }],
        }));
    };

    const updateBreak = (index: number, field: 'start' | 'end', value: string) => {
        setForm(f => ({
            ...f,
            breaks: f.breaks?.map((b, i) => i === index ? { ...b, [field]: value } : b) || [],
        }));
    };

    const removeBreak = (index: number) => {
        setForm(f => ({
            ...f,
            breaks: f.breaks?.filter((_, i) => i !== index) || [],
        }));
    };

    const formatBreaks = (breaks: BreakTime[] | undefined) => {
        if (!breaks || breaks.length === 0) return 'Sem pausas';
        return breaks.map(b => `${b.start.slice(0, 5)}-${b.end.slice(0, 5)}`).join(', ');
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

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium">Início</label>
                                <Input type="time" value={form.work_start_time} onChange={e => setForm(f => ({ ...f, work_start_time: e.target.value }))} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Fim</label>
                                <Input type="time" value={form.work_end_time} onChange={e => setForm(f => ({ ...f, work_end_time: e.target.value }))} />
                            </div>
                            <div>
                                <label className="text-sm font-medium flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Duração (min)
                                </label>
                                <Input
                                    type="number"
                                    min={15}
                                    max={120}
                                    step={15}
                                    value={form.slot_duration || 45}
                                    onChange={e => setForm(f => ({ ...f, slot_duration: parseInt(e.target.value) || 45 }))}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Dias de Trabalho</label>
                            <div className="flex gap-2">
                                {WEEKDAYS.map((day, i) => (
                                    <button
                                        key={i}
                                        onClick={() => toggleDay(i)}
                                        className={`w-10 h-10 rounded-lg text-xs font-medium transition-colors ${form.work_days!.includes(i) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Pausas/Intervalos */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium flex items-center gap-1">
                                    <Coffee className="w-3 h-3" /> Pausas/Intervalos
                                </label>
                                <Button variant="outline" size="sm" onClick={addBreak}>
                                    <Plus className="w-3 h-3" /> Adicionar Pausa
                                </Button>
                            </div>
                            {(form.breaks?.length || 0) > 0 ? (
                                <div className="space-y-2">
                                    {form.breaks?.map((breakItem, index) => (
                                        <div key={index} className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg">
                                            <Input
                                                type="time"
                                                value={breakItem.start}
                                                onChange={e => updateBreak(index, 'start', e.target.value)}
                                                className="w-auto"
                                            />
                                            <span className="text-muted-foreground">até</span>
                                            <Input
                                                type="time"
                                                value={breakItem.end}
                                                onChange={e => updateBreak(index, 'end', e.target.value)}
                                                className="w-auto"
                                            />
                                            <Button variant="ghost" size="icon" onClick={() => removeBreak(index)} className="text-destructive shrink-0">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">Nenhuma pausa configurada</p>
                            )}
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
                                        {barber.work_start_time.slice(0, 5)} - {barber.work_end_time.slice(0, 5)} · {barber.work_days.map(d => WEEKDAYS[d]).join(', ')}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {barber.slot_duration || 45} min</span>
                                        <span className="mx-2">·</span>
                                        <span className="inline-flex items-center gap-1"><Coffee className="w-3 h-3" /> {formatBreaks(barber.breaks)}</span>
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
