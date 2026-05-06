<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import type { DynamoDbTableDetail } from '~~/shared/model/dynamodb'
import type { Field, FieldType } from '~~/app/components/dynamodb/ItemFieldRow.vue'

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
watch(table, () => {
  fields.value = makeInitialFields()
}, { immediate: true })

const rowRefs = useTemplateRef<{ hasError: boolean, touchAll: () => void }[]>('rows')

function addField() {
  fields.value.push({ key: '', type: 'S', value: '' })
}

function removeField(index: number) {
  fields.value.splice(index, 1)
}

const canSubmit = computed(() =>
  fields.value.length > 0
  && keySchemaKeys.value.size > 0
  && [...keySchemaKeys.value].every(k => fields.value.some(f => f.key === k))
  && !(rowRefs.value?.some(r => r.hasError) ?? false),
)

function toItem(fs: Field[]): Record<string, string | number | boolean | null> {
  const obj: Record<string, string | number | boolean | null> = {}
  for (const f of fs) {
    if (!f.key.trim()) continue
    if (f.type === 'S') obj[f.key] = f.value
    else if (f.type === 'N') obj[f.key] = f.value === '' ? 0 : Number(f.value)
    else if (f.type === 'BOOL') obj[f.key] = f.value === 'true'
    else if (f.type === 'NULL') obj[f.key] = null
  }
  return obj
}

const jsonPreview = computed(() => JSON.stringify(toItem(fields.value), null, 2))

async function submit() {
  rowRefs.value?.forEach(r => r.touchAll())
  if (!canSubmit.value) return

  submitting.value = true
  try {
    await $fetch(`/api/dynamodb/${tableName.value}/items`, {
      method: 'POST',
      body: { item: toItem(fields.value) },
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

    <div class="grid grid-cols-1 md:grid-cols-[65%_35%] gap-6">
      <div class="flex flex-col gap-3">
        <h2 class="font-semibold">
          フィールド
        </h2>

        <DynamodbItemFieldRow
          v-for="(field, index) in fields"
          ref="rows"
          :key="index"
          v-model="fields[index]!"
          :key-fixed="keySchemaKeys.has(field.key)"
          @remove="removeField(index)"
        />

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
