import type * as v from 'valibot'
import type {
  createS3BucketApiRequestSchema,
  deleteS3BucketsApiRequestSchema,
  createS3FolderApiRequestSchema,
} from '#shared/schema/s3'

export type S3Bucket = {
  Name: string
  CreationDate?: string
}

export type S3Object = {
  Bucket: string
  Key: string
  Type: 'file' | 'folder'
  DisplayObjectName?: string
  Size?: number
  LastModified?: string
}

export type CreateS3BucketApiRequest = v.InferInput<typeof createS3BucketApiRequestSchema>
export type DeleteS3BucketsApiRequest = v.InferInput<typeof deleteS3BucketsApiRequestSchema>
export type CreateS3FolderApiRequest = v.InferInput<typeof createS3FolderApiRequestSchema>
