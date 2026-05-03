import * as v from 'valibot'
import { updateQueueAttributes } from '#server/utils/sqs'
import { updateSqsQueueApiRequestSchema } from '#shared/schema/sqs'

export default defineEventHandler(async (event) => {
  const queueName = getRouterParam(event, 'queueName')
  if (!queueName) {
    throw createError({ statusCode: 400, statusMessage: 'キュー名が指定されていません' })
  }

  const result = await readValidatedBody(event, v.safeParser(updateSqsQueueApiRequestSchema))
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.issues[0]?.message ?? 'リクエストが不正です',
    })
  }

  const { visibilityTimeout } = result.output

  try {
    await updateQueueAttributes(queueName, visibilityTimeout)
    return { success: true }
  } catch (e) {
    if (e instanceof Error && e.name === 'QueueDoesNotExist') {
      throw createError({
        statusCode: 404,
        statusMessage: `キュー ${queueName} が見つかりません`,
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: e instanceof Error ? e.message : 'キュー属性の更新に失敗しました',
    })
  }
})
