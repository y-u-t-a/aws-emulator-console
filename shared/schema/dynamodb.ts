import * as v from 'valibot'

const tableNamePattern = /^[a-zA-Z0-9_.-]{3,255}$/

export const deleteDynamoDbTablesApiRequestSchema = v.object({
  names: v.array(v.pipe(v.string(), v.minLength(1))),
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
