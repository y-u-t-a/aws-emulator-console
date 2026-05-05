import { ListTablesCommand, DescribeTableCommand, CreateTableCommand, DeleteTableCommand, ScanCommand, QueryCommand } from '@aws-sdk/client-dynamodb'
import type { AttributeValue } from '@aws-sdk/client-dynamodb'
import type { CreateDynamoDbTableApiRequest, DynamoDbTable, DynamoDbTableDetail, DynamoDbItem, ScanDynamoDbItemsApiRequest, QueryDynamoDbItemsApiRequest } from '#shared/model/dynamodb'
import { DynamoDB } from '#server/utils/aws-sdk-client'

function toItem(record: Record<string, AttributeValue>): DynamoDbItem {
  return Object.fromEntries(
    Object.entries(record).map(([k, v]) => {
      if (v.S !== undefined) return [k, v.S]
      if (v.N !== undefined) return [k, Number(v.N)]
      if (v.BOOL !== undefined) return [k, v.BOOL]
      if (v.NULL) return [k, null]
      return [k, JSON.stringify(v)]
    }),
  )
}

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

export async function scanItems(tableName: string, { limit, exclusiveStartKey }: ScanDynamoDbItemsApiRequest): Promise<{ items: DynamoDbItem[], lastEvaluatedKey: Record<string, AttributeValue> | undefined }> {
  const { Items = [], LastEvaluatedKey } = await DynamoDB.send(new ScanCommand({
    TableName: tableName,
    Limit: limit,
    ExclusiveStartKey: exclusiveStartKey as Record<string, AttributeValue> | undefined,
  }))
  return { items: Items.map(toItem), lastEvaluatedKey: LastEvaluatedKey }
}

export async function queryItems(tableName: string, { partitionKeyName, partitionKeyValue, sortKeyName, sortKeyValue, limit }: QueryDynamoDbItemsApiRequest): Promise<DynamoDbItem[]> {
  const hasSortKey = sortKeyName && sortKeyValue

  const { Items = [] } = await DynamoDB.send(new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: hasSortKey
      ? '#pk = :pk AND #sk = :sk'
      : '#pk = :pk',
    ExpressionAttributeNames: {
      '#pk': partitionKeyName,
      ...(hasSortKey ? { '#sk': sortKeyName } : {}),
    },
    ExpressionAttributeValues: {
      ':pk': { S: partitionKeyValue },
      ...(hasSortKey ? { ':sk': { S: sortKeyValue } } : {}),
    },
    Limit: limit,
  }))
  return Items.map(toItem)
}

export async function getTableDetail(name: string): Promise<DynamoDbTableDetail> {
  const { Table } = await DynamoDB.send(new DescribeTableCommand({ TableName: name }))
  if (!Table) {
    throw Object.assign(new Error(`テーブル ${name} が見つかりません`), { name: 'ResourceNotFoundException' })
  }
  return {
    Name: name,
    Status: Table.TableStatus,
    ItemCount: Table.ItemCount ?? 0,
    SizeBytes: Table.TableSizeBytes ?? 0,
    Arn: Table.TableArn ?? '',
    CreatedAt: Table.CreationDateTime,
    KeySchema: (Table.KeySchema ?? []).map(k => ({
      AttributeName: k.AttributeName ?? '',
      KeyType: k.KeyType,
    })),
    GlobalSecondaryIndexes: (Table.GlobalSecondaryIndexes ?? []).map(gsi => ({
      IndexName: gsi.IndexName ?? '',
      KeySchema: (gsi.KeySchema ?? []).map(k => ({
        AttributeName: k.AttributeName ?? '',
        KeyType: k.KeyType,
      })),
      ItemCount: gsi.ItemCount ?? 0,
    })),
  }
}
