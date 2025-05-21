import { respData, respErr } from "@/lib/resp";

import { ImageGenerateParams } from "openai/resources/images.mjs";
import { User } from "@/types/user";
import { Wallpaper } from "@/types/wallpaper";
import { currentUser } from "@clerk/nextjs";
import { downloadAndUploadImage } from "@/lib/s3";
import { getOpenAIClient } from "@/services/openai";
import { getUserCredits } from "@/services/order";
import { insertWallpaper } from "@/models/wallpaper";
import { saveUser } from "@/services/user";
// Trae注释：导入Clerk服务端API模块
import { clerkClient, getAuth } from '@clerk/nextjs/server';
// Trae注释：使用Next.js扩展的请求类型
import { NextRequest, NextResponse } from 'next/server';

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const client = getOpenAIClient();
    const session = await getAuth(req);

    // Trae注释：增强会话验证
    if (!session?.userId) {
      return NextResponse.json(
        { code: 401, message: 'Invalid session' },
        { status: 401 }
      );
    }

    // Trae注释：使用try-catch包装Clerk API调用
    try {
      // 添加重试机制
      const fetchWithRetry = async (fn: Function, retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            return await fn();
          } catch (e) {
            if (i === retries - 1) throw e;
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
          }
        }
      };
      
      // 修改认证调用方式
      const user = await fetchWithRetry(() => clerkClient.users.getUser(session.userId));
      if (!user?.emailAddresses?.[0]?.emailAddress) {
        return NextResponse.json(
          { code: 403, message: 'Email not verified' },
          { status: 403 }
        );
      }

      if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
        return respErr("no auth");
      }

      try {
        const { description } = await req.json();
        if (!description) {
          return respErr("invalid params");
        }

        // save user
        const user_email = user.emailAddresses[0].emailAddress;
        const nickname = user.firstName;
        const avatarUrl = user.imageUrl;
        const userInfo: User = {
          email: user_email,
          nickname: nickname || "",
          avatar_url: avatarUrl,
        };

        await saveUser(userInfo);

        const user_credits = await getUserCredits(user_email);
        if (!user_credits || user_credits.left_credits < 1) {
          return respErr("credits not enough");
        }

        const llm_name = "dall-e-3";
        const img_size = "1792x1024";
        const llm_params: ImageGenerateParams = {
          prompt: `generate desktop wallpaper image about ${description}`,
          model: llm_name,
          n: 1,
          quality: "hd",
          response_format: "url",
          size: img_size,
          style: "vivid",
        };
        const created_at = new Date().toISOString();

        // const res = await client.images.generate(llm_params);

        //const raw_img_url = res.data[0].url;
        const raw_img_url = "https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png";
        if (!raw_img_url) {
          return respErr("generate wallpaper failed");
        }

        const img_name = encodeURIComponent(description);
        const img_path = `wallpapers/${img_name}.png`;
        
        
        const s3_img = await downloadAndUploadImage(
          raw_img_url,
          process.env.AWS_BUCKET || "trysai",
          img_path
        ).catch(e => {
          console.error('S3 上传失败:', e);
          return null;
        });
        console.error('s3_img:', s3_img);
        if (!s3_img) {
          return respErr("图片上传失败");
        }
        
        // const img_url = `${ process.env.IMAGE_R2_HOST}/${img_path}`;

        const img_url = `${ process.env.IMAGE_R2_HOST}/${img_path}`;
        
        
        // const img_url = raw_img_url;
       


        const wallpaper: Wallpaper = {
          user_email: user_email,
          img_description: description,
          img_size: img_size,
          img_url: img_url || '',
          llm_name: llm_name,
          llm_params: JSON.stringify(llm_params),
          created_at: created_at,
        };
        await insertWallpaper(wallpaper);

        return respData(wallpaper);
      } catch (e) {
        console.log("generate wallpaper failed: ", e);
        return respErr("generate wallpaper failed");
      }
    } catch (clerkError) {
      console.error('[Clerk Error]', clerkError);
      return NextResponse.json(
        { code: 500, message: 'Authentication failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[API Error]', error);
    return NextResponse.json(
      { code: 500, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
