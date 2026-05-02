import * as v from 'valibot'
import { deleteObjectByKey } from '#server/utils/s3'
import { deleteS3ObjectsApiRequestSchema } from '#shared/schema/s3'

export default defineEventHandler(async (event) => {
  const bucketName = getRouterParam(event, 'bucketName')

  if (!bucketName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'バケット名を指定してください',
    })
  }

  const result = await readValidatedBody(event, v.safeParser(deleteS3ObjectsApiRequestSchema))

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.issues[0]?.message ?? 'リクエストが不正です',
    })
  }

  const { keys } = result.output

  const failures: { key: string, message: string }[] = []
  for (const key of keys) {
    try {
      await deleteObjectByKey(bucketName, key)
    } catch (e) {
      failures.push({
        key,
        message: e instanceof Error ? e.message : 'オブジェクトの削除に失敗しました',
      })
    }
  }

  if (failures.length > 0) {
    throw createError({
      statusCode: 500,
      statusMessage: failures.map(f => `${f.key}: ${f.message}`).join(', '),
    })
  }

  return { keys }
})
