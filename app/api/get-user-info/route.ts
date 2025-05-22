import { respData, respErr } from "@/lib/resp";

import { User } from "@/types/user";
// import { currentUser } from "@clerk/nextjs";
import { getUserCredits } from "@/services/order";
import { saveUser } from "@/services/user";

// Trae注释：导入Clerk服务端API模块
import { clerkClient, getAuth } from '@clerk/nextjs/server';
// Trae注释：使用Next.js扩展的请求类型
import { NextRequest, NextResponse } from 'next/server';

export const runtime = "edge";


export async function POST(req: NextRequest) {
  try {
    const session = await getAuth(req);

    // Trae注释：添加null值检查守卫
    if (!session?.userId) {
      return NextResponse.json({ code: 401, message: 'Unauthorized' });
    }

    // Trae注释：现在session.userId已确定为string类型
    const user = await clerkClient.users.getUser(session.userId);
    
    const email = user.emailAddresses[0].emailAddress;
    const nickname = user.firstName;
    const avatarUrl = user.imageUrl;
    const userInfo: User = {
      email: email,
      nickname: nickname || "",
      avatar_url: avatarUrl,
    };

    await saveUser(userInfo);

    const user_credits = await getUserCredits(email);
    userInfo.credits = user_credits;

    return respData(userInfo);
  } catch (e) {
    console.error('API Error:', e);
    return respErr('internal error');
  }
}


