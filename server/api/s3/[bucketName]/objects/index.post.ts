import { uploadObject } from '#server/utils/s3'

export default defineEventHandler(async (event) => {
  const bucketName = getRouterParam(event, 'bucketName')

  if (!bucketName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'バケット名を指定してください',
    })
  }

  const parts = await readMultipartFormData(event)
  if (!parts || parts.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'アップロードするファイルが指定されていません',
    })
  }

  const prefixPart = parts.find(p => p.name === 'prefix')
  const prefix = prefixPart?.data ? prefixPart.data.toString('utf8') : ''
  const normalizedPrefix = !prefix || prefix.endsWith('/') ? prefix : `${prefix}/`

  const filePart = parts.find(p => p.name === 'file')
  if (!filePart || !filePart.filename) {
    throw createError({
      statusCode: 400,
      statusMessage: 'アップロードするファイルが指定されていません',
    })
  }

  const key = `${normalizedPrefix}${filePart.filename}`

  try {
    await uploadObject(bucketName, key, filePart.data, filePart.type)
    return { key }
  } catch (e) {
    throw createError({
      statusCode: 500,
      statusMessage: e instanceof Error ? e.message : 'ファイルのアップロードに失敗しました',
    })
  }
})
