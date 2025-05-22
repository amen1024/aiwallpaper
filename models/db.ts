import { createClient } from '@/models/supabase/server'
import { cookies } from 'next/headers'

/**
 * 获取Supabase客户端实例（异步）
 */
export const supabase = async () => {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}
