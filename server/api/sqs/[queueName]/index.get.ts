import { getQueueDetail } from '#server/utils/sqs'

export default defineEventHandler(async (event) => {
  const queueName = getRouterParam(event, 'queueName')
  if (!queueName) {
    throw createError({ statusCode: 400, statusMessage: 'キュー名が指定されていません' })
  }

  try {
    return await getQueueDetail(queueName)
  } catch (e) {
    if (e instanceof Error && e.name === 'QueueDoesNotExist') {
      throw createError({
        statusCode: 404,
        statusMessage: `キュー ${queueName} が見つかりません`,
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: e instanceof Error ? e.message : 'キュー情報の取得に失敗しました',
    })
  }
})
