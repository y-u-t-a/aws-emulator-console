import type { KeyType, TableStatus } from '@aws-sdk/client-dynamodb'
import type * as v from 'valibot'
import type { createDynamoDbTableApiRequestSchema, deleteDynamoDbTablesApiRequestSchema } from '#shared/schema/dynamodb'

export type CreateDynamoDbTableApiRequest = v.InferInput<typeof createDynamoDbTableApiRequestSchema>
export type DeleteDynamoDbTablesApiRequest = v.InferInput<typeof deleteDynamoDbTablesApiRequestSchema>

export type DynamoDbTable = {
  Name: string
  Status?: TableStatus
  ItemCount: number
  SizeBytes: number
  KeySchema: {
    AttributeName: string
    KeyType?: KeyType
  }[]
}
