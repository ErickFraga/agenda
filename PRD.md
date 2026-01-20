# PRD: Sistema de Agendamento Barbearia (MVP)

## 1. Visão Geral do Projeto

Desenvolvimento de uma Single Page Application (SPA) estática para agendamento de serviços de barbearia. O sistema deve permitir que clientes agendem horários baseados na disponibilidade real dos barbeiros e que administradores gerenciem a grade de horários.

**Objetivo:** Deployment estático (Vercel/Hostinger) com banco de dados desacoplado (BaaS).

## 2. Tech Stack & Ferramentas

* **Frontend:** React (Vite) + TypeScript.
* **Estilização:** TailwindCSS + Shadcn/UI (para componentes rápidos como Calendar, Modal, Inputs).
* **State Management/Data Fetching:** TanStack Query (React Query) v5.
* **Backend/Database:** Supabase (PostgreSQL).
* **Date Handling:** `date-fns` (Estritamente).
* **Icons:** Lucide-React.

## 3. Glossário de Entidades

### 3.1. Barbers (Barbeiros)

Profissionais que atendem na barbearia.

* Devem possuir horário de início e fim de expediente.
* Devem possuir dias da semana em que trabalham.

### 3.2. Appointments (Agendamentos)

O registro de um serviço marcado.

* Pertence a um `Barber`.
* Possui dados do cliente (Nome/Telefone).
* Estados possíveis: `scheduled` (agendado), `canceled` (cancelado), `completed` (concluído).

## 4. Banco de Dados (Schema Sugerido para Supabase)

A IA deve gerar as migrações SQL baseadas nesta estrutura:

```sql
-- Tabela de Barbeiros
CREATE TABLE barbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  work_start_time TIME NOT NULL DEFAULT '09:00', -- Ex: 09:00:00
  work_end_time TIME NOT NULL DEFAULT '18:00',   -- Ex: 18:00:00
  work_days INTEGER[] DEFAULT '{1,2,3,4,5,6}',   -- 0=Dom, 1=Seg...
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Agendamentos
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barber_id UUID REFERENCES barbers(id) NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL, -- Usar apenas números para facilitar integração com API Whatsapp futuro
  appointment_date DATE NOT NULL, -- Ex: 2024-02-20
  appointment_time TIME NOT NULL, -- Ex: 14:30:00
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'canceled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes para performance
CREATE INDEX idx_appointments_date_barber ON appointments(appointment_date, barber_id);

```

## 5. Requisitos Funcionais (Features)

### 5.1. Dashboard do Cliente (Fluxo de Agendamento)

1. **Seleção de Barbeiro:** Listar todos os barbeiros ativos.
2. **Seleção de Data:** Datepicker que permite selecionar apenas datas futuras e dentro dos `work_days` do barbeiro selecionado.
3. **Seleção de Horário (Slot Generator):**
* **Input:** Data selecionada + ID do Barbeiro.
* **Lógica:**
* Gerar slots de tempo (ex: intervalo de 45min) entre `work_start_time` e `work_end_time`.
* Buscar `appointments` existentes para a data/barbeiro com status `scheduled`.
* **Filtragem:** Remover slots que colidem com agendamentos existentes.


* **Output:** Grid de horários disponíveis.


4. **Confirmação:** Form simples pedindo Nome e Telefone. Salvar no Supabase.

### 5.2. Gestão de Agendamento (Remarcar/Cancelar)

1. **Cancelar:**
* Ação que altera o `status` do agendamento para `canceled`.
* Libera imediatamente o slot para novos agendamentos (pois a lógica de 5.1 filtra apenas `scheduled`).


2. **Remarcar:**
* O fluxo deve ser atômico na visão do usuário, mas técnico no backend:
1. Executar ação de **Cancelar** no agendamento antigo.
2. Executar fluxo de **Criar Novo** agendamento com os novos dados.





### 5.3. Dashboard Administrativo (Visão Estática)

1. Calendário ou Lista mostrando os agendamentos do dia.
2. Botão para o barbeiro bloquear um horário manualmente (cria um appointment com nome "Bloqueio" ou "Almoço").

## 6. Regras de Negócio e Constraints

1. **Concorrência:** O frontend deve lidar com erros de inserção caso dois clientes tentem pegar o mesmo horário no mesmo milissegundo (banco retorna erro, frontend pede para escolher outro).
2. **Timezones:** O sistema deve assumir que a barbearia é local. Armazenar datas/horas sem timezone (local time) ou forçar UTC-3 no client-side para evitar confusão. Sugestão: Tratar tudo como string `YYYY-MM-DD` e `HH:mm` para simplificar MVP.
3. **Validação:** Não permitir agendamentos no passado.

## 7. Diretrizes de UI/UX (para a IA gerar)

* **Mobile First:** O layout deve ser pensado para telas verticais (celular).
* **Loading States:** Usar Skeletons enquanto carrega os horários do Supabase.
* **Feedback:** Usar "Toasts" (Sonner) para sucesso/erro.