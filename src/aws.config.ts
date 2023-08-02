import { S3Client } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
config();
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
};

const region = 'us-east-1';
export const s3ClientProvider = {
  provide: S3Client,
  useValue: new S3Client({ region, credentials }),
};
