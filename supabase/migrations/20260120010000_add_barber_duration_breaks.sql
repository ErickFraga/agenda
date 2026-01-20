-- ============================================
-- Adicionar campos de duração e pausas aos barbeiros
-- ============================================

-- Adicionar coluna de duração do atendimento (em minutos)
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS slot_duration INTEGER DEFAULT 45;

-- Adicionar coluna de pausas (array de objetos JSON com start e end)
-- Formato: [{"start": "12:00", "end": "14:00"}]
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS breaks JSONB DEFAULT '[]'::jsonb;

-- Atualizar barbeiros existentes com valores padrão
UPDATE barbers SET slot_duration = 45, breaks = '[]'::jsonb WHERE slot_duration IS NULL;
