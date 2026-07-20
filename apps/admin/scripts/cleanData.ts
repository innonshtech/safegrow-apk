import { PrismaClient } from '@safegrow/db';
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';

// Load from the backend .env since that is what you are editing
dotenv.config({ path: path.resolve(__dirname, '../../../apps/backend/.env'), override: true });
// Also try the admin .env as a fallback
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

const accessKeyId = process.env.S3_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || '';

console.log(`[DEBUG] Using AWS Access Key: ${accessKeyId ? accessKeyId.substring(0, 5) + '***' : 'NOT FOUND'}`);

const prisma = new PrismaClient();

const s3 = new S3Client({
  region: process.env.S3_REGION || 'ap-south-1',
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'safegrow-uploads';

async function emptyS3Bucket() {
  console.log(`\n🧹 Emptying S3 Bucket: ${BUCKET_NAME}`);
  try {
    let deletedCount = 0;
    let isTruncated = true;
    let continuationToken: string | undefined = undefined;

    while (isTruncated) {
      const listCommand: any = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        ContinuationToken: continuationToken,
      });

      const listResponse = await s3.send(listCommand);

      if (listResponse.Contents && listResponse.Contents.length > 0) {
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: BUCKET_NAME,
          Delete: {
            Objects: listResponse.Contents.map((obj) => ({ Key: obj.Key })),
          },
        });

        const deleteResponse = await s3.send(deleteCommand);
        deletedCount += deleteResponse.Deleted?.length || 0;
      }

      isTruncated = listResponse.IsTruncated || false;
      continuationToken = listResponse.NextContinuationToken;
    }

    console.log(`✅ Deleted ${deletedCount} objects from S3 bucket.`);
  } catch (error) {
    console.error('❌ Error emptying S3 bucket:', error);
  }
}

async function cleanDatabase() {
  console.log(`\n🧹 Cleaning Database...`);
  try {
    // 1. Delete Location Pings
    const delLocationPings = await prisma.locationPing.deleteMany({});
    console.log(`✅ Deleted ${delLocationPings.count} Location Pings`);

    // 2. Delete Visits
    const delVisits = await prisma.visit.deleteMany({});
    console.log(`✅ Deleted ${delVisits.count} Visits`);

    // 3. Delete Attendance Requests
    const delAttendanceRequests = await prisma.attendanceRequest.deleteMany({});
    console.log(`✅ Deleted ${delAttendanceRequests.count} Attendance Requests`);

    // 4. Delete Attendances
    const delAttendances = await prisma.attendance.deleteMany({});
    console.log(`✅ Deleted ${delAttendances.count} Attendances`);

    // 5. Delete Fraud Alerts
    const delFraudAlerts = await prisma.fraudAlert.deleteMany({});
    console.log(`✅ Deleted ${delFraudAlerts.count} Fraud Alerts`);

    // 6. First, set reportsToId to null for all users to avoid foreign key constraints
    await prisma.user.updateMany({
      data: {
        reportsToId: null,
      },
    });

    // 7. Delete Non-Admin Users
    const delUsers = await prisma.user.deleteMany({
      where: {
        role: {
          in: ['REP', 'MANAGER']
        }
      }
    });
    console.log(`✅ Deleted ${delUsers.count} Users (Reps and Managers)`);

    console.log('✅ Database cleanup completed.');
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('🚀 Starting Cleanup Process...');
  await cleanDatabase();
  await emptyS3Bucket();
  console.log('🎉 Cleanup Process Finished successfully!');
}

main();
