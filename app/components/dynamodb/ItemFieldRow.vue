<script setup lang="ts">
export type FieldType = 'S' | 'N' | 'BOOL' | 'NULL'
export type Field = { key: string, type: FieldType, value: string }

const field = defineModel<Field>({ required: true })

defineProps<{
  keyFixed: boolean
}>()

defineEmits<{
  remove: []
}>()

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

const keyTouched = ref(false)
const valueTouched = ref(false)

const keyError = computed(() =>
  keyTouched.value && field.value.key.trim() === '' ? 'キー名を入力してください' : null,
)

const valueError = computed(() => {
  if (!valueTouched.value) return null
  if (field.value.type === 'N') {
    if (field.value.value.trim() === '') return '値を入力してください'
    if (Number.isNaN(Number(field.value.value))) return '数値を入力してください'
  } else if (field.value.type !== 'NULL' && field.value.type !== 'BOOL' && field.value.value.trim() === '') {
    return '値を入力してください'
  }
  return null
})

watch(() => field.value.type, (type) => {
  if (type === 'NULL') field.value = { ...field.value, value: '' }
})

const hasError = computed(() => keyError.value !== null || valueError.value !== null)

function touchAll() {
  keyTouched.value = true
  valueTouched.value = true
}

defineExpose({ hasError, touchAll })
</script>

<template>
  <div class="flex items-start gap-2">
    <UFormField :error="keyError ?? undefined">
      <UInput
        v-model="field.key"
        name="key"
        placeholder="キー名"
        :disabled="keyFixed"
        :color="keyError ? 'error' : undefined"
        class="w-full"
        @input="keyTouched = true"
        @blur="keyTouched = true"
      />
    </UFormField>
    <UFormField>
      <USelect
        v-model="field.type"
        :items="typeItems"
        class="w-full"
      />
    </UFormField>
    <UFormField
      :name="field.key || undefined"
      :error="valueError ?? undefined"
    >
      <USelect
        v-if="field.type === 'BOOL'"
        v-model="field.value"
        :items="boolItems"
        class="w-full"
      />
      <UInput
        v-else
        v-model="field.value"
        :placeholder="field.type === 'N' ? '0' : field.type === 'NULL' ? 'null' : '値'"
        :readonly="field.type === 'NULL'"
        :color="valueError ? 'error' : undefined"
        class="w-full"
        @input="valueTouched = true"
        @blur="valueTouched = true"
      />
    </UFormField>
    <UFormField>
      <UButton
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        size="sm"
        :disabled="keyFixed"
        @click="$emit('remove')"
      />
    </UFormField>
  </div>
</template>
