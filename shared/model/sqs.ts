import type * as v from 'valibot'
import type { createSqsQueueApiRequestSchema } from '#shared/schema/sqs'

export type SqsQueue = {
  Name: string
  Url: string
  Type: 'standard' | 'fifo'
}

export type CreateSqsQueueApiRequest = v.InferInput<typeof createSqsQueueApiRequestSchema>
