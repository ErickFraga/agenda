-- ============================================
-- Sistema de Agendamento Barbearia
-- Migrações SQL para Supabase
-- ============================================

-- Habilitar extensão UUID (normalmente já está habilitada no Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Barbeiros
CREATE TABLE barbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  work_start_time TIME NOT NULL DEFAULT '09:00',
  work_end_time TIME NOT NULL DEFAULT '18:00',
  work_days INTEGER[] DEFAULT '{1,2,3,4,5,6}', -- 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Agendamentos
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barber_id UUID REFERENCES barbers(id) NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'canceled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_appointments_date_barber ON appointments(appointment_date, barber_id);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Constraint única para evitar agendamentos duplicados (mesma data/hora/barbeiro)
CREATE UNIQUE INDEX idx_unique_appointment 
ON appointments(barber_id, appointment_date, appointment_time) 
WHERE status = 'scheduled';

-- ============================================
-- Dados de exemplo (opcional)
-- ============================================

-- Inserir barbeiros de exemplo
INSERT INTO barbers (name, work_start_time, work_end_time, work_days) VALUES
  ('João Silva', '09:00', '18:00', '{1,2,3,4,5,6}'),
  ('Carlos Santos', '10:00', '19:00', '{1,2,3,4,5}'),
  ('Miguel Oliveira', '08:00', '17:00', '{2,3,4,5,6}');

-- ============================================
-- Políticas RLS (Row Level Security)
-- ============================================

-- Habilitar RLS
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ver barbeiros
CREATE POLICY "Barbeiros são públicos" ON barbers
  FOR SELECT USING (true);

-- Política: Todos podem visualizar agendamentos
CREATE POLICY "Agendamentos são públicos" ON appointments
  FOR SELECT USING (true);

-- Política: Todos podem criar agendamentos
CREATE POLICY "Qualquer um pode criar agendamento" ON appointments
  FOR INSERT WITH CHECK (true);

-- Política: Todos podem atualizar status de agendamentos
CREATE POLICY "Qualquer um pode atualizar agendamento" ON appointments
  FOR UPDATE USING (true);
