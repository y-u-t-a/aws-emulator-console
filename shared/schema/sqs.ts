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

export const deleteSqsQueuesApiRequestSchema = v.object({
  names: v.pipe(
    v.array(v.pipe(v.string(), v.trim(), v.minLength(1))),
    v.minLength(1, '削除するキュー名を指定してください'),
  ),
})

export const sendSqsMessageApiRequestSchema = v.object({
  body: v.pipe(
    v.string(),
    v.minLength(1, 'メッセージ本文を入力してください'),
    v.maxLength(262144, 'メッセージ本文は256KB以内にしてください'),
  ),
  messageGroupId: v.optional(v.pipe(v.string(), v.trim())),
  messageDeduplicationId: v.optional(v.pipe(v.string(), v.trim())),
})

export const receiveSqsMessagesApiRequestSchema = v.object({
  maxNumberOfMessages: v.pipe(
    v.number(),
    v.integer(),
    v.minValue(1),
    v.maxValue(10),
  ),
})

export const deleteSqsMessageApiRequestSchema = v.object({
  receiptHandle: v.pipe(v.string(), v.minLength(1, 'ReceiptHandle が必要です')),
})
