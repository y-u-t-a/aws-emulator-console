import * as v from 'valibot'
import { createBucket } from '#server/utils/s3'
import { createS3BucketApiRequestSchema } from '#shared/schema/s3'

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, v.safeParser(createS3BucketApiRequestSchema))

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.issues[0]?.message ?? 'リクエストが不正です',
    })
  }

  const { name } = result.output

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
