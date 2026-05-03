import * as v from 'valibot'
import { sendMessage } from '#server/utils/sqs'
import { sendSqsMessageApiRequestSchema } from '#shared/schema/sqs'

export default defineEventHandler(async (event) => {
  const queueName = getRouterParam(event, 'queueName')
  if (!queueName) {
    throw createError({ statusCode: 400, statusMessage: 'キュー名が指定されていません' })
  }

  const result = await readValidatedBody(event, v.safeParser(sendSqsMessageApiRequestSchema))
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.issues[0]?.message ?? 'リクエストが不正です',
    })
  }

  const { body, messageGroupId, messageDeduplicationId } = result.output

  try {
    return await sendMessage(queueName, body, {
      messageGroupId: messageGroupId || undefined,
      messageDeduplicationId: messageDeduplicationId || undefined,
    })
  } catch (e) {
    throw createError({
      statusCode: 500,
      statusMessage: e instanceof Error ? e.message : 'メッセージの送信に失敗しました',
    })
  }
})
