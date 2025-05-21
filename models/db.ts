// import { Pool } from "pg";
import { createClient } from '@/models/supabase/server'
import { cookies } from 'next/headers'

// let globalPool: Pool;

// export function getDb() {
//   if (!globalPool) {
//     const connectionString = process.env.POSTGRES_URL;
//     console.log("connectionString", connectionString);

//     globalPool = new Pool({
//       connectionString,
//     });
//   }

//   return globalPool;
// }


export const supabase = () => { // 移除 async/await
  const cookieStore = cookies() // 同步获取 cookie 存储
  return createClient(cookieStore)
}
