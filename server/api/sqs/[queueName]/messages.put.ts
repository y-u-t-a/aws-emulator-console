import * as v from 'valibot'
import { receiveMessages } from '#server/utils/sqs'
import { receiveSqsMessagesApiRequestSchema } from '#shared/schema/sqs'

export default defineEventHandler(async (event) => {
  const queueName = getRouterParam(event, 'queueName')
  if (!queueName) {
    throw createError({ statusCode: 400, statusMessage: 'キュー名が指定されていません' })
  }

  const result = await readValidatedBody(event, v.safeParser(receiveSqsMessagesApiRequestSchema))
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.issues[0]?.message ?? 'リクエストが不正です',
    })
  }

  try {
    return await receiveMessages(queueName, result.output.maxNumberOfMessages)
  } catch (e) {
    throw createError({
      statusCode: 500,
      statusMessage: e instanceof Error ? e.message : 'メッセージの受信に失敗しました',
    })
  }
})
