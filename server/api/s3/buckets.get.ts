import { getBucketList } from '#server/utils/s3'

export default defineEventHandler(async () => {
  return await getBucketList()
})
