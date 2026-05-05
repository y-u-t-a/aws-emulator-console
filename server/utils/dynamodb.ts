import { ListTablesCommand, DescribeTableCommand, CreateTableCommand, DeleteTableCommand } from '@aws-sdk/client-dynamodb'
import type { CreateDynamoDbTableApiRequest, DynamoDbTable } from '#shared/model/dynamodb'
import { DynamoDB } from '#server/utils/aws-sdk-client'

export async function getTableList(): Promise<DynamoDbTable[]> {
  const { TableNames = [] } = await DynamoDB.send(new ListTablesCommand({}))

  const tables = await Promise.all(
    TableNames.map(async (name) => {
      const { Table } = await DynamoDB.send(new DescribeTableCommand({ TableName: name }))
      return {
        Name: name,
        Status: Table?.TableStatus,
        ItemCount: Table?.ItemCount ?? 0,
        SizeBytes: Table?.TableSizeBytes ?? 0,
        KeySchema: (Table?.KeySchema ?? []).map(k => ({
          AttributeName: k.AttributeName ?? '',
          KeyType: k.KeyType,
        })),
      } satisfies DynamoDbTable
    }),
  )

  return tables
}

export async function createTable({ name, partitionKey, partitionKeyType, sortKey, sortKeyType }: CreateDynamoDbTableApiRequest): Promise<void> {
  const attributeDefinitions = [
    { AttributeName: partitionKey, AttributeType: partitionKeyType },
    ...(sortKey && sortKeyType ? [{ AttributeName: sortKey, AttributeType: sortKeyType }] : []),
  ]

  const keySchema = [
    { AttributeName: partitionKey, KeyType: 'HASH' as const },
    ...(sortKey ? [{ AttributeName: sortKey, KeyType: 'RANGE' as const }] : []),
  ]

  await DynamoDB.send(new CreateTableCommand({
    TableName: name,
    AttributeDefinitions: attributeDefinitions,
    KeySchema: keySchema,
    BillingMode: 'PAY_PER_REQUEST',
  }))
}

export async function deleteTable(name: string): Promise<void> {
  await DynamoDB.send(new DeleteTableCommand({ TableName: name }))
}
