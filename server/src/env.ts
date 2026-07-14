import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  DB_URL: z.string().default('file:./data/app.db'),
  UPLOADS_DIR: z.string().default('./uploads'),
  NODE_ENV: z.string().default('development'),
})

export const env = envSchema.parse(process.env)
