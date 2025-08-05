import { createError, sendStream } from 'h3'
import { createReadStream, existsSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  // @ts-expect-error
  const fileName = event.context.params.name
  const filePath = join(process.cwd(), 'assets/json', fileName)

  if (!existsSync(filePath)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tài nguyên không tồn tại'
    })
  }
  
  setHeader(event, 'Content-Disposition', `attachment; filename="${fileName}"`)
  return sendStream(event, createReadStream(filePath))
})

