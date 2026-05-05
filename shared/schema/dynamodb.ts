import * as v from 'valibot'

const tableNamePattern = /^[a-zA-Z0-9_.-]{3,255}$/

export const deleteDynamoDbTablesApiRequestSchema = v.object({
  names: v.array(v.pipe(v.string(), v.minLength(1))),
})

export const scanDynamoDbItemsApiRequestSchema = v.object({
  limit: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(1000)),
  exclusiveStartKey: v.optional(v.record(v.string(), v.unknown())),
})

export const queryDynamoDbItemsApiRequestSchema = v.object({
  partitionKeyName: v.pipe(v.string(), v.minLength(1)),
  partitionKeyValue: v.pipe(v.string(), v.minLength(1)),
  sortKeyName: v.optional(v.string()),
  sortKeyValue: v.optional(v.string()),
  limit: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(1000)),
})

export const deleteDynamoDbItemsApiRequestSchema = v.object({
  keys: v.array(v.record(v.string(), v.union([v.string(), v.number()]))),
})

export const putDynamoDbItemApiRequestSchema = v.object({
  item: v.record(v.string(), v.union([v.string(), v.number(), v.boolean(), v.null()])),
})

export const createDynamoDbTableApiRequestSchema = v.object({
  name: v.pipe(
    v.string(),
    v.trim(),
    v.regex(tableNamePattern, 'テーブル名は3〜255文字の英数字・アンダースコア・ハイフン・ドットで指定してください'),
  ),
  partitionKey: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'パーティションキーを入力してください'),
  ),
  partitionKeyType: v.picklist(['S', 'N', 'B'], '属性タイプはS・N・Bのいずれかで指定してください'),
  sortKey: v.optional(v.pipe(v.string(), v.trim())),
  sortKeyType: v.optional(v.picklist(['S', 'N', 'B'])),
})
