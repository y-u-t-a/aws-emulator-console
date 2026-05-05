import type { KeyType, TableStatus } from '@aws-sdk/client-dynamodb'

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
