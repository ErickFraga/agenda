-- ============================================
-- Sistema de Agendamento Barbearia
-- Migration: Initial Schema
-- ============================================

-- Tabela de Barbeiros
CREATE TABLE IF NOT EXISTS barbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  work_start_time TIME NOT NULL DEFAULT '09:00',
  work_end_time TIME NOT NULL DEFAULT '18:00',
  work_days INTEGER[] DEFAULT '{1,2,3,4,5,6}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS appointments (
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
CREATE INDEX IF NOT EXISTS idx_appointments_date_barber ON appointments(appointment_date, barber_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Constraint única para evitar agendamentos duplicados
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_appointment 
ON appointments(barber_id, appointment_date, appointment_time) 
WHERE status = 'scheduled';

-- Habilitar RLS
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para barbeiros
DROP POLICY IF EXISTS "Barbeiros são públicos" ON barbers;
CREATE POLICY "Barbeiros são públicos" ON barbers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir inserir barbeiros" ON barbers;
CREATE POLICY "Permitir inserir barbeiros" ON barbers
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualizar barbeiros" ON barbers;
CREATE POLICY "Permitir atualizar barbeiros" ON barbers
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir deletar barbeiros" ON barbers;
CREATE POLICY "Permitir deletar barbeiros" ON barbers
  FOR DELETE USING (true);

-- Políticas RLS para agendamentos
DROP POLICY IF EXISTS "Agendamentos são públicos" ON appointments;
CREATE POLICY "Agendamentos são públicos" ON appointments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Qualquer um pode criar agendamento" ON appointments;
CREATE POLICY "Qualquer um pode criar agendamento" ON appointments
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Qualquer um pode atualizar agendamento" ON appointments;
CREATE POLICY "Qualquer um pode atualizar agendamento" ON appointments
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Qualquer um pode deletar agendamento" ON appointments;
CREATE POLICY "Qualquer um pode deletar agendamento" ON appointments
  FOR DELETE USING (true);
