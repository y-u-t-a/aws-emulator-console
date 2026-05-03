import * as v from 'valibot'
import { deleteMessage } from '#server/utils/sqs'
import { deleteSqsMessageApiRequestSchema } from '#shared/schema/sqs'

export default defineEventHandler(async (event) => {
  const queueName = getRouterParam(event, 'queueName')
  if (!queueName) {
    throw createError({ statusCode: 400, statusMessage: 'キュー名が指定されていません' })
  }

  const result = await readValidatedBody(event, v.safeParser(deleteSqsMessageApiRequestSchema))
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.issues[0]?.message ?? 'リクエストが不正です',
    })
  }

  try {
    await deleteMessage(queueName, result.output.receiptHandle)
    return { success: true }
  } catch (e) {
    throw createError({
      statusCode: 500,
      statusMessage: e instanceof Error ? e.message : 'メッセージの削除に失敗しました',
    })
  }
})
