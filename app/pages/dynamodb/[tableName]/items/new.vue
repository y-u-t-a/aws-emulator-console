<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import type { DynamoDbTableDetail } from '~~/shared/model/dynamodb'

const route = useRoute('dynamodb-tableName-items-new')
const tableName = computed(() => route.params.tableName)

const toast = useToast()
const submitting = ref(false)

const { data: table } = await useFetch<DynamoDbTableDetail>(
  () => `/api/dynamodb/${tableName.value}`,
)

const bread = computed<BreadcrumbItem[]>(() => [
  { label: 'テーブル', to: { name: 'dynamodb' } },
  { label: tableName.value, to: { name: 'dynamodb-tableName', params: { tableName: tableName.value } } },
  { label: 'アイテム作成' },
])

type FieldType = 'S' | 'N' | 'BOOL' | 'NULL'
type Field = { key: string, type: FieldType, value: string }

const typeItems: { label: string, value: FieldType }[] = [
  { label: 'String (S)', value: 'S' },
  { label: 'Number (N)', value: 'N' },
  { label: 'Boolean (BOOL)', value: 'BOOL' },
  { label: 'Null (NULL)', value: 'NULL' },
]

const boolItems = [
  { label: 'true', value: 'true' },
  { label: 'false', value: 'false' },
]

const keySchemaKeys = computed(() =>
  new Set(table.value?.KeySchema.map(k => k.AttributeName) ?? []),
)

function makeInitialFields(): Field[] {
  if (!table.value) return [{ key: '', type: 'S', value: '' }]
  return table.value.KeySchema.map(k => ({
    key: k.AttributeName,
    type: 'S' as FieldType,
    value: '',
  }))
}

const fields = ref<Field[]>([])
// touched: フィールドのインデックスごとに { key, value } を管理
const touched = ref<Set<string>>(new Set())

function touchedKey(index: number, col: 'key' | 'value') {
  return `${index}:${col}`
}

function isTouched(index: number, col: 'key' | 'value') {
  return touched.value.has(touchedKey(index, col))
}

function touch(index: number, col: 'key' | 'value') {
  touched.value.add(touchedKey(index, col))
}

watch(table, () => {
  fields.value = makeInitialFields()
  touched.value = new Set()
}, { immediate: true })

function addField() {
  fields.value.push({ key: '', type: 'S', value: '' })
  // 追加したフィールドは touched に入れない（入力前はエラーを出さない）
}

function removeField(index: number) {
  fields.value.splice(index, 1)
  // touched のキーを詰め直す
  const newTouched = new Set<string>()
  for (const key of touched.value) {
    const [idxStr, col] = key.split(':')
    const idx = Number(idxStr)
    if (idx < index) newTouched.add(key)
    else if (idx > index) newTouched.add(touchedKey(idx - 1, col as 'key' | 'value'))
  }
  touched.value = newTouched
}

function isKeySchemaField(index: number) {
  return keySchemaKeys.value.has(fields.value[index]?.key ?? '')
}

function fieldError(field: Field): { key: string | null, value: string | null } {
  const keyErr = field.key.trim() === '' ? 'キー名を入力してください' : null
  let valueErr: string | null = null
  if (field.type === 'N') {
    if (field.value.trim() === '') valueErr = '値を入力してください'
    else if (Number.isNaN(Number(field.value))) valueErr = '数値を入力してください'
  } else if (field.type !== 'NULL' && field.type !== 'BOOL' && field.value.trim() === '') {
    valueErr = '値を入力してください'
  }
  return { key: keyErr, value: valueErr }
}

const hasErrors = computed(() =>
  fields.value.some(f => {
    const e = fieldError(f)
    return e.key !== null || e.value !== null
  }),
)

const canSubmit = computed(() =>
  !hasErrors.value
  && fields.value.length > 0
  && keySchemaKeys.value.size > 0
  && [...keySchemaKeys.value].every(k => fields.value.some(f => f.key === k)),
)

