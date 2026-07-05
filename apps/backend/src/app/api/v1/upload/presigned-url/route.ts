import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { verifyAuth } from '../../../../../lib/auth';
import { withErrorHandler } from '../../../../../lib/apiHandler';
import { UnauthorizedError, AppError } from '../../../../../lib/errors';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const POST = withErrorHandler(async (request: Request) => {
  const user = verifyAuth(request);
  if (!user) {
    throw new UnauthorizedError();
  }

  const { contentType, fileExtension } = await request.json();
    
  // Validate inputs
  if (!contentType || !fileExtension) {
    throw new AppError('Missing contentType or fileExtension', 400);
  }

    // Sanitize name for S3 path (remove special characters, replace spaces with hyphens)
    const sanitizedName = user.name.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const empIdStr = user.employeeId ? `-${user.employeeId}` : '';
    const folderName = `${user.role}/${sanitizedName}${empIdStr}`;

    // Generate unique key
    const fileName = `uploads/${folderName}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    // Create put command
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
      ContentType: contentType,
    });

    // Generate presigned URL
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

    // Construct the public URL (if the bucket is public)
    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

  return NextResponse.json({
    presignedUrl,
    publicUrl,
    fileName,
  });
});
