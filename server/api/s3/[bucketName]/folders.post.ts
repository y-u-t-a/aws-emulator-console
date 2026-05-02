import * as v from 'valibot'
import { createFolder } from '#server/utils/s3'
import { createS3FolderApiRequestSchema } from '#shared/schema/s3'

export default defineEventHandler(async (event) => {
  const bucketName = getRouterParam(event, 'bucketName')

  if (!bucketName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'バケット名を指定してください',
    })
  }

  const result = await readValidatedBody(event, v.safeParser(createS3FolderApiRequestSchema))

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.issues[0]?.message ?? 'リクエストが不正です',
    })
  }

  const { prefix, folderName } = result.output

  try {
    const key = await createFolder(bucketName, prefix, folderName)
    return { key }
  } catch (e) {
    throw createError({
      statusCode: 500,
      statusMessage: e instanceof Error ? e.message : 'フォルダの作成に失敗しました',
    })
  }
})
