import { User } from "@/types/user";
import { supabase } from "@/models/db";

// 修改insertUser为Supabase实现
export async function insertUser(user: User) {
  const createdAt = new Date().toISOString();
  
  const client = await supabase();
  const { data, error } = await client
    .from('users')
    .insert([{
      email: user.email,
      nickname: user.nickname,
      avatar_url: user.avatar_url,
      created_at: createdAt
    }]);

  if (error) throw error;
  return data;
}

// 重构findUserByEmail使用Supabase查询
export async function findUserByEmail(email: string): Promise<User | undefined> {
  const client = await supabase();
  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('email', email)
    .limit(1);

  if (error || !data?.length) return undefined;
  return formatUser(data[0]);
}

// 新增Supabase数据格式化函数
function formatUser(row: any): User {
  return {
    email: row.email,
    nickname: row.nickname,
    avatar_url: row.avatar_url,
    created_at: row.created_at
  };
}
