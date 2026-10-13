import fs from "fs/promises";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

// Storage Configuration supporting Cloudflare R2 and AWS/Neon S3
const endpoint =
  process.env.R2_ENDPOINT ||
  (process.env.R2_ACCOUNT_ID
    ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : undefined) ||
  process.env.AWS_ENDPOINT_URL_S3 ||
  process.env.NEON_STORAGE_ENDPOINT;

const accessKeyId =
  process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;

const secretAccessKey =
  process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

const region =
  process.env.R2_REGION || process.env.AWS_REGION || "auto";

export const STORAGE_BUCKET =
  process.env.R2_BUCKET ||
  process.env.S3_BUCKET_NAME ||
  "formly-assets";

export const PUBLIC_STORAGE_URL =
  process.env.R2_PUBLIC_URL ||
  process.env.STORAGE_PUBLIC_URL;

const LOCAL_STORAGE_DIR = path.join(process.cwd(), ".storage");

let s3ClientInstance: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!s3ClientInstance) {
    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        "Object storage credentials (R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY or AWS credentials) are not configured."
      );
    }

    s3ClientInstance = new S3Client({
      endpoint: endpoint || undefined,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Required for Neon Object Storage and S3 path-style providers
    });
  }
  return s3ClientInstance;
}

export function isStorageConfigured(): boolean {
  return Boolean(accessKeyId && secretAccessKey);
}

export function getMissingStorageConfig(): string[] {
  const missing: string[] = [];
  if (!process.env.R2_BUCKET && !process.env.S3_BUCKET_NAME) missing.push("R2_BUCKET");
  if (!process.env.R2_ACCESS_KEY_ID && !process.env.AWS_ACCESS_KEY_ID) missing.push("R2_ACCESS_KEY_ID");
  if (!process.env.R2_SECRET_ACCESS_KEY && !process.env.AWS_SECRET_ACCESS_KEY) missing.push("R2_SECRET_ACCESS_KEY");
  if (!process.env.R2_ENDPOINT && !process.env.R2_ACCOUNT_ID && !process.env.AWS_ENDPOINT_URL_S3) missing.push("R2_ENDPOINT / R2_ACCOUNT_ID");
  return missing;
}

export async function putObjectToStorage(params: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
  bucket?: string;
}): Promise<void> {
  let s3Uploaded = false;

  if (isStorageConfigured()) {
    try {
      const client = getS3Client();
      const command = new PutObjectCommand({
        Bucket: params.bucket || STORAGE_BUCKET,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
      });
      await client.send(command);
      s3Uploaded = true;
    } catch (err) {
      console.warn("S3/R2 storage upload failed, falling back to local storage:", err);
    }
  }

  // Local filesystem fallback ensures image storage is always resilient and available
  try {
    const filePath = path.join(LOCAL_STORAGE_DIR, params.key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, params.body);
  } catch (localErr) {
    if (!s3Uploaded) {
      throw localErr;
    }
  }
}

export async function getObjectFromStorage(
  key: string,
  bucket?: string
): Promise<{
  body: Uint8Array;
  contentType?: string;
  contentLength?: number;
}> {
  // First check local filesystem cache for immediate delivery
  try {
    const filePath = path.join(LOCAL_STORAGE_DIR, key);
    const fileBytes = await fs.readFile(filePath);
    const ext = path.extname(key).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
    };
    return {
      body: fileBytes,
      contentType: mimeMap[ext] || "image/jpeg",
      contentLength: fileBytes.length,
    };
  } catch {
    // Not present locally, proceed to S3/R2
  }

  if (isStorageConfigured()) {
    try {
      const client = getS3Client();
      const command = new GetObjectCommand({
        Bucket: bucket || STORAGE_BUCKET,
        Key: key,
      });
      const response = await client.send(command);
      const bytes = await response.Body?.transformToByteArray();
      if (bytes) {
        // Cache locally for fast subsequent access
        try {
          const filePath = path.join(LOCAL_STORAGE_DIR, key);
          await fs.mkdir(path.dirname(filePath), { recursive: true });
          await fs.writeFile(filePath, bytes);
        } catch {}

        return {
          body: bytes,
          contentType: response.ContentType,
          contentLength: response.ContentLength,
        };
      }
    } catch (err) {
      console.warn("S3/R2 storage get failed, attempting local fallback:", err);
    }
  }

  throw new Error(`Object "${key}" could not be retrieved from storage.`);
}

export async function deleteObjectFromStorage(
  key: string,
  bucket?: string
): Promise<void> {
  if (isStorageConfigured()) {
    try {
      const client = getS3Client();
      const command = new DeleteObjectCommand({
        Bucket: bucket || STORAGE_BUCKET,
        Key: key,
      });
      await client.send(command);
    } catch (err) {
      console.warn(`Failed to delete S3/R2 storage object ${key}:`, err);
    }
  }

  try {
    const filePath = path.join(LOCAL_STORAGE_DIR, key);
    await fs.unlink(filePath);
  } catch {}
}
