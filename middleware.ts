import { NextResponse } from "next/server";
import { authMiddleware } from "@clerk/nextjs";

/**
 * Clerk认证中间件配置
 * 处理用户认证和路由保护
 */
export default authMiddleware({
  // 公开路由配置 - 无需登录即可访问
  publicRoutes: [
    "/sign-in",
    "/", 
    "/pricing", 
    "/api/get-wallpapers"
    // 注意：移除了/api/get-user-info，因为它需要认证
  ],

  // 认证后处理逻辑
  afterAuth(auth, req) {
    console.log(`访问路径: ${req.nextUrl.pathname}`, 
      `用户状态: ${auth.userId ? '已登录' : '未登录'}`);
    if (!auth.userId && !auth.isPublicRoute) {
      if (auth.isApiRoute) {
        return NextResponse.json(
          { code: -2, message: "no auth" },
          { status: 401 }
        );
      } else {
        return NextResponse.redirect(new URL("/sign-in", req.url));
      }
    }

    return NextResponse.next();
  },
});

/**
 * 中间件路由匹配配置
 * 确保包含所有需要中间件处理的路径
 */
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)","/","/(api|trpc)(.*)"],
  runtime: 'experimental-edge'
};
