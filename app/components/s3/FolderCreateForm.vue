<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import { createS3FolderApiRequestSchema } from '#shared/schema/s3'
import type { CreateS3FolderApiRequest } from '#shared/model/s3'

const props = defineProps<{
  bucketName: string
  objectKeys: string[]
}>()

const emits = defineEmits<{
  created: [folderName: string]
}>()

const toast = useToast()

const isOpen = ref(false)
const state = reactive<CreateS3FolderApiRequest>({
  bucketName: props.bucketName,
  prefix: '',
  folderName: '',
})
const submitting = ref(false)
const formRef = useTemplateRef<Form<CreateS3FolderApiRequest>>('form')
const isValid = computed(() => formRef.value?.getErrors().length === 0)

function openCreateForm() {
  state.bucketName = props.bucketName
  state.prefix = props.objectKeys.length === 0 ? '' : `${props.objectKeys.join('/')}/`
  state.folderName = ''
  isOpen.value = true
}

async function submitCreate(event: FormSubmitEvent<CreateS3FolderApiRequest>) {
  const { bucketName, prefix, folderName } = event.data
  submitting.value = true
  try {
    await $fetch(`/api/s3/${bucketName}/folders`, {
      method: 'POST',
      body: { bucketName, prefix, folderName } satisfies CreateS3FolderApiRequest,
    })
    toast.add({ title: 'フォルダを作成しました', description: folderName, color: 'success' })
    isOpen.value = false
    emits('created', folderName)
  } catch (e) {
    toast.add({
      title: 'フォルダの作成に失敗しました',
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
    icon="i-lucide-folder-plus"
    color="primary"
    @click="openCreateForm"
  >
    フォルダ作成
  </UButton>
  <UModal
    v-model:open="isOpen"
    title="フォルダ作成"
  >
    <template #body>
      <UForm
        ref="form"
        :schema="createS3FolderApiRequestSchema"
        :state="state"
        @submit="submitCreate"
      >
        <UFormField
          label="フォルダ名"
          name="folderName"
          help="255文字以内、 &quot;/&quot; は含められません"
          required
        >
          <UInput
            v-model="state.folderName"
            placeholder="my-folder"
            autofocus
            class="w-full"
          />
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
