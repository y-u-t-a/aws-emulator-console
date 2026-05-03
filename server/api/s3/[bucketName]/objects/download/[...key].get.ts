import { downloadObject } from '#server/utils/s3'

export default defineEventHandler(async (event) => {
  const bucketName = getRouterParam(event, 'bucketName')
  const rawKey = getRouterParam(event, 'key')

  if (!bucketName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'バケット名を指定してください',
    })
  }

  if (!rawKey) {
    throw createError({
      statusCode: 400,
      statusMessage: 'オブジェクトキーを指定してください',
    })
  }

  const key = decodeURIComponent(rawKey)

  if (key.endsWith('/')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'フォルダはダウンロードできません',
    })
  }

  try {
    const { body, contentType, contentLength } = await downloadObject(bucketName, key)
    const filename = key.split('/').pop() || key

    setHeader(event, 'Content-Type', contentType ?? 'application/octet-stream')
    if (contentLength !== undefined) {
      setHeader(event, 'Content-Length', contentLength)
    }
    setHeader(
      event,
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    )

    return sendStream(event, body)
  } catch (e) {
    throw createError({
      statusCode: 500,
      statusMessage: e instanceof Error ? e.message : 'ファイルのダウンロードに失敗しました',
    })
  }
})
