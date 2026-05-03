import { SQS } from './aws-sdk-client'
import {
  ListQueuesCommand,
  CreateQueueCommand,
} from '@aws-sdk/client-sqs'
import type { SqsQueue } from '#shared/model/sqs'

function extractQueueNameFromUrl(url: string): string {
  const segments = url.split('/')
  return segments[segments.length - 1] ?? url
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
