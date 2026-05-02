import * as v from 'valibot'

const bucketNamePattern = /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/

export const createS3BucketApiRequestSchema = v.object({
  name: v.pipe(
    v.string(),
    v.trim(),
    v.regex(bucketNamePattern, 'バケット名は3〜63文字の英小文字・数字・ハイフン・ピリオドで指定してください'),
  ),
})

export const deleteS3BucketsApiRequestSchema = v.object({
  names: v.pipe(
    v.array(v.pipe(v.string(), v.trim(), v.minLength(1))),
    v.minLength(1, '削除するバケット名を指定してください'),
  ),
})

export const createS3FolderApiRequestSchema = v.object({
  bucketName: v.pipe(v.string(), v.minLength(1)),
  prefix: v.string(),
  folderName: v.pipe(v.string(), v.minLength(1)),
})
