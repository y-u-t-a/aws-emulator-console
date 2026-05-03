import * as v from 'valibot'
import { purgeQueue } from '#server/utils/sqs'
import { purgeSqsQueuesApiRequestSchema } from '#shared/schema/sqs'

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, v.safeParser(purgeSqsQueuesApiRequestSchema))

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.issues[0]?.message ?? 'リクエストが不正です',
    })
  }

  const { names } = result.output

  const failures: { name: string, message: string }[] = []
  for (const name of names) {
    try {
      await purgeQueue(name)
    } catch (e) {
      failures.push({
        name,
        message: e instanceof Error ? e.message : 'メッセージのクリアに失敗しました',
      })
    }
  }

  if (failures.length > 0) {
    throw createError({
      statusCode: 500,
      statusMessage: failures.map(f => `${f.name}: ${f.message}`).join(', '),
    })
  }

  return { names }
})
