import * as v from 'valibot'
import { createTable } from '#server/utils/dynamodb'
import { createDynamoDbTableApiRequestSchema } from '#shared/schema/dynamodb'

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, v.safeParser(createDynamoDbTableApiRequestSchema))

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.issues[0]?.message ?? 'リクエストが不正です',
    })
  }

  try {
    await createTable(result.output)
  } catch (e) {
    if (e instanceof Error && e.name === 'ResourceInUseException') {
      throw createError({
        statusCode: 409,
        statusMessage: `テーブル ${result.output.name} はすでに存在します`,
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: e instanceof Error ? e.message : 'テーブルの作成に失敗しました',
    })
  }

  return { name: result.output.name }
})
