import { expect, test, type Page } from '@playwright/test'

async function createQueue(page: Page, queueName: string) {
  await page.getByRole('button', { name: 'キュー作成' }).click()
  await page.getByRole('textbox', { name: 'キュー名' }).fill(queueName)
  await page.getByRole('button', { name: '作成' }).click()
  await expect(page.getByRole('cell', { name: queueName }).nth(0)).toBeVisible()
}

async function navigateToQueue(page: Page, queueName: string) {
  await page.getByRole('cell', { name: queueName }).getByRole('link').click()
  await expect(page).toHaveURL(`/sqs/${queueName}`)
}

test.describe('SQS', () => {
  let queueName: string

  test.beforeEach(async ({ page }) => {
    queueName = `test-queue-${Date.now()}`
    await page.goto('/sqs')
  })

  test('キュー作成', async ({ page }) => {
    await createQueue(page, queueName)
  })

  test('メッセージ送受信', async ({ page }) => {
    const messageBody = 'hello sqs'

    await createQueue(page, queueName)
    await navigateToQueue(page, queueName)

    await page.getByRole('button', { name: 'メッセージ送信' }).click()
    await page.getByRole('dialog').locator('textarea').fill(messageBody)
    await page.getByRole('dialog').getByRole('button', { name: '送信' }).click()

    await page.getByRole('button', { name: 'メッセージ受信' }).click()

    await expect(page.locator('pre').filter({ hasText: messageBody })).toBeVisible()
  })

  test('キュー削除', async ({ page }) => {
    await createQueue(page, queueName)

    await page.getByRole('row', { name: queueName }).getByRole('checkbox').check()
    await page.getByRole('button', { name: 'キュー削除' }).click()
    await page.getByRole('dialog').getByRole('button', { name: '削除' }).click()

    await expect(page.getByRole('cell', { name: queueName })).not.toBeVisible()
  })
})
