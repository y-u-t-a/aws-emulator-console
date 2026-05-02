import { deleteBucket } from '#server/utils/s3'
import type { DeleteS3BucketsApiRequest } from '#shared/model/s3'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<DeleteS3BucketsApiRequest>>(event)
  const names = body?.names?.map(name => name.trim()).filter(name => name.length > 0) ?? []

  if (names.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: '削除するバケット名を指定してください',
    })
  }

  const failures: { name: string, message: string }[] = []
  for (const name of names) {
    try {
      await deleteBucket(name)
    } catch (e) {
      failures.push({
        name,
        message: e instanceof Error ? e.message : 'バケットの削除に失敗しました',
      })
    }
  }

  if (failures.length > 0) {
    throw createError({
      statusCode: 500,
      statusMessage: failures.map(f => `${f.name}: ${f.message}`).join(', '),
    })
  }

  return { names }
})
