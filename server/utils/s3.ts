import { S3 } from './aws-sdk-client'
import { formatDateTime } from '#shared/util/datetime'
import {
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteBucketCommand,
  PutObjectCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3'
import type { S3Bucket, S3Object } from '#shared/model/s3'

export async function createBucket(bucket: string) {
  const command = new CreateBucketCommand({
    Bucket: bucket,
  })
  await S3.send(command)
}

export async function getBucketList() {
  const command = new ListBucketsCommand({})
  const response = await S3.send(command)
  const s3Buckets: S3Bucket[] = response.Buckets!.map((bucket) => {
    return { Name: bucket.Name!, CreationDate: formatDateTime(bucket.CreationDate!) }
  })
  return s3Buckets
}

export async function getObjectList(bucket: string, prefix: string = ''): Promise<S3Object[]> {
  const filterPrefix = !prefix || prefix.endsWith('/') ? prefix : `${prefix}/`
  const folders: S3Object[] = []
  const files: S3Object[] = []
  let continuationToken: string | undefined = undefined

  do {
    const command: ListObjectsV2Command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: filterPrefix,
      Delimiter: '/',
      ContinuationToken: continuationToken,
    })
    const response = await S3.send(command)

    for (const commonPrefix of response.CommonPrefixes ?? []) {
      const key = commonPrefix.Prefix!
      folders.push({
        Bucket: bucket,
        Key: key,
        Type: 'folder',
        DisplayObjectName: key.slice(filterPrefix.length).replace(/\/$/, ''),
      })
    }

    for (const content of response.Contents ?? []) {
      if (content.Key === filterPrefix) continue
      files.push({
        Bucket: bucket,
        Key: content.Key!,
        Type: 'file',
        DisplayObjectName: content.Key!.slice(filterPrefix.length),
        Size: content.Size!,
        LastModified: formatDateTime(content.LastModified!),
      })
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined
  } while (continuationToken)

  return [...folders, ...files]
}

export async function getObjectDetail(bucket: string, key: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
    const response = await S3.send(command)
    const s3Object: S3Object = {
      Bucket: bucket,
      Key: key,
      Type: 'file',
      DisplayObjectName: key,
      Size: response.ContentLength!,
      LastModified: formatDateTime(response.LastModified!),
    }
    return s3Object
  } catch {
    return undefined
  }
}

async function clearS3Bucket(bucket: string) {
  let continuationToken: string | undefined = undefined
  do {
    const listCommand: ListObjectsV2Command = new ListObjectsV2Command({
      Bucket: bucket,
      ContinuationToken: continuationToken,
    })
    const response = await S3.send(listCommand)
    const objects = response.Contents || []
    await Promise.all(objects.map((object) => {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucket,
        Key: object.Key,
      })
      return S3.send(deleteCommand)
    }))
    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined
  } while (continuationToken)
}

export async function deleteBucket(bucket: string) {
  await clearS3Bucket(bucket)
  const command = new DeleteBucketCommand({
    Bucket: bucket,
  })
  await S3.send(command)
}

async function deleteFolder(bucket: string, prefix: string) {
  let continuationToken: string | undefined = undefined
  do {
    const listCommand: ListObjectsV2Command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    })
    const response = await S3.send(listCommand)
    const objects = response.Contents || []
    await Promise.all(objects.map((object) => {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucket,
        Key: object.Key,
      })
      return S3.send(deleteCommand)
    }))
    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined
  } while (continuationToken)
}

export async function deleteObjectByKey(bucket: string, key: string) {
  if (key.endsWith('/')) {
    await deleteFolder(bucket, key)
    return
  }
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  })
  await S3.send(command)
}

export async function createFolder(bucket: string, prefix: string, folderName: string) {
  const normalizedPrefix = !prefix || prefix.endsWith('/') ? prefix : `${prefix}/`
  const key = `${normalizedPrefix}${folderName}/`
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: '',
  })
  await S3.send(command)
  return key
}

export async function uploadObject(bucket: string, key: string, body: Uint8Array, contentType?: string) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  })
  await S3.send(command)
}

export async function downloadObject(bucket: string, key: string) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  })
  const response = await S3.send(command)
  return {
    body: response.Body!.transformToWebStream(),
    contentType: response.ContentType,
    contentLength: response.ContentLength,
  }
}
