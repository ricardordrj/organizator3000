import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  DB_URL: z.string().default('file:./data/app.db'),
  UPLOADS_DIR: z.string().default('./uploads'),
  NODE_ENV: z.string().default('development'),

  // Controle de acesso (ver DEPLOY.md, seção "Proteger o acesso").
  // Admin vê tudo; qualquer outro e-mail autenticado fica preso no mesão.
  // A lista de quem entra no mesão vive no Cloudflare Access, não aqui.
  ADMIN_EMAILS: z.string().default('ricardordrj@gmail.com'),
  // Domínio do time no Zero Trust, ex: "seutime.cloudflareaccess.com".
  // Se preenchido, a identidade vem do JWT assinado (Cf-Access-Jwt-Assertion),
  // verificado contra as chaves públicas da Cloudflare. Caminho recomendado.
  CF_ACCESS_TEAM_DOMAIN: z.string().default(''),
  // "Application Audience (AUD) Tag" da Access Application (aba Overview).
  CF_ACCESS_AUD: z.string().default(''),
  // Só em desenvolvimento: simula o e-mail logado quando não há Cloudflare na frente.
  DEV_USER_EMAIL: z.string().default(''),
})

export const env = envSchema.parse(process.env)
