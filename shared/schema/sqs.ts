import * as v from 'valibot'

const queueNamePattern = /^[a-zA-Z0-9_-]{1,80}$/
const fifoQueueNamePattern = /^[a-zA-Z0-9_-]{1,75}\.fifo$/

export const createSqsQueueApiRequestSchema = v.pipe(
  v.object({
    name: v.pipe(
      v.string(),
      v.trim(),
      v.minLength(1, 'キュー名を入力してください'),
      v.maxLength(80, 'キュー名は80文字以内で指定してください'),
    ),
    fifo: v.boolean(),
    contentBasedDeduplication: v.optional(v.boolean()),
  }),
  v.forward(
    v.partialCheck(
      [['name'], ['fifo']],
      input => (input.fifo ? fifoQueueNamePattern.test(input.name) : queueNamePattern.test(input.name)),
      'キュー名は英数字・ハイフン・アンダースコアで、FIFOキューは ".fifo" で終わる必要があります',
    ),
    ['name'],
  ),
)
