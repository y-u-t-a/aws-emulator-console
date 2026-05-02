import type { MaybeRefOrGetter, Ref, WritableComputedRef } from 'vue'
import type { RowSelectionState } from '@tanstack/vue-table'

export function useTableSelection<T>(
  data: MaybeRefOrGetter<T[]>,
  getKey: (row: T) => string,
  selected?: Ref<T[]>,
): {
  selected: Ref<T[]>
  rowSelection: WritableComputedRef<RowSelectionState>
} {
  const selectedRef = selected ?? ref<T[]>([]) as Ref<T[]>

  const rowSelection = computed<RowSelectionState>({
    get: () => {
      const rows = toValue(data)
      const selectedKeys = new Set(selectedRef.value.map(getKey))
      return Object.fromEntries(
        rows
          .map((row, index) => [index, selectedKeys.has(getKey(row))] as const)
          .filter(([, isSelected]) => isSelected),
      )
    },
    set: (value) => {
      const rows = toValue(data)
      selectedRef.value = Object.keys(value)
        .filter(key => value[key])
        .map(key => rows[Number(key)])
        .filter((row): row is T => row !== undefined)
    },
  })

  return { selected: selectedRef, rowSelection }
}
