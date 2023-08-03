import { Injectable } from '@nestjs/common';
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
const bucketName = 'image-processor-test';
@Injectable()
export class AppService {
  constructor(private readonly s3Client: S3Client) {}

  async uploadFile(file: Express.Multer.File) {
    try {
      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null); // Mark the end of the stream

      const createMultipartUploadCommand = new CreateMultipartUploadCommand({
        Bucket: bucketName,
        Key: file.originalname,
      });
      const { UploadId } = await this.s3Client.send(
        createMultipartUploadCommand,
      );

      const parts = [];
      let partNumber = 0;

      for await (const chunks of stream) {
        partNumber++;
        const uploadPartCommand = new UploadPartCommand({
          Bucket: bucketName,
          Key: file.originalname,
          PartNumber: partNumber,
          UploadId,
          Body: String(chunks),
        });

        const { ETag } = await this.s3Client.send(uploadPartCommand);
        console.log(ETag);
        parts.push({ ETag, PartNumber: partNumber });
      }
      const completeMultipartUploadCommand = new CompleteMultipartUploadCommand(
        {
          Bucket: bucketName,
          Key: file.originalname,
          MultipartUpload: { Parts: parts },
          UploadId,
        },
      );

      const result = await this.s3Client.send(completeMultipartUploadCommand);
      return { filename: file.originalname, location: result.Location };
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  async uploadFile2(file: Express.Multer.File) {
    try {
      console.log(file);

      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null); // Mark the end of the stream

      const createMultipartUploadCommand = new CreateMultipartUploadCommand({
        Bucket: bucketName,
        Key: file.originalname,
      });
      const { UploadId } = await this.s3Client.send(
        createMultipartUploadCommand,
      );

      const parts = [];
      let partNumber = 0;

      for await (const chunks of stream) {
        partNumber++;
        const uploadPartCommand = new UploadPartCommand({
          Bucket: bucketName,
          Key: file.originalname,
          PartNumber: partNumber,
          UploadId,
          Body: chunks,
        });

        const { ETag } = await this.s3Client.send(uploadPartCommand);
        console.log(ETag);
        parts.push({ ETag, PartNumber: partNumber });
      }

      const completeMultipartUploadCommand = new CompleteMultipartUploadCommand(
        {
          Bucket: bucketName,
          Key: file.originalname,
          MultipartUpload: { Parts: parts },
          UploadId,
        },
      );

      const result = await this.s3Client.send(completeMultipartUploadCommand);
      console.log('Multipart Upload Completed:', result.Location);

      return { filename: file.originalname, location: result.Location };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
}
