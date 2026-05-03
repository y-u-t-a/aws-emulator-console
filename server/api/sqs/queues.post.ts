import * as v from 'valibot'
import { createQueue } from '#server/utils/sqs'
import { createSqsQueueApiRequestSchema } from '#shared/schema/sqs'

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, v.safeParser(createSqsQueueApiRequestSchema))

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.issues[0]?.message ?? 'リクエストが不正です',
    })
  }

  const { name, fifo, contentBasedDeduplication } = result.output

  try {
    await createQueue(name, fifo, contentBasedDeduplication ?? false)
  } catch (e) {
    if (e instanceof Error && e.name === 'QueueNameExists') {
      throw createError({
        statusCode: 409,
        statusMessage: `キュー ${name} はすでに存在します`,
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: e instanceof Error ? e.message : 'キューの作成に失敗しました',
    })
  }

  return { name }
})
