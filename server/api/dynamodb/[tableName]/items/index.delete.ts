import * as v from 'valibot'
import { deleteItems } from '#server/utils/dynamodb'
import { deleteDynamoDbItemsApiRequestSchema } from '#shared/schema/dynamodb'

export default defineEventHandler(async (event) => {
  const tableName = getRouterParam(event, 'tableName')
  if (!tableName) {
    throw createError({ statusCode: 400, statusMessage: 'テーブル名が指定されていません' })
  }

  const result = await readValidatedBody(event, v.safeParser(deleteDynamoDbItemsApiRequestSchema))
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.issues[0]?.message ?? 'リクエストが不正です' })
  }

  try {
    await deleteItems(tableName, result.output)
  } catch (e) {
    throw createError({
      statusCode: 500,
      statusMessage: e instanceof Error ? e.message : 'アイテムの削除に失敗しました',
    })
  }
})
