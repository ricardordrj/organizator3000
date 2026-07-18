import { commanderGameSummarySchema, commanderGameDetailSchema, commanderDamageRequestSchema } from '@/models'
import type {
  CommanderGameSummary,
  CommanderGameDetail,
  CommanderDamageRequest,
  CreateCommanderGameInput,
  CreateCommanderDamageRequestInput,
  ResolveCommanderDamageRequestInput,
} from '@/models'
import { apiClient } from './apiClient'

export const commanderGameService = {
  async list(status?: 'active' | 'ended'): Promise<CommanderGameSummary[]> {
    const query = status ? `?status=${status}` : ''
    const raw = await apiClient.get<unknown[]>(`/commander-games${query}`)
    return raw.map((g) => commanderGameSummarySchema.parse(g))
  },

  async create(input: CreateCommanderGameInput): Promise<CommanderGameDetail> {
    const raw = await apiClient.post<unknown>('/commander-games', input)
    return commanderGameDetailSchema.parse(raw)
  },

  async getDetail(id: string): Promise<CommanderGameDetail> {
    const raw = await apiClient.get<unknown>(`/commander-games/${id}`)
    return commanderGameDetailSchema.parse(raw)
  },

  async end(id: string): Promise<CommanderGameDetail> {
    const raw = await apiClient.post<unknown>(`/commander-games/${id}/end`)
    return commanderGameDetailSchema.parse(raw)
  },

  async createDamageRequest(gameId: string, input: CreateCommanderDamageRequestInput): Promise<CommanderDamageRequest> {
    const raw = await apiClient.post<unknown>(`/commander-games/${gameId}/damage-requests`, input)
    return commanderDamageRequestSchema.parse(raw)
  },

  async resolveDamageRequest(
    gameId: string,
    requestId: string,
    input: ResolveCommanderDamageRequestInput,
  ): Promise<CommanderDamageRequest> {
    const raw = await apiClient.patch<unknown>(`/commander-games/${gameId}/damage-requests/${requestId}`, input)
    return commanderDamageRequestSchema.parse(raw)
  },
}
