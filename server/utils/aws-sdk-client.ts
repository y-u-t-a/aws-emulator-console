import { S3Client } from '@aws-sdk/client-s3'
import { SQSClient } from '@aws-sdk/client-sqs'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const mockConfig = {
  endpoint: process.env.AWS_ENDPOINT ?? 'http://localhost:4566',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy',
    sessionToken: 'dummy',
  },
}

export const S3 = new S3Client({ ...mockConfig, forcePathStyle: true })

export const SQS = new SQSClient(mockConfig)

export const DynamoDB = new DynamoDBClient(mockConfig)
export const DynamoDBDoc = DynamoDBDocumentClient.from(DynamoDB)
