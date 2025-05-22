
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * 创建Supabase服务端客户端
 * @param cookieStore Cookie存储对象（ReadonlyRequestCookies）
 */
export function createClient(cookieStore: import('next/dist/server/web/spec-extension/adapters/request-cookies').ReadonlyRequestCookies) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * 异步获取所有 Cookie
         */
        async getAll() {
          return cookieStore.getAll();
        },
        /**
         * 异步批量设置 Cookie
         */
        async setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            throw new Error('Failed to set cookies');
          }
        },
      },
    }
  );
}
