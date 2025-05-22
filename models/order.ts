import { Order } from "@/types/order";
// 移除pg相关导入
// import { QueryResultRow } from "pg";
import { supabase } from "@/models/db";

// 修改insertOrder函数
export async function insertOrder(order: Order) {
  const client = await supabase();
  const { data, error } = await client
    .from('orders')
    .insert([{
      order_no: order.order_no,
      created_at: order.created_at,
      user_email: order.user_email,
      amount: order.amount,
      plan: order.plan,
      expired_at: order.expired_at,
      order_status: order.order_status,
      credits: order.credits
    }]);

  if (error) throw error;
  return data;
}

// 修改findOrderByOrderNo函数
export async function findOrderByOrderNo(order_no: number) {
  const client = await supabase();
  const { data, error } = await client
    .from('orders')
    .select('*')
    .eq('order_no', order_no)
    .limit(1);

  if (error || !data?.length) return undefined;
  return formatOrder(data[0]);
}

// 修改updateOrderStatus函数
export async function updateOrderStatus(order_no: string, order_status: number, paied_at: string) {
  const client = await supabase();
  const { data, error } = await client
    .from('orders')
    .update({ 
      order_status,
      paied_at 
    })
    .eq('order_no', order_no);

  if (error) throw error;
  return data;
}



export async function updateOrderSession(
  order_no: string,
  stripe_session_id: string
) {
  const client = await supabase();
  const { data, error } = await client
    .from('orders')
    .update({ stripe_session_id })
    .eq('order_no', order_no);

  if (error) throw error;
  return data;
}


export async function getUserOrders(user_email: string): Promise<Order[] | undefined> {
  const now = new Date().toISOString();
  const client = await supabase();
  const { data, error } = await client
    .from('orders')
    .select(`
      *,
      users!inner(email, nickname, avatar_url)
    `)
    .eq('user_email', user_email)
    .eq('order_status', 2)
    .gte('expired_at', now);

  if (error || !data) return undefined;
  return data.map(formatOrder);
}

// function formatOrder(row: QueryResultRow): Order {
//   const order: Order = {
//     order_no: row.order_no,
//     created_at: row.created_at,
//     user_email: row.user_email,
//     amount: row.amount,
//     plan: row.plan,
//     expired_at: row.expired_at,
//     order_status: row.order_status,
//     paied_at: row.paied_at,
//     stripe_session_id: row.stripe_session_id,
//     credits: row.credits,
//   };

//   return order;
// }



// 修改formatOrder函数（适配Supabase字段命名）
function formatOrder(row: any): Order {
  return {
    order_no: row.order_no,
    created_at: row.created_at,
    user_email: row.user_email,
    amount: row.amount,
    plan: row.plan,
    expired_at: row.expired_at,
    order_status: row.order_status,
    paied_at: row.paied_at,
    stripe_session_id: row.stripe_session_id,
    credits: row.credits,
  };
}