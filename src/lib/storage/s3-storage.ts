import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

// Storage Configuration
const endpoint =
  process.env.AWS_ENDPOINT_URL_S3 ||
  process.env.R2_ENDPOINT ||
  process.env.NEON_STORAGE_ENDPOINT;

const accessKeyId =
  process.env.AWS_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID;

const secretAccessKey =
  process.env.AWS_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY;

const region =
  process.env.AWS_REGION || process.env.R2_REGION || "eu-central-1";

export const STORAGE_BUCKET =
  process.env.S3_BUCKET_NAME ||
  process.env.R2_BUCKET ||
  "formly-assets";

let s3ClientInstance: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!s3ClientInstance) {
    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        "Object storage credentials (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY) are not configured."
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

export async function putObjectToStorage(params: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
  bucket?: string;
}): Promise<void> {
  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: params.bucket || STORAGE_BUCKET,
    Key: params.key,
    Body: params.body,
    ContentType: params.contentType,
  });
  await client.send(command);
}

export async function getObjectFromStorage(
  key: string,
  bucket?: string
): Promise<{
  body: Uint8Array;
  contentType?: string;
  contentLength?: number;
}> {
  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: bucket || STORAGE_BUCKET,
    Key: key,
  });
  const response = await client.send(command);
  const bytes = await response.Body?.transformToByteArray();
  if (!bytes) {
    throw new Error(`Failed to read object bytes for key: ${key}`);
  }
  return {
    body: bytes,
    contentType: response.ContentType,
    contentLength: response.ContentLength,
  };
}

export async function deleteObjectFromStorage(
  key: string,
  bucket?: string
): Promise<void> {
  try {
    const client = getS3Client();
    const command = new DeleteObjectCommand({
      Bucket: bucket || STORAGE_BUCKET,
      Key: key,
    });
    await client.send(command);
  } catch (err) {
    console.warn(`Failed to delete storage object ${key}:`, err);
  }
}
