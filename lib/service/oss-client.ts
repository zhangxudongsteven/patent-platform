import { S3Client } from "@aws-sdk/client-s3";

const OSS_ENDPOINT = process.env.OSS_ENDPOINT;
const OSS_ACCESS_KEY = process.env.OSS_ACCESS_KEY;
const OSS_SECRET_KEY = process.env.OSS_SECRET_KEY;
const OSS_BUCKET = process.env.OSS_BUCKET;

if (!OSS_ENDPOINT || !OSS_ACCESS_KEY || !OSS_SECRET_KEY || !OSS_BUCKET) {
  throw new Error("Missing OSS environment variables");
}

export const ossClient = new S3Client({
  region: "auto",
  endpoint: OSS_ENDPOINT,
  credentials: {
    accessKeyId: OSS_ACCESS_KEY,
    secretAccessKey: OSS_SECRET_KEY,
  },
  // 如果使用 MinIO 等不支持虚拟主机风格的 S3 兼容服务，请将 forcePathStyle 设置为 true
  // forcePathStyle: true,
});

export const bucketName = OSS_BUCKET;
