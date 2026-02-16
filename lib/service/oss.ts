"use server";

import {
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ossClient, bucketName } from "./oss-client";

export interface OSSFile {
  Key: string;
  LastModified?: Date;
  Size?: number;
  Url?: string;
}

export async function getUploadUrl(
  fileName: string,
  contentType: string,
): Promise<{ url: string; key: string }> {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    ContentType: contentType,
  });

  try {
    const url = await getSignedUrl(ossClient, command, { expiresIn: 3600 });
    return { url, key: fileName };
  } catch (error) {
    console.error("Error generating signed upload url:", error);
    throw new Error("Failed to generate upload url");
  }
}

export async function listFiles(): Promise<OSSFile[]> {
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
  });

  try {
    const response = await ossClient.send(command);
    const files = response.Contents || [];

    // Convert to simple object and generate signed URLs
    const fileList = await Promise.all(
      files.map(async (file) => {
        let url = "";
        if (file.Key) {
          try {
            const getCommand = new GetObjectCommand({
              Bucket: bucketName,
              Key: file.Key,
            });
            url = await getSignedUrl(ossClient, getCommand, {
              expiresIn: 3600,
            });
          } catch (e) {
            console.error(`Failed to sign url for ${file.Key}`, e);
          }
        }

        return {
          Key: file.Key || "",
          LastModified: file.LastModified,
          Size: file.Size,
          Url: url,
        };
      }),
    );

    return fileList;
  } catch (error) {
    console.error("Error listing files:", error);
    throw new Error("Failed to list files");
  }
}

export interface OSSFileMeta {
  ContentType?: string;
  ContentLength?: number;
  LastModified?: Date;
  ETag?: string;
  Metadata?: Record<string, string>;
}

export async function getFileMeta(key: string): Promise<OSSFileMeta> {
  const command = new HeadObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    const response = await ossClient.send(command);
    return {
      ContentType: response.ContentType,
      ContentLength: response.ContentLength,
      LastModified: response.LastModified,
      ETag: response.ETag,
      Metadata: response.Metadata,
    };
  } catch (error) {
    console.error("Error getting file meta:", error);
    throw new Error("Failed to get file meta");
  }
}

export async function deleteFile(key: string): Promise<{ success: boolean }> {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    await ossClient.send(command);
    return { success: true };
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error("Failed to delete file");
  }
}
