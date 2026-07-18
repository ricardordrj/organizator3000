import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { FastifyRequest } from 'fastify'
import { env } from '../env.js'

export type Role = 'admin' | 'mesao'

export interface Identity {
  email: string
  role: Role
}

declare module 'fastify' {
  interface FastifyRequest {
    identity?: Identity
  }
}

const adminEmails = new Set(
  env.ADMIN_EMAILS.split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
)

function roleFor(email: string): Role {
  return adminEmails.has(email.toLowerCase()) ? 'admin' : 'mesao'
}

// A verificação do JWT usa as chaves públicas da Cloudflare, buscadas sob
// demanda e cacheadas pela própria lib. Só existe quando o team domain está
// configurado (produção atrás do Zero Trust).
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null
function getJwks() {
  if (!env.CF_ACCESS_TEAM_DOMAIN) return null
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(`https://${env.CF_ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`),
    )
  }
  return jwks
}

function devFallback(): Identity | null {
  if (env.NODE_ENV === 'production') return null
  const email = env.DEV_USER_EMAIL.trim()
  // Sem e-mail de dev configurado, trata como admin pra não travar o dia a dia local.
  if (!email) return { email: 'dev@localhost', role: 'admin' }
  return { email, role: roleFor(email) }
}

/**
 * Descobre quem está fazendo a requisição. Ordem de preferência:
 *  1. JWT assinado da Cloudflare (Cf-Access-Jwt-Assertion), verificado — o
 *     caminho seguro, imune a spoof mesmo se alguém alcançar a origem direto.
 *  2. Header simples Cf-Access-Authenticated-User-Email (quando o JWT não
 *     está configurado; exige travar a origem só nos IPs da Cloudflare).
 *  3. Fallback de desenvolvimento (sem Cloudflare na frente).
 */
export async function resolveIdentity(request: FastifyRequest): Promise<Identity | null> {
  const set = getJwks()
  if (set) {
    const token = request.headers['cf-access-jwt-assertion']
    if (typeof token !== 'string' || !token) return devFallback()
    try {
      const { payload } = await jwtVerify(token, set, {
        issuer: `https://${env.CF_ACCESS_TEAM_DOMAIN}`,
        audience: env.CF_ACCESS_AUD || undefined,
      })
      const email = typeof payload.email === 'string' ? payload.email : ''
      return email ? { email, role: roleFor(email) } : null
    } catch {
      return null
    }
  }

  const headerEmail = request.headers['cf-access-authenticated-user-email']
  if (typeof headerEmail === 'string' && headerEmail) {
    return { email: headerEmail, role: roleFor(headerEmail) }
  }

  return devFallback()
}
