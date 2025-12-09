import { Router } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const router = Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

router.post("/upload", async (req, res) => {
  try {
    const body = req.body as Buffer;

    if (!body || !body.length) {
      return res.status(400).json({ error: "Empty file" });
    }

    const contentType =
      (req.headers["content-type"] as string) || "application/octet-stream";
    const originalName =
      (req.headers["x-vercel-filename"] as string) || "image.png";

    const ext = originalName.split(".").pop() || "png";
    const key = `uploads/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
        Body: body,
        ContentType: contentType
      })
    );

    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return res.status(200).json({ url });
  } catch (err) {
    console.error("[S3 upload error]", err);
    return res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
