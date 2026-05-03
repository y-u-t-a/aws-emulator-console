import { getQueueList } from '#server/utils/sqs'

export default defineEventHandler(async () => {
  return await getQueueList()
})
