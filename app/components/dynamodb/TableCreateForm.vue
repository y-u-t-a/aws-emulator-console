<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import { createDynamoDbTableApiRequestSchema } from '#shared/schema/dynamodb'
import type { CreateDynamoDbTableApiRequest } from '#shared/model/dynamodb'

const emits = defineEmits<{
  created: [tableName: string]
}>()

const toast = useToast()

const isOpen = ref(false)
const state = reactive<CreateDynamoDbTableApiRequest>({
  name: '',
  partitionKey: '',
  partitionKeyType: 'S',
  sortKey: '',
  sortKeyType: 'S',
})
const submitting = ref(false)
const formRef = useTemplateRef<Form<CreateDynamoDbTableApiRequest>>('form')
const isValid = computed(() => formRef.value?.getErrors().length === 0)

const keyTypeItems = [
  { label: 'String (S)', value: 'S' },
  { label: 'Number (N)', value: 'N' },
  { label: 'Binary (B)', value: 'B' },
]

function openCreateForm() {
  state.name = ''
  state.partitionKey = ''
  state.partitionKeyType = 'S'
  state.sortKey = ''
  state.sortKeyType = 'S'
  isOpen.value = true
}

async function submitCreate(event: FormSubmitEvent<CreateDynamoDbTableApiRequest>) {
  const { name, partitionKey, partitionKeyType, sortKey, sortKeyType } = event.data
  submitting.value = true
  try {
    await $fetch('/api/dynamodb/tables', {
      method: 'POST',
      body: {
        name,
        partitionKey,
        partitionKeyType,
        sortKey: sortKey || undefined,
        sortKeyType: sortKey ? sortKeyType : undefined,
      } satisfies CreateDynamoDbTableApiRequest,
    })
    toast.add({ title: 'テーブルを作成しました', description: name, color: 'success' })
    isOpen.value = false
    emits('created', name)
  } catch (e) {
    toast.add({
      title: 'テーブルの作成に失敗しました',
      description: e instanceof Error ? e.message : undefined,
      color: 'error',
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <UButton
    icon="i-lucide-plus"
    color="primary"
    @click="openCreateForm"
  >
    テーブル作成
  </UButton>
  <UModal
    v-model:open="isOpen"
    title="DynamoDB テーブル作成"
  >
    <template #body>
      <UForm
        ref="form"
        :schema="createDynamoDbTableApiRequestSchema"
        :state="state"
        class="flex flex-col gap-4"
        @submit="submitCreate"
      >
        <UFormField
          label="テーブル名"
          name="name"
          help="3〜255文字の英数字・アンダースコア・ハイフン・ドット"
          required
        >
          <UInput
            v-model="state.name"
            placeholder="my-table"
            autofocus
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="パーティションキー"
          name="partitionKey"
          required
        >
          <div class="flex gap-2">
            <UInput
              v-model="state.partitionKey"
              placeholder="id"
              class="flex-1"
            />
            <USelect
              v-model="state.partitionKeyType"
              :items="keyTypeItems"
              class="w-36"
            />
          </div>
        </UFormField>

        <UFormField
          label="ソートキー"
          name="sortKey"
          help="省略可"
        >
          <div class="flex gap-2">
            <UInput
              v-model="state.sortKey"
              placeholder="createdAt"
              class="flex-1"
            />
            <USelect
              v-model="state.sortKeyType"
              :items="keyTypeItems"
              :disabled="!state.sortKey"
              class="w-36"
            />
          </div>
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            @click="isOpen = false"
          >
            キャンセル
          </UButton>
          <UButton
            type="submit"
            color="primary"
            :loading="submitting"
            :disabled="!isValid"
          >
            作成
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
