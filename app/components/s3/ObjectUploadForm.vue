<script setup lang="ts">
const props = defineProps<{
  bucketName: string
  prefix: string
}>()

const emits = defineEmits<{
  uploaded: []
}>()

const toast = useToast()

const isOpen = ref(false)
const submitting = ref(false)
const isDragging = ref(false)
const files = ref<File[]>([])
const inputRef = useTemplateRef<HTMLInputElement>('input')

function openForm() {
  files.value = []
  isOpen.value = true
}

function addFiles(list: FileList | File[] | null | undefined) {
  if (!list) return
  const incoming = Array.from(list)
  if (incoming.length === 0) return
  const existing = new Set(files.value.map(f => f.name))
  for (const f of incoming) {
    if (!existing.has(f.name)) {
      files.value.push(f)
      existing.add(f.name)
    }
  }
}

function onSelect(event: Event) {
  const target = event.target as HTMLInputElement
  addFiles(target.files)
  target.value = ''
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  addFiles(event.dataTransfer?.files)
}

function onDragOver() {
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function removeFile(index: number) {
  files.value.splice(index, 1)
}

async function submitUpload() {
  if (files.value.length === 0) return
  submitting.value = true
  const succeeded: string[] = []
  const failed: { name: string, message: string }[] = []
  await Promise.all(files.value.map(async (file) => {
    const form = new FormData()
    form.append('prefix', props.prefix)
    form.append('file', file, file.name)
    try {
      const url: string = `/api/s3/${props.bucketName}/objects`
      await $fetch(url, {
        method: 'POST',
        body: form,
      })
      succeeded.push(file.name)
    } catch (e) {
      failed.push({ name: file.name, message: e instanceof Error ? e.message : '不明なエラー' })
    }
  }))
  submitting.value = false

  if (succeeded.length > 0) {
    toast.add({
      title: 'ファイルをアップロードしました',
      description: succeeded.join(', '),
      color: 'success',
    })
  }
  if (failed.length > 0) {
    toast.add({
      title: 'ファイルのアップロードに失敗しました',
      description: failed.map(f => `${f.name}: ${f.message}`).join('\n'),
      color: 'error',
    })
  }

  if (failed.length === 0) {
    isOpen.value = false
  } else {
    files.value = files.value.filter(f => failed.some(x => x.name === f.name))
  }
  emits('uploaded')
}
</script>

<template>
  <UButton
    icon="i-lucide-upload"
    color="primary"
    @click="openForm"
  >
    アップロード
  </UButton>
  <UModal
    v-model:open="isOpen"
    title="ファイルアップロード"
  >
    <template #body>
      <p class="mb-3 text-sm text-neutral-500">
        アップロード先: {{ bucketName }}/{{ prefix }}
      </p>
      <div
        class="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors"
        :class="isDragging ? 'border-primary bg-primary-50 dark:bg-primary-950' : 'border-neutral-300 dark:border-neutral-700'"
        @dragover.prevent="onDragOver"
        @dragenter.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
      >
        <UIcon
          name="i-lucide-upload-cloud"
          class="size-10 text-neutral-400"
        />
        <p class="text-sm text-neutral-600 dark:text-neutral-300">
          ここにファイルをドラッグ＆ドロップ
        </p>
        <input
          ref="input"
          type="file"
          multiple
          class="hidden"
          @change="onSelect"
        >
        <UButton
          type="button"
          color="neutral"
          variant="outline"
          @click="inputRef?.click()"
        >
          ファイルを選択
        </UButton>
      </div>
      <ul
        v-if="files.length > 0"
        class="mt-4 max-h-48 overflow-y-auto rounded border border-neutral-200 dark:border-neutral-800"
      >
        <li
          v-for="(file, index) in files"
          :key="file.name"
          class="flex items-center justify-between gap-2 border-b border-neutral-200 px-3 py-2 last:border-b-0 dark:border-neutral-800"
        >
          <div class="flex min-w-0 items-center gap-2">
            <UIcon
              name="i-lucide-file"
              class="shrink-0"
            />
            <span class="truncate text-sm">{{ file.name }}</span>
            <span class="shrink-0 text-xs text-neutral-500">{{ formatSize(file.size) }}</span>
          </div>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="xs"
            :disabled="submitting"
            @click="removeFile(index)"
          />
        </li>
      </ul>
      <div class="mt-4 flex justify-end gap-2">
        <UButton
          type="button"
          color="neutral"
          variant="ghost"
          :disabled="submitting"
          @click="isOpen = false"
        >
          キャンセル
        </UButton>
        <UButton
          type="button"
          color="primary"
          :loading="submitting"
          :disabled="files.length === 0"
          @click="submitUpload"
        >
          アップロード
        </UButton>
      </div>
    </template>
  </UModal>
</template>
