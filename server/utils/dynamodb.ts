import { ListTablesCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDB } from '#server/utils/aws-sdk-client'
import type { DynamoDbTable } from '#shared/model/dynamodb'

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
