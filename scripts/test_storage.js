const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

async function checkStorage() {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || "eu-central-1";
  const bucket = process.env.S3_BUCKET_NAME || "formly-assets";

  console.log("Endpoint:", endpoint);
  console.log("AccessKey:", accessKeyId);
  console.log("Bucket:", bucket);

  const client = new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });

  try {
    const res = await client.send(new ListObjectsV2Command({
      Bucket: bucket,
      MaxKeys: 5,
    }));
    console.log("Storage connection SUCCESS! Keys count:", res.KeyCount);
  } catch (err) {
    console.error("Storage error:", err.message);
  }
}

checkStorage();
