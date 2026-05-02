import { UCheckbox } from '#components'
import type { TableColumn } from '@nuxt/ui'

export function createSelectColumn<T>(): TableColumn<T> {
  return {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        'modelValue': table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: unknown) =>
          table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'すべての行を選択',
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': (value: unknown) =>
          row.toggleSelected(!!value),
        'aria-label': '行を選択',
      }),
  }
}
