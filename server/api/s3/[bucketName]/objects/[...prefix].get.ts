import { getObjectList } from '#server/utils/s3'

export default defineEventHandler(async (event) => {
  const bucketName = getRouterParam(event, 'bucketName')
  const prefix = getRouterParam(event, 'prefix') ?? ''

  if (!bucketName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'バケット名を指定してください',
    })
  }

  try {
    return await getObjectList(bucketName, decodeURIComponent(prefix))
  } catch (e) {
    throw createError({
      statusCode: 500,
      statusMessage: e instanceof Error ? e.message : 'オブジェクト一覧の取得に失敗しました',
    })
  }
})
