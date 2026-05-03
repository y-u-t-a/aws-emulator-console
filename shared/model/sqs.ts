import type * as v from 'valibot'
import type {
  createSqsQueueApiRequestSchema,
  deleteSqsQueuesApiRequestSchema,
  sendSqsMessageApiRequestSchema,
  receiveSqsMessagesApiRequestSchema,
  deleteSqsMessageApiRequestSchema,
} from '#shared/schema/sqs'

export type SqsQueue = {
  Name: string
  Url: string
  Type: 'standard' | 'fifo'
  ApproximateNumberOfMessages: number
  ApproximateNumberOfMessagesNotVisible: number
  ApproximateNumberOfMessagesDelayed: number
}

export type SqsQueueDetail = SqsQueue & {
  ContentBasedDeduplication: boolean
  VisibilityTimeout: number
}

export type SqsMessage = {
  MessageId: string
  ReceiptHandle: string
  Body: string
  SentTimestamp?: string
  ApproximateReceiveCount?: string
  MessageGroupId?: string
}

export type CreateSqsQueueApiRequest = v.InferInput<typeof createSqsQueueApiRequestSchema>
export type DeleteSqsQueuesApiRequest = v.InferInput<typeof deleteSqsQueuesApiRequestSchema>
export type SendSqsMessageApiRequest = v.InferInput<typeof sendSqsMessageApiRequestSchema>
export type ReceiveSqsMessagesApiRequest = v.InferInput<typeof receiveSqsMessagesApiRequestSchema>
export type DeleteSqsMessageApiRequest = v.InferInput<typeof deleteSqsMessageApiRequestSchema>
