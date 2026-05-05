import { ListTablesCommand, DescribeTableCommand, CreateTableCommand, DeleteTableCommand } from '@aws-sdk/client-dynamodb'
import { ScanCommand, QueryCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import type { CreateDynamoDbTableApiRequest, DynamoDbTable, DynamoDbTableDetail, DynamoDbItem, ScanDynamoDbItemsApiRequest, QueryDynamoDbItemsApiRequest, PutDynamoDbItemApiRequest, DeleteDynamoDbItemsApiRequest } from '#shared/model/dynamodb'
import { DynamoDB, DynamoDBDoc } from '#server/utils/aws-sdk-client'

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

export async function scanItems(tableName: string, { limit, exclusiveStartKey }: ScanDynamoDbItemsApiRequest): Promise<{ items: DynamoDbItem[], lastEvaluatedKey: Record<string, unknown> | undefined }> {
  const { Items = [], LastEvaluatedKey } = await DynamoDBDoc.send(new ScanCommand({
    TableName: tableName,
    Limit: limit,
    ExclusiveStartKey: exclusiveStartKey,
  }))
  return { items: Items as DynamoDbItem[], lastEvaluatedKey: LastEvaluatedKey }
}

export async function queryItems(tableName: string, { partitionKeyName, partitionKeyValue, sortKeyName, sortKeyValue, limit }: QueryDynamoDbItemsApiRequest): Promise<DynamoDbItem[]> {
  const hasSortKey = sortKeyName && sortKeyValue

  const { Items = [] } = await DynamoDBDoc.send(new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: hasSortKey
      ? '#pk = :pk AND #sk = :sk'
      : '#pk = :pk',
    ExpressionAttributeNames: {
      '#pk': partitionKeyName,
      ...(hasSortKey ? { '#sk': sortKeyName } : {}),
    },
    ExpressionAttributeValues: {
      ':pk': partitionKeyValue,
      ...(hasSortKey ? { ':sk': sortKeyValue } : {}),
    },
    Limit: limit,
  }))
  return Items as DynamoDbItem[]
}

export async function putItem(tableName: string, { item }: PutDynamoDbItemApiRequest): Promise<void> {
  await DynamoDBDoc.send(new PutCommand({ TableName: tableName, Item: item }))
}

export async function deleteItems(tableName: string, { keys }: DeleteDynamoDbItemsApiRequest): Promise<void> {
  await Promise.all(
    keys.map(key => DynamoDBDoc.send(new DeleteCommand({ TableName: tableName, Key: key }))),
  )
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
