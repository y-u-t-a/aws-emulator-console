export default defineAppConfig({
  ui: {
    colors: {
      primary: 'orange',
      neutral: 'slate',
    },
    form: {
      base: 'disabled:opacity-40',
    },
    button: {
      slots: {
        base: 'disabled:opacity-40',
      },
    },
    table: {
      slots: {
        td: 'text-default',
      },
    },
    checkbox: {
      slots: {
        base: 'ring-neutral',
      },
    },
  },
})
