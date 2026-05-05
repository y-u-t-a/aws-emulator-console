import type { KeyType, TableStatus } from '@aws-sdk/client-dynamodb'
import type * as v from 'valibot'
import type {
  createDynamoDbTableApiRequestSchema,
  deleteDynamoDbTablesApiRequestSchema,
  deleteDynamoDbItemsApiRequestSchema,
  scanDynamoDbItemsApiRequestSchema,
  queryDynamoDbItemsApiRequestSchema,
  putDynamoDbItemApiRequestSchema,
} from '#shared/schema/dynamodb'

export type CreateDynamoDbTableApiRequest = v.InferInput<typeof createDynamoDbTableApiRequestSchema>
export type DeleteDynamoDbTablesApiRequest = v.InferInput<typeof deleteDynamoDbTablesApiRequestSchema>
export type DeleteDynamoDbItemsApiRequest = v.InferInput<typeof deleteDynamoDbItemsApiRequestSchema>
export type ScanDynamoDbItemsApiRequest = v.InferInput<typeof scanDynamoDbItemsApiRequestSchema>
export type QueryDynamoDbItemsApiRequest = v.InferInput<typeof queryDynamoDbItemsApiRequestSchema>
export type PutDynamoDbItemApiRequest = v.InferInput<typeof putDynamoDbItemApiRequestSchema>

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

export type DynamoDbItem = Record<string, string | number | boolean | null>

export type DynamoDbTableDetail = DynamoDbTable & {
  Arn: string
  CreatedAt?: Date
  GlobalSecondaryIndexes: {
    IndexName: string
    KeySchema: { AttributeName: string, KeyType?: KeyType }[]
    ItemCount: number
  }[]
}
