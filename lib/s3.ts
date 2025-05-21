import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

// 配置S3客户端（适配Cloudflare R2）
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.CF_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_AK || "",
    secretAccessKey: process.env.AWS_SK || "",
  },
});

// 更新上传方法
export async function downloadAndUploadImage(
  imageUrl: string,
  bucketName: string,
  s3Key: string
) {
  try {
    // 使用fetch替代axios（更适配Edge Runtime）
    const response = await fetch(imageUrl);
    const body = response.body;
    if (!body) {
      throw new Error('Failed to get response body');
    }

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: s3Key,
        Body: body as unknown as ReadableStream<Uint8Array>, // 使用标准Web Stream类型
        ContentType: response.headers.get("content-type") || "image/png",
      },
      partSize: 5 * 1024 * 1024,
    });

    return upload.done();
  } catch (e) {
    console.log("upload failed:", e);
    throw e;
  }
}

// 完全移除downloadImage函数及其导出
