-- Ejecutar en Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard → tu proyecto → SQL Editor → New query

CREATE TABLE compras (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  curso_filename text NOT NULL,
  fecha_compra timestamp DEFAULT now(),
  mp_payment_id text UNIQUE  -- UNIQUE previene duplicados si webhook y process-payment corren juntos
);

-- Índice para búsquedas rápidas por email
CREATE INDEX idx_compras_email ON compras(email);
CREATE INDEX idx_compras_email_filename ON compras(email, curso_filename);
