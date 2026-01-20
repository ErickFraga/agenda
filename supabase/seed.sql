-- ============================================
-- Dados de exemplo (Seed)
-- ============================================

-- Inserir barbeiros de exemplo
INSERT INTO barbers (name, work_start_time, work_end_time, work_days) VALUES
  ('João Silva', '09:00', '18:00', '{1,2,3,4,5,6}'),
  ('Carlos Santos', '10:00', '19:00', '{1,2,3,4,5}'),
  ('Miguel Oliveira', '08:00', '17:00', '{2,3,4,5,6}')
ON CONFLICT DO NOTHING;
