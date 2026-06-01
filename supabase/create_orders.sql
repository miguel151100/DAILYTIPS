-- Ejecutar en Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard → tu proyecto → SQL Editor → New query

CREATE TABLE IF NOT EXISTS orders (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_ref        text UNIQUE NOT NULL,
  email            text NOT NULL,
  name             text,
  pack_id          text NOT NULL,
  category_id      text,
  curso_filename   text,
  product_title    text NOT NULL,
  amount           numeric(10,2) NOT NULL,
  status           text DEFAULT 'pending'
                   CHECK (status IN ('pending','approved','rejected','error')),
  mp_payment_id    text,
  mp_preference_id text,
  access_token     text UNIQUE,
  fecha_creacion   timestamptz DEFAULT now(),
  fecha_pago       timestamptz
);

CREATE INDEX IF NOT EXISTS idx_orders_email        ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_order_ref    ON orders(order_ref);
CREATE INDEX IF NOT EXISTS idx_orders_access_token ON orders(access_token);
CREATE INDEX IF NOT EXISTS idx_orders_mp_payment   ON orders(mp_payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_status       ON orders(status);

-- compras sigue existiendo para cursos (compatibilidad con get-download-url.js)
-- La tabla orders unifica el tracking de todos los productos (packs + cursos)