const jsonPreview = computed(() => {
  const obj: Record<string, unknown> = {}
  for (const f of fields.value) {
    if (!f.key.trim()) continue
    if (f.type === 'S') obj[f.key] = f.value
    else if (f.type === 'N') obj[f.key] = f.value === '' ? 0 : Number(f.value)
    else if (f.type === 'BOOL') obj[f.key] = f.value === 'true'
    else if (f.type === 'NULL') obj[f.key] = null
  }
  return JSON.stringify(obj, null, 2)
})

async function submit() {
  // submit 時は全フィールドを touched にする
  fields.value.forEach((_, i) => {
    touch(i, 'key')
    touch(i, 'value')
  })
  if (!canSubmit.value) return

  submitting.value = true
  try {
    await $fetch(`/api/dynamodb/${tableName.value}/items`, {
      method: 'POST',
      body: { fields: fields.value },
    })
    toast.add({ title: 'アイテムを作成しました', color: 'success' })
    await navigateTo({ name: 'dynamodb-tableName', params: { tableName: tableName.value } })
  } catch (e) {
    toast.add({
      title: 'アイテムの作成に失敗しました',
      description: e instanceof Error ? e.message : undefined,
      color: 'error',
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <UBreadcrumb :items="bread" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="flex flex-col gap-3">
        <h2 class="font-semibold">
          フィールド
        </h2>

        <div
          v-for="(field, index) in fields"
          :key="index"
          class="flex items-start gap-2"
        >
          <div class="flex flex-col gap-1">
            <UInput
              v-model="field.key"
              placeholder="キー名"
              :disabled="isKeySchemaField(index)"
              :color="isTouched(index, 'key') && fieldError(field).key ? 'error' : undefined"
              class="w-36"
              @input="touch(index, 'key')"
              @blur="touch(index, 'key')"
            />
            <p
              v-if="isTouched(index, 'key') && fieldError(field).key"
              class="text-xs text-red-500"
            >
              {{ fieldError(field).key }}
            </p>
          </div>
          <USelect
            v-model="field.type"
            :items="typeItems"
            class="w-40"
          />
          <div class="flex flex-col gap-1 flex-1">
            <USelect
              v-if="field.type === 'BOOL'"
              v-model="field.value"
              :items="boolItems"
            />
            <UInput
              v-else-if="field.type !== 'NULL'"
              v-model="field.value"
              :placeholder="field.type === 'N' ? '0' : '値'"
              :color="isTouched(index, 'value') && fieldError(field).value ? 'error' : undefined"
              @input="touch(index, 'value')"
              @blur="touch(index, 'value')"
            />
            <span
              v-else
              class="text-sm text-neutral-400 py-1.5"
            >null</span>
            <p
              v-if="isTouched(index, 'value') && fieldError(field).value"
              class="text-xs text-red-500"
            >
              {{ fieldError(field).value }}
            </p>
          </div>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="sm"
            :disabled="isKeySchemaField(index)"
            @click="removeField(index)"
          />
        </div>

        <UButton
          icon="i-lucide-plus"
          color="neutral"
          variant="outline"
          size="sm"
          class="self-start"
          @click="addField"
        >
          フィールド追加
        </UButton>

        <div class="flex gap-2 mt-2">
          <UButton
            color="neutral"
            variant="outline"
            :to="{ name: 'dynamodb-tableName', params: { tableName } }"
          >
            キャンセル
          </UButton>
          <UButton
            color="primary"
            :loading="submitting"
            :disabled="!canSubmit"
            @click="submit"
          >
            作成
          </UButton>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <h2 class="font-semibold">
          JSON プレビュー
        </h2>
        <pre class="bg-neutral-100 dark:bg-neutral-900 rounded-md p-4 text-sm font-mono overflow-auto">{{ jsonPreview }}</pre>
      </div>
    </div>
  </div>
</template>
