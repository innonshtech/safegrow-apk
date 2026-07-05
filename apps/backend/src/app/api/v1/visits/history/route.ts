import { NextResponse } from "next/server";
import { prisma } from "@safegrow/db";
import { verifyAuth } from "../../../../../lib/auth";
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { withErrorHandler } from "../../../../../lib/apiHandler";
import { UnauthorizedError } from "../../../../../lib/errors";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const dynamic = 'force-dynamic';

export const GET = withErrorHandler(async (request: Request) => {
  const auth = verifyAuth(request);
  if (!auth) {
    throw new UnauthorizedError();
  }

  const userId = auth.id;

    // Fetch the user's visits records, ordered by time descending
    const visits = await prisma.visit.findMany({
      where: { userId },
      orderBy: { time: 'desc' },
      take: 50 // fetch last 50 visits
    });

    // Generate presigned URLs for photos
    const bucketUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
    
    const visitsWithPresignedUrls = await Promise.all(
      visits.map(async (visit) => {
        if (visit.photoUrl && visit.photoUrl.startsWith(bucketUrl)) {
          try {
            const key = visit.photoUrl.replace(bucketUrl, '');
            const command = new GetObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET_NAME!,
              Key: key,
            });
            // URL valid for 1 hour
            const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            return { ...visit, photoUrl: presignedUrl };
          } catch (e) {
            console.error('Failed to sign url', e);
            return visit;
          }
        }
        return visit;
      })
    );

  return NextResponse.json(visitsWithPresignedUrls);
});
