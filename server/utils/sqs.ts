import { SQS } from './aws-sdk-client'
import {
  ListQueuesCommand,
  CreateQueueCommand,
  DeleteQueueCommand,
  GetQueueUrlCommand,
  GetQueueAttributesCommand,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs'
import type { SqsQueue, SqsQueueDetail, SqsMessage } from '#shared/model/sqs'

function extractQueueNameFromUrl(url: string): string {
  const segments = url.split('/')
  return segments[segments.length - 1] ?? url
}

async function resolveQueueUrl(queueName: string): Promise<string> {
  const command = new GetQueueUrlCommand({ QueueName: queueName })
  const response = await SQS.send(command)
  return response.QueueUrl!
}

export async function getQueueList(): Promise<SqsQueue[]> {
  const queues: SqsQueue[] = []
  let nextToken: string | undefined = undefined

  do {
    const command: ListQueuesCommand = new ListQueuesCommand({
      MaxResults: 1000,
      NextToken: nextToken,
    })
    const response = await SQS.send(command)

    for (const url of response.QueueUrls ?? []) {
      const name = extractQueueNameFromUrl(url)
      queues.push({
        Name: name,
        Url: url,
        Type: name.endsWith('.fifo') ? 'fifo' : 'standard',
      })
    }

    nextToken = response.NextToken
  } while (nextToken)

  return queues
}

export async function createQueue(name: string, fifo: boolean, contentBasedDeduplication: boolean) {
  const attributes: Record<string, string> = {}
  if (fifo) {
    attributes.FifoQueue = 'true'
    if (contentBasedDeduplication) {
      attributes.ContentBasedDeduplication = 'true'
    }
  }
  const command = new CreateQueueCommand({
    QueueName: name,
    Attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
  })
  await SQS.send(command)
}

export async function deleteQueue(queueName: string) {
  const url = await resolveQueueUrl(queueName)
  const command = new DeleteQueueCommand({ QueueUrl: url })
  await SQS.send(command)
}

export async function getQueueDetail(queueName: string): Promise<SqsQueueDetail> {
  const url = await resolveQueueUrl(queueName)
  const command = new GetQueueAttributesCommand({
    QueueUrl: url,
    AttributeNames: ['All'],
  })
  const response = await SQS.send(command)
  const attributes = response.Attributes ?? {}
  return {
    Name: queueName,
    Url: url,
    Type: attributes.FifoQueue === 'true' ? 'fifo' : 'standard',
    ContentBasedDeduplication: attributes.ContentBasedDeduplication === 'true',
    ApproximateNumberOfMessages: Number(attributes.ApproximateNumberOfMessages ?? 0),
    ApproximateNumberOfMessagesNotVisible: Number(attributes.ApproximateNumberOfMessagesNotVisible ?? 0),
    VisibilityTimeout: Number(attributes.VisibilityTimeout ?? 0),
  }
}

export async function sendMessage(
  queueName: string,
  body: string,
  options: { messageGroupId?: string, messageDeduplicationId?: string } = {},
) {
  const url = await resolveQueueUrl(queueName)
  const command = new SendMessageCommand({
    QueueUrl: url,
    MessageBody: body,
    MessageGroupId: options.messageGroupId,
    MessageDeduplicationId: options.messageDeduplicationId,
  })
  const response = await SQS.send(command)
  return {
    MessageId: response.MessageId!,
  }
}

export async function receiveMessages(queueName: string, maxNumberOfMessages: number): Promise<SqsMessage[]> {
  const url = await resolveQueueUrl(queueName)
  const command = new ReceiveMessageCommand({
    QueueUrl: url,
    MaxNumberOfMessages: maxNumberOfMessages,
    WaitTimeSeconds: 1,
    AttributeNames: ['All'],
    MessageAttributeNames: ['All'],
  })
  const response = await SQS.send(command)
  return (response.Messages ?? []).map(m => ({
    MessageId: m.MessageId!,
    ReceiptHandle: m.ReceiptHandle!,
    Body: m.Body ?? '',
    SentTimestamp: m.Attributes?.SentTimestamp,
    ApproximateReceiveCount: m.Attributes?.ApproximateReceiveCount,
    MessageGroupId: m.Attributes?.MessageGroupId,
  }))
}

export async function deleteMessage(queueName: string, receiptHandle: string) {
  const url = await resolveQueueUrl(queueName)
  const command = new DeleteMessageCommand({
    QueueUrl: url,
    ReceiptHandle: receiptHandle,
  })
  await SQS.send(command)
}
