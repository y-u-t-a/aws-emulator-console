import { createBucket } from '#server/utils/s3'
import type { CreateS3BucketApiRequest } from '#shared/model/s3'

const BUCKET_NAME_PATTERN = /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<CreateS3BucketApiRequest>>(event)
  const name = body?.name?.trim()

  if (!name || !BUCKET_NAME_PATTERN.test(name)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'バケット名は3〜63文字の英小文字・数字・ハイフン・ピリオドで指定してください',
    })
  }

  try {
    await createBucket(name)
  } catch (e) {
    if (e instanceof Error && (e.name === 'BucketAlreadyExists' || e.name === 'BucketAlreadyOwnedByYou')) {
      throw createError({
        statusCode: 409,
        statusMessage: `バケット ${name} はすでに存在します`,
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: e instanceof Error ? e.message : 'バケットの作成に失敗しました',
    })
  }

  return { name }
})
