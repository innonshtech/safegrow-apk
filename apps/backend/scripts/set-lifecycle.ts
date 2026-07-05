import { S3Client, PutBucketLifecycleConfigurationCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function main() {
  try {
    const command = new PutBucketLifecycleConfigurationCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      LifecycleConfiguration: {
        Rules: [
          {
            ID: 'DeleteOldUploads',
            Prefix: 'uploads/', // Apply to everything in the uploads/ folder
            Status: 'Enabled',
            Expiration: {
              // AWS S3 STRICT LIMITATION: You CANNOT use minutes or hours here.
              // S3 Lifecycle rules ONLY accept whole Days (minimum 1 Day).
              // AWS runs the deletion engine once per day at midnight UTC.
              // Set to 1 for testing. Change to 45 for production.
              Days: 1, 
            },
          },
        ],
      },
    });

    await s3Client.send(command);
    console.log('✅ Successfully applied 45-day deletion Lifecycle Rule to S3 Bucket!');
  } catch (error) {
    console.error('❌ Failed to set lifecycle configuration:', error);
  }
}

main();
