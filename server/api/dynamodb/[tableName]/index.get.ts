import { getTableDetail } from '#server/utils/dynamodb'

export default defineEventHandler(async (event) => {
  const tableName = getRouterParam(event, 'tableName')
  if (!tableName) {
    throw createError({ statusCode: 400, statusMessage: 'テーブル名が指定されていません' })
  }

  try {
    return await getTableDetail(tableName)
  } catch (e) {
    if (e instanceof Error && e.name === 'ResourceNotFoundException') {
      throw createError({
        statusCode: 404,
        statusMessage: `テーブル ${tableName} が見つかりません`,
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: e instanceof Error ? e.message : 'テーブル情報の取得に失敗しました',
    })
  }
})
