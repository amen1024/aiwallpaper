// 移除pg相关导入
import { Wallpaper } from "@/types/wallpaper";
import { supabase } from "./db";

// 修改insertWallpaper函数
export async function insertWallpaper(wallpaper: Wallpaper) {
  const client = await supabase();
  const { data, error } = await client
    .from('wallpapers')
    .insert([{
      user_email: wallpaper.user_email,
      img_description: wallpaper.img_description,
      img_size: wallpaper.img_size,
      img_url: wallpaper.img_url,
      llm_name: wallpaper.llm_name,
      llm_params: wallpaper.llm_params,
      created_at: wallpaper.created_at
    }]);

  if (error) throw error;
  return data;
}

// 重构getWallpapersCount函数
export async function getWallpapersCount(): Promise<number> {
  const client = await supabase();
  const { count, error } = await client
    .from('wallpapers')
    .select('*', { count: 'exact' });

  if (error) return 0;
  return count || 0;
}

// 重构getUserWallpapersCount函数
export async function getUserWallpapersCount(user_email: string): Promise<number> {
  const client = await supabase();
  const { count, error } = await client
    .from('wallpapers')
    .select('*', { count: 'exact' })
    .eq('user_email', user_email);

  if (error) return 0;
  return count || 0;
}

// 重构getWallpapers函数
export async function getWallpapers(page: number, limit: number): Promise<Wallpaper[] | undefined> {
  const offset = (Math.max(1, page) - 1) * Math.max(1, limit);
  
  console.log('Executing query with params:', { 
    page, 
    limit, 
    offset,
    rangeStart: offset,
    rangeEnd: offset + limit - 1
  });

  const client = await supabase();
  const { data, error } = await client
    .from('wallpapers')
    .select(`
      *,
      users!inner(email, nickname, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Supabase query error:', error);
    return undefined;
  }

  console.log('Query result count:', data?.length);
  return data?.map(formatWallpaper);
}

// 重构数据格式化函数
function formatWallpaper(row: any): Wallpaper {
  const wallpaper: Wallpaper = {
    id: row.id,
    user_email: row.user_email,
    img_description: row.img_description,
    img_size: row.img_size,
    img_url: row.img_url,
    llm_name: row.llm_name,
    llm_params: row.llm_params,
    created_at: row.created_at,
  };

  if (row.users) {
    wallpaper.created_user = {
      email: row.users.email,
      nickname: row.users.nickname,
      avatar_url: row.users.avatar_url
    };
  }

  return wallpaper;
}
