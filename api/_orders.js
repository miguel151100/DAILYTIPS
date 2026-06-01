const { getSupabase } = require("./_supabase");
const crypto = require("crypto");

function generateOrderRef(packId) {
  const safe = String(packId || "order").replace(/[^a-z0-9]/gi, "").substring(0, 12);
  return `${safe}-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
}

function generateAccessToken() {
  return crypto.randomBytes(28).toString("hex");
}

async function createOrder({ orderRef, email, name, packId, categoryId, courseFilename, productTitle, amount, mpPreferenceId }) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("orders")
    .insert([{
      order_ref: orderRef,
      email: email.toLowerCase().trim(),
      name: name || null,
      pack_id: packId,
      category_id: categoryId || null,
      curso_filename: courseFilename || null,
      product_title: productTitle,
      amount,
      status: "pending",
      mp_preference_id: mpPreferenceId || null
    }])
    .select("id, order_ref")
    .single();
  if (error) throw error;
  return data;
}

async function approveOrder({ orderRef, mpPaymentId, accessToken }) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "approved",
      mp_payment_id: String(mpPaymentId),
      access_token: accessToken,
      fecha_pago: new Date().toISOString()
    })
    .eq("order_ref", orderRef)
    .neq("status", "approved")
    .select("*")
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

async function approveOrderByPaymentId({ mpPaymentId, orderRef, accessToken }) {
  const supabase = getSupabase();
  let query = supabase
    .from("orders")
    .update({
      status: "approved",
      mp_payment_id: String(mpPaymentId),
      access_token: accessToken,
      fecha_pago: new Date().toISOString()
    });

  if (orderRef) {
    query = query.eq("order_ref", orderRef);
  } else {
    query = query.eq("mp_payment_id", String(mpPaymentId));
  }

  const { data } = await query
    .neq("status", "approved")
    .select("*")
    .single();
  return data || null;
}

async function getOrderByRef(orderRef) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("order_ref", orderRef)
    .single();
  return data || null;
}

async function getOrderByToken(token) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("access_token", token)
    .eq("status", "approved")
    .single();
  return data || null;
}

async function getOrderByEmailAndRef(email, orderRef) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .eq("order_ref", orderRef)
    .single();
  return data || null;
}

module.exports = {
  generateOrderRef,
  generateAccessToken,
  createOrder,
  approveOrder,
  approveOrderByPaymentId,
  getOrderByRef,
  getOrderByToken,
  getOrderByEmailAndRef
};
