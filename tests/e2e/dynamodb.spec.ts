import { expect, test, type Page } from '@playwright/test'

async function navigateToTable(page: Page, tableName: string) {
  await page.getByRole('cell', { name: tableName }).getByRole('link').click()
  await expect(page).toHaveURL(`/dynamodb/${tableName}`)
}

async function createTable(page: Page, tableName: string, pk: string) {
  await page.getByRole('button', { name: 'テーブル作成' }).click()
  await page.getByRole('textbox', { name: 'テーブル名' }).fill(tableName)
  await page.getByRole('textbox', { name: 'パーティションキー' }).fill(pk)
  await page.getByRole('dialog').getByRole('button', { name: '作成' }).click()
  await expect(page.getByRole('cell', { name: tableName }).nth(0)).toBeVisible()
}

async function createItem(page: Page, tableName: string, key: string, value: string) {
  await page.getByRole('link', { name: 'アイテム作成' }).click()
  await expect(page).toHaveURL(`/dynamodb/${tableName}/items/new`)
  await page.locator(`[name="${key}"]`).fill(value)
  await page.getByRole('button', { name: '作成' }).click()
  await expect(page).toHaveURL(`/dynamodb/${tableName}`)
}

test.describe('DynamoDB', () => {
  let tableName: string
  let pk: string

  test.beforeEach(async ({ page }) => {
    tableName = `test-table-${Date.now()}`
    pk = 'id'
    await page.goto('/dynamodb')
  })

  test('テーブル作成', async ({ page }) => {
    await createTable(page, tableName, pk)
  })

  test('アイテム作成と検索', async ({ page }) => {
    await createTable(page, tableName, pk)
    await navigateToTable(page, tableName)
    await createItem(page, tableName, pk, 'item-001')

    // Scan
    await page.getByRole('button', { name: 'Scan 実行' }).click()
    await expect(page.getByRole('cell', { name: 'item-001' })).toBeVisible()

    // Query
    await page.getByRole('tab', { name: 'Query' }).click()
    await page.locator(`[name="${pk}"]`).fill('item-001')
    await page.getByRole('button', { name: 'Query 実行' }).click()
    await expect(page.getByRole('cell', { name: 'item-001' })).toBeVisible()
  })

  test('アイテム削除', async ({ page }) => {
    await createTable(page, tableName, pk)
    await navigateToTable(page, tableName)
    await createItem(page, tableName, pk, 'item-to-delete')

    await page.getByRole('button', { name: 'Scan 実行' }).click()
    await expect(page.getByRole('cell', { name: 'item-to-delete' })).toBeVisible()

    await page.getByRole('row', { name: 'item-to-delete' }).getByRole('checkbox').check()
    await page.getByRole('button', { name: '削除' }).click()
    await page.getByRole('dialog').getByRole('button', { name: '削除' }).click()

    await expect(page.getByRole('cell', { name: 'item-to-delete' })).not.toBeVisible()
  })

  test('テーブル削除', async ({ page }) => {
    await createTable(page, tableName, pk)

    await page.getByRole('row', { name: tableName }).getByRole('checkbox').check()
    await page.getByRole('button', { name: 'テーブル削除' }).click()
    await page.getByRole('dialog').getByRole('button', { name: '削除' }).click()

    await expect(page.getByRole('cell', { name: tableName })).not.toBeVisible()
  })
})
