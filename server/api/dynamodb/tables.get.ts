import { getTableList } from '#server/utils/dynamodb'

export default defineEventHandler(async () => {
  return await getTableList()
})
