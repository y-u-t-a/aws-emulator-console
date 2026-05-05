import { expect, test, type Page } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

async function createBucket(page: Page, bucketName: string) {
  await page.getByRole('button', { name: 'バケット作成' }).click()
  await page.getByRole('textbox').fill(bucketName)
  await page.getByRole('button', { name: '作成' }).click()
  await expect(page.getByRole('cell', { name: bucketName })).toBeVisible()
}

async function navigateToBucket(page: Page, bucketName: string) {
  await page.getByRole('cell', { name: bucketName }).getByRole('link').click()
  await expect(page).toHaveURL(`/s3/${bucketName}`)
}

test.describe('S3', () => {
  let bucketName: string
  let folderName: string

  test.beforeEach(async ({ page }) => {
    const id = Date.now()
    bucketName = `test-bucket-${id}`
    folderName = `test-folder-${id}`
    await page.goto('/s3')
  })

  test('バケット作成', async ({ page }) => {
    await createBucket(page, bucketName)
  })

  test('フォルダ作成', async ({ page }) => {
    await createBucket(page, bucketName)
    await navigateToBucket(page, bucketName)

    await page.getByRole('button', { name: 'フォルダ作成' }).click()
    await page.getByRole('textbox').fill(folderName)
    await page.getByRole('button', { name: '作成' }).click()

    await expect(page.getByRole('cell', { name: `${folderName}/` })).toBeVisible()
  })

  test('ファイルアップロード', async ({ page }) => {
    const fileName = `test-file-${Date.now()}.txt`
    const filePath = join(tmpdir(), fileName)
    writeFileSync(filePath, 'hello playwright')

    await createBucket(page, bucketName)
    await navigateToBucket(page, bucketName)

    await page.getByRole('button', { name: 'アップロード' }).click()
    await page.locator('input[type="file"]').setInputFiles(filePath)
    await page.getByRole('dialog').getByRole('button', { name: 'アップロード' }).click()

    await expect(page.getByRole('cell', { name: fileName })).toBeVisible()
  })

  test('バケット削除', async ({ page }) => {
    await createBucket(page, bucketName)

    await page.getByRole('row', { name: bucketName }).getByRole('checkbox').check()
    await page.getByRole('button', { name: 'バケット削除' }).click()
    await page.getByRole('dialog').getByRole('button', { name: '削除' }).click()

    await expect(page.getByRole('cell', { name: bucketName })).not.toBeVisible()
  })
})
