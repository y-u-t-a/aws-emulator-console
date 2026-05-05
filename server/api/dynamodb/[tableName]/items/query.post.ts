import * as v from 'valibot'
import { queryItems } from '#server/utils/dynamodb'
import { queryDynamoDbItemsApiRequestSchema } from '#shared/schema/dynamodb'

export default defineEventHandler(async (event) => {
  const tableName = getRouterParam(event, 'tableName')
  if (!tableName) {
    throw createError({ statusCode: 400, statusMessage: 'テーブル名が指定されていません' })
  }

  const result = await readValidatedBody(event, v.safeParser(queryDynamoDbItemsApiRequestSchema))
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.issues[0]?.message ?? 'リクエストが不正です' })
  }

  try {
    return await queryItems(tableName, result.output)
  } catch (e) {
    throw createError({
      statusCode: 500,
      statusMessage: e instanceof Error ? e.message : 'Query に失敗しました',
    })
  }
})
