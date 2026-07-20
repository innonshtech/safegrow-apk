import { NextResponse } from 'next/server';
import { prisma } from '@safegrow/db';
import { S3Client, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { verifyAuth } from '../../../../../../lib/auth';

const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // First fetch the user and all their attendances and visits to get photo URLs
    const employee = await prisma.user.findUnique({
      where: { id },
      include: {
        attendances: true,
        visits: true,
      },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Extract all photo URLs
    const photoUrls: string[] = [];
    employee.attendances.forEach(att => {
      if (att.checkInPhotoUrl) photoUrls.push(att.checkInPhotoUrl);
      if (att.checkOutPhotoUrl) photoUrls.push(att.checkOutPhotoUrl);
    });
    employee.visits.forEach(visit => {
      if (visit.photoUrl) photoUrls.push(visit.photoUrl);
    });

    // Extract S3 object keys
    const objectKeys = photoUrls
      .filter(url => url.includes('amazonaws.com'))
      .map(url => {
        try {
          const urlParts = new URL(url);
          return urlParts.pathname.substring(1); // Remove leading slash
        } catch (e) {
          return null;
        }
      })
      .filter((key): key is string => key !== null && key.length > 0);

    // Delete objects from S3
    if (objectKeys.length > 0) {
      try {
        const command = new DeleteObjectsCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Delete: {
            Objects: objectKeys.map(key => ({ Key: key })),
            Quiet: true,
          },
        });
        await s3Client.send(command);
      } catch (e) {
        console.error('Error deleting from S3:', e);
        // Continue with database deletion even if S3 fails
      }
    }

    // Disconnect subordinates
    await prisma.user.updateMany({
      where: { reportsToId: id },
      data: { reportsToId: null },
    });

    // Delete database records sequentially to avoid foreign key constraint errors
    await prisma.$transaction([
      prisma.locationPing.deleteMany({ where: { userId: id } }),
      prisma.visit.deleteMany({ where: { userId: id } }),
      prisma.attendance.deleteMany({ where: { userId: id } }),
      prisma.attendanceRequest.deleteMany({ where: { userId: id } }),
      prisma.leaveRequest.deleteMany({ where: { userId: id } }),
      prisma.fraudAlert.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: "Employee successfully deleted" });
  } catch (error: any) {
    console.error("Hard Delete Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete employee" },
      { status: 500 }
    );
  }
}
