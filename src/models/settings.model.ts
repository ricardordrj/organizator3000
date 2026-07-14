import { z } from 'zod'

export const themeSchema = z.enum(['light', 'dark', 'system'])
export type Theme = z.infer<typeof themeSchema>

export const appSettingsSchema = z.object({
  theme: themeSchema.default('system'),
  language: z.enum(['pt-BR', 'en-US']).default('pt-BR'),
})
export type AppSettings = z.infer<typeof appSettingsSchema>

export const defaultAppSettings: AppSettings = appSettingsSchema.parse({})
