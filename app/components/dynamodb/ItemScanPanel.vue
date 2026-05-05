<script setup lang="ts">
import type { DynamoDbItem } from '~~/shared/model/dynamodb'

const props = defineProps<{
  tableName: string
}>()

const pageSize = ref(100)

// ページキャッシュ: インデックス = ページ番号 - 1
const pageCache = ref<DynamoDbItem[][]>([])
// 各ページの lastEvaluatedKey（次ページ取得用）。undefined = 最終ページ
const lastEvaluatedKeys = ref<(Record<string, unknown> | undefined)[]>([])
const currentPage = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)
const executed = ref(false)

const items = computed(() => pageCache.value[currentPage.value] ?? [])
const totalPages = computed(() => pageCache.value.length)
const hasNextPage = computed(() => lastEvaluatedKeys.value[currentPage.value] !== undefined)
const hasPrevPage = computed(() => currentPage.value > 0)

async function fetchPage(exclusiveStartKey?: Record<string, unknown>) {
  loading.value = true
  error.value = null
  try {
    return await $fetch<{ items: DynamoDbItem[], lastEvaluatedKey: Record<string, unknown> | undefined }>(
      `/api/dynamodb/${props.tableName}/items/scan`,
      { method: 'POST', body: { limit: pageSize.value, exclusiveStartKey } },
    )
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Scan に失敗しました'
    return null
  } finally {
    loading.value = false
  }
}

async function execute() {
  pageCache.value = []
  lastEvaluatedKeys.value = []
  currentPage.value = 0
  executed.value = false

  const res = await fetchPage()
  if (!res) return

  pageCache.value = [res.items]
  lastEvaluatedKeys.value = [res.lastEvaluatedKey]
  executed.value = true
}

async function nextPage() {
  const nextIndex = currentPage.value + 1
  if (pageCache.value[nextIndex]) {
    currentPage.value = nextIndex
    return
  }
  const res = await fetchPage(lastEvaluatedKeys.value[currentPage.value])
  if (!res) return

  pageCache.value.push(res.items)
  lastEvaluatedKeys.value.push(res.lastEvaluatedKey)
  currentPage.value = nextIndex
}

function prevPage() {
  if (hasPrevPage.value) currentPage.value--
}
</script>

<template>
  <div>
    <div class="flex items-end gap-3">
      <UFormField label="ページサイズ">
        <UInputNumber
          v-model="pageSize"
          :min="1"
          :max="1000"
          class="w-28"
        />
      </UFormField>
      <UButton
        icon="i-lucide-play"
        :loading="loading"
        @click="execute"
      >
        Scan 実行
      </UButton>
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="error"
      class="mt-4"
    />
    <template v-else-if="executed">
      <DynamodbItemList
        :items="items"
        :loading="loading"
      />
      <div class="flex items-center gap-3 mt-3">
        <UButton
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="outline"
          :disabled="!hasPrevPage"
          @click="prevPage"
        >
          前へ
        </UButton>
        <span class="text-sm text-neutral-500">
          {{ currentPage + 1 }} / {{ totalPages }}{{ hasNextPage ? '+' : '' }} ページ
        </span>
        <UButton
          color="neutral"
          variant="outline"
          :disabled="!hasNextPage"
          :loading="loading"
          @click="nextPage"
        >
          次へ
          <template #trailing>
            <UIcon name="i-lucide-chevron-right" />
          </template>
        </UButton>
      </div>
    </template>
  </div>
</template>
